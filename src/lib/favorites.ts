import type { Community } from 'lemmy-js-client'
import { 
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



export const saveProfile = function(userProfile:Profile):void {
    let pd = get(profileData)

    let pIndex = pd.profiles.findIndex((p:Profile) => p.id == pd.profile)
    
    userProfile.user = undefined;

    // Update the profile in the profileData object in localStorage
    profileData.update((pd:ProfileData) => {
        let newProfileData:ProfileData = {...pd}
        
        newProfileData.profiles[pIndex] = {...userProfile}
        
        return { ...newProfileData}
    })
}

