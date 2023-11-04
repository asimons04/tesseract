import { 
    type Profile, 
    type ProfileData,
    getProfile, 
    profile, 
    profileData 
} from '$lib/auth.js'

import { get } from 'svelte/store'

// Add a favorite community to your profile 
export const addFavorite = function(community_id:number):boolean {
    if (!community_id) return false;

    // Read the current user profile
    const userProfile = get(profile)

    if (!userProfile?.jwt) return false;
    
    // Read the profileData object and find the index of the current profile
    let pd = get(profileData);
    let pIndex = pd.profiles.findIndex((p:Profile) => p.id == pd.profile);

    // Create favorities array in profile object if doesn't exist
    if (!userProfile.favorites) userProfile.favorites = [] as number[];

    //Append the community ID if it's not already present
    if (userProfile.favorites.findIndex((c:number) => c==community_id) < 0) {
        userProfile.favorites.push(community_id);
        
        // Update the profile's store only with the new favorites
        profile.set({
            ...profile,
            favorites: [...userProfile.favorites]
        })

        // Update the profile in the profileData object in localStorage
        saveProfile(userProfile)

        console.log("Added favorite");
    }
    else {
        console.log("Favorite exists; skipping");
    }
    return true

}

export const saveProfile = function(userProfile:Profile):void {
    let pd = get(profileData);

    let pIndex = pd.profiles.findIndex((p:Profile) => p.id == pd.profile);
    
    // Update the profile in the profileData object in localStorage
    profileData.update((pd:ProfileData) => {
        let newProfileData:ProfileData = {...pd};
        newProfileData.profiles[pIndex] = {...userProfile}
        
        return { ...newProfileData}
    })
}