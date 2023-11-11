import type { Community } from 'lemmy-js-client'
import { 
    type CommunityGroup,
    type Profile, 
    type ProfileData,
    profile, 
    profileData 
} from '$lib/auth.js'

import { get } from 'svelte/store'

// Add a favorite community to your profile 
export const addFavorite = function(community:Community, favorite:boolean) {
    // Read the current user profile
    const userProfile = get(profile)
    
    if (!community) return 
    if (!userProfile?.jwt) return
    if (!userProfile.favorites) userProfile.favorites = [] as Community[]
    
    let index = userProfile.favorites.findIndex((c:Community) => c.id==community.id)

    if (favorite && index < 0) {
        userProfile.favorites.push(community)
        
        profile.set({
            ...userProfile
        })

        // Update the profile in the profileData object in localStorage
        saveProfile(userProfile)
        console.log("Added favorite")
    }
    else {
        // Un-favorite the community
        if (index < 0) return
        userProfile.favorites.splice(index,1);
        
        profile.set({
            ...userProfile
        })
    
        saveProfile(userProfile)
        console.log("Deleted favorite");
    }
    
}

export const isFavorite = function(community:Community):boolean {
    // Read the current user profile
    const userProfile = get(profile)
    
    if (!community) return false
    if (!userProfile?.jwt) return false
    if (!userProfile.favorites) return false
    if (userProfile.favorites.findIndex((c:Community) => c.id==community.id) >= 0) return true;
    return false;
}


// Create a group and optionally add communities to it.
export const addGroup = function(name:string, communities:Community[] = [] as CommunityGroup):void {
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

    if (!community) return
    if (!userProfile?.jwt) return
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
    console.log("Added community to group");
}


export const memberOf = function(community:Community): string[] {
    
    
    const userProfile = get(profile)
    
    if (!community) return [];
    if (!userProfile?.jwt) return []
    if (!userProfile.groups) {
        userProfile.groups = [] as CommunityGroup[]
        return []
    }

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
    
    // Don't store the 'user' key that has the user's Lemmy API profile data.
    userProfile.user = undefined;

    // Update the profile in the profileData object in localStorage
    profileData.update((pd:ProfileData) => {
        let newProfileData:ProfileData = {...pd}
        
        newProfileData.profiles[pIndex] = {...userProfile}
        
        return { ...newProfileData}
    })
}

