import type { Community } from 'lemmy-js-client'
import { 
    type CommunityGroup,
    type Profile, 
    type ProfileData,
    profile, 
    profileData 
} from '$lib/auth.js'

import { get } from 'svelte/store'

// Alphabetically sorts either an array of group names or an array of CommunityGroups objects
export function sortGroups(a:string|CommunityGroup|Community, b:string|CommunityGroup|Community): number {
    
    if (typeof a == 'string') {
        if ((a as string).toLowerCase() < (b as string).toLowerCase()) return -1
        if ((a as string).toLowerCase() > (b as string).toLowerCase()) return 1
        if ((a as string).toLowerCase() == (b as string).toLowerCase()) return 0
    }

    if (typeof a == 'object') {
        if ((a as CommunityGroup|Community).name.toLowerCase() < (b as CommunityGroup|Community).name.toLowerCase()) return -1
        if ((a as CommunityGroup|Community).name.toLowerCase() > (b as CommunityGroup|Community).name.toLowerCase()) return 1
        if ((a as CommunityGroup|Community).name.toLowerCase() == (b as CommunityGroup|Community).name.toLowerCase()) return 0
    }
    return 0
}

export function sortCommunities(a:Community, b:Community) {
    return a.title.localeCompare(b.title)
}


// Returns the index of a group given its name as a parameter (case-insensitive)
export const getGroupIndex = function (groupName:string):number {
    const userProfile = get(profile)

    if (!groupName) return -1
    if (!userProfile?.groups) return -1

    return userProfile.groups.findIndex((cg:CommunityGroup) => cg.name.toLowerCase() == groupName.toLowerCase())
}

export const getGroup = function (group:number|string): CommunityGroup|undefined {
    const userProfile = get(profile)
    if (!userProfile?.groups) return undefined

    if (typeof group == 'number' && userProfile.groups[group]) return userProfile.groups[group]
    if (typeof group == 'number') return undefined
   
    let index = getGroupIndex(group);
    if (index < 0) return undefined
    return userProfile.groups[index] || undefined
}


export const groupExists = function(groupName:string):boolean {
    return getGroupIndex(groupName) >= 0
    
}

// Add a favorite community to your profile 
export const addFavorite = function(community:Community, favorite:boolean): void {
    favorite
        ? addCommunityToGroup(community, 'Favorites')
        : removeCommunityFromGroup(community, 'Favorites')
}

export const isFavorite = function(community:Community):boolean {
    return memberOf(community).includes('Favorites')
}


// Create a group and optionally add communities to it.
export const addGroup = function(name:string, communities:Community[] = [] as Community[]):void {
    // Read the current user profile
    const userProfile = get(profile)
    
    if (!name) return 
    if (!userProfile?.jwt) return
    if (!userProfile.groups) userProfile.groups = [] as CommunityGroup[]
    
    // Check for duplicate group and return early if exists
    let index = userProfile.groups.findIndex((cg:CommunityGroup) => cg.name.toLowerCase() == name.toLowerCase())
    if (index >=0) return

    if (name) {
        let newGroup:CommunityGroup = {
            name: name.slice(0,25),
            communities: [...communities]
        }
        
        userProfile.groups.push(newGroup)
        
        profile.set({
            ...userProfile
        })

        // Update the profile in the profileData object in localStorage
        saveProfile(userProfile)
        console.log("Added group")
    }
}


// Add a community to a group. Create the group if it doesn't exist.
export const addCommunityToGroup = function (community:Community, groupName:string='Misc'):void {
    // Read the current user profile
    const userProfile = get(profile)

    if (!community || !userProfile?.jwt) return
    if (!userProfile.groups) userProfile.groups = [] as CommunityGroup[]

    // Check to see if the group already exists
    let groupIndex = userProfile.groups.findIndex((cg:CommunityGroup) => cg.name.toLowerCase() == groupName.toLowerCase())
    
    // If group doesn't exist, call addGroup to create it and pass the community to add it at the same time.
    if (groupIndex < 0) {
        addGroup(groupName, [community]);
        return;
    }

    // Check if the community is already part of that group
    let group = userProfile.groups[groupIndex]
    let communityIndex  = group.communities.findIndex((c:Community) => c.id == community.id)
    
    if (communityIndex < 0) group.communities.push(community);

    profile.set({...userProfile})
    saveProfile(userProfile)
}

export const removeCommunityFromGroup = function(community:Community, groupName:string):void {
    const userProfile = get(profile)
    if (!community || !userProfile?.jwt) return
    if (!userProfile.groups) userProfile.groups = [] as CommunityGroup[]
    
    // Check if group exists
    let groupIndex = userProfile.groups.findIndex((cg:CommunityGroup) => cg.name.toLowerCase() == groupName.toLowerCase())
    if (groupIndex < 0) return

    let group = userProfile.groups[groupIndex]
    let communityIndex  = group.communities.findIndex((c:Community) => c.id == community.id)

    if (communityIndex >= 0) group.communities.splice(communityIndex, 1);

    profile.set({...userProfile})
    saveProfile(userProfile);
}


export const updateGroup = function(oldGroup:CommunityGroup, newGroup:CommunityGroup):boolean {
    const userProfile = get(profile)
    if(!userProfile || !userProfile.groups || !oldGroup || !newGroup) return false
    
    let index = getGroupIndex(oldGroup.name);
    if (index < 0) return false

    userProfile.groups[index] = {...newGroup}
    profile.set({...userProfile})
    saveProfile(userProfile)

    return true

}


// Removes a group and all of its communities
export const removeGroup = function (groupName:string):void {
    const userProfile = get(profile)
    if (!groupName || !userProfile?.jwt || !userProfile.groups ) return

    let groupIndex = userProfile.groups.findIndex((cg:CommunityGroup) => cg.name.toLowerCase() == groupName.toLowerCase())
    if (groupIndex < 0) return
    
    userProfile.groups.splice(groupIndex, 1);
    profile.set({...userProfile})
    saveProfile(userProfile)
}

// Returns the group names a community is currently a member of (or empty array if none)
export const memberOf = function(community:Community): string[] {
    const userProfile = get(profile)
    
    if (!community || !userProfile?.jwt || !userProfile.groups) return [];

    let groups = userProfile.groups;
    let memberOfGroups:string[] = [];

    groups.forEach((group:CommunityGroup) => {
        let index = group.communities.findIndex((c:Community) => c.id == community.id);
        if (index >=0) memberOfGroups.push(group.name);
    })

    return memberOfGroups.sort();
}

// Saves the profile back to the profileData object in localStorage.
export const saveProfile = function(userProfile:Profile):void {
    let pd = get(profileData)
    let pIndex = pd.profiles.findIndex((p:Profile) => p.id == pd.profile)

    let profileCopy = {...userProfile}
    // Don't store the 'user' key that has the user's Lemmy API profile data.
    profileCopy.user = undefined;

    // Update the profile in the profileData object in localStorage
    profileData.update((pd:ProfileData) => {
        let newProfileData:ProfileData = {...pd}
        
        newProfileData.profiles[pIndex] = {...profileCopy}
        
        return { ...newProfileData}
    })
}

