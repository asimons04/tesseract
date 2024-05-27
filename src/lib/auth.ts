import type { Community, GetSiteResponse, MyUserInfo, SortType } from 'lemmy-js-client'

import { amModOfAny, isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
import { DEFAULT_INSTANCE_URL, instance } from '$lib/instance.js'
import { get, writable } from 'svelte/store'
import { getClient, site } from '$lib/lemmy.js'
import { getInbox, getInboxItemPublished } from '$lib/lemmy/inbox.js'
import { goto } from '$app/navigation'
import { moveItem } from '$lib/util.js'
import { userSettings } from '$lib/settings.js'
import { toast } from '$lib/components/ui/toasts/toasts.js'

export interface CommunityGroup {
    name:string,
    icon?:string,
    communities:Community[],
    sort?: SortType,
}


// What gets stored in localstorage.
export interface ProfileData {
    profiles: Profile[]
    profile: number
    defaultInstance?: string
}

export interface PersonData extends MyUserInfo {
    unreads: number
    reports: number
    registration_applications: number
}

export interface Profile {
    id: number
    instance: string
    jwt?: string
    user?: PersonData
    avatar?: string
    username?: string
    favorites?: Community[]
    groups?: CommunityGroup[]
    color?: string
}


const getDefaultProfile = (): Profile => ({
    id: -1,
    instance: get(profileData)?.defaultInstance ?? get(instance),
})

function getFromStorage<T>(key: string): T | undefined {
    if (typeof localStorage == 'undefined') return undefined
    const lc = localStorage.getItem(key)
    if (!lc) return undefined
    return JSON.parse(lc)
}

function saveToStorage(key: string, item: any, stringify: boolean = true) {
    if (typeof localStorage == 'undefined') return
    return localStorage.setItem(key, stringify ? JSON.stringify(item) : item)
}




// Initialize profileData store with either the content of localStorave->profileData or a blank starter entry
export let profileData = writable<ProfileData>( getFromStorage<ProfileData>('profileData') ?? { profiles: [], profile: -1 } )
export let profile = writable<Profile | undefined>(getProfile())

let guestInstance = get(profileData).defaultInstance

profileData.subscribe(async (pd:ProfileData) => {
    // Save changes to profileData to localStorage 
    saveToStorage('profileData', pd)

    // If guest profile is selected and the guest instance ...ok, not really sure why this is necessary unless it's an edge case I haven't been able to reproduce.
    if (pd.profile == -1 && guestInstance != pd.defaultInstance) {
        guestInstance = get(profileData).defaultInstance ?? DEFAULT_INSTANCE_URL
        instance?.set(get(profileData).defaultInstance ?? DEFAULT_INSTANCE_URL)
    }
    
})


profile.subscribe(async (p:Profile|undefined) => {
    // If profile ID is -1 (default), set the instnace to the currently selected guest instance or the system-defined DEFAULT_INSTANCE_URL
    if (p?.id == -1) {
        instance?.set(get(profileData).defaultInstance ?? DEFAULT_INSTANCE_URL)
    }

    // If profile is not found or lacks an auth token, reset the active profile to the guest profile
    if (!p || !p.jwt) {
        profileData.update((pd:ProfileData) => ({ ...pd, profile: -1 }))
        return
    }
    // If user details (MyUserInfo from API) are already stored, don't proceed to fetch it.
    if (p.user) return    

    // Set the current instance to the instance defined in the profile.
    instance.set(p.instance)

    // Fetch the user details from the API because p.user is undefined
    const user = await userFromJwt(p.jwt, p.instance)
    
    // Set the site store to the data returned from the getSite() call in userFromJwt
    site.set(user?.site)

    // Update the profile store with the retrieved data
    profile.update(() => ({
        ...p,
        user: user!.user,
        username: user?.user.local_user_view.person.name,
    }))
})




// Used at login to store a new user profile
export async function setUser(jwt: string, inst: string): Promise<{ user: PersonData; site: GetSiteResponse } | undefined>  {
    
    const user = await userFromJwt(jwt, inst)

    // If user object unresolved for any reason, toast an error and return
    if (!user) {
        toast({
            content: 'Failed to fetch your user. Is your instance down?',
            type: 'error',
            title: 'Auth Error'
        })
        return
    }

    // Set the instance store value to the provided instance (it's confirmed to be valid since userFromJwt would have to return successfully)
    instance.set(inst)

    // Check if profile exists for this username+instance combo
    let pIndex = get(profileData).profiles.findIndex((p:Profile) => (p.username == user!.user.local_user_view.person.name && p.instance == inst))
    if (pIndex>0) {
        // Set it twice:  Once to populate it with what we want saved to localStorage and again to add the transient user data
        profile.set({
            ...get(profileData).profiles[pIndex],
            jwt: jwt,
            user: user!.user,
            username: user!.user.local_user_view.person.name,
            avatar: user!.user.local_user_view.person.avatar,
        })
        saveProfileToProfileData()
    }
    else {
        // Add a new profile:  Update the profileData store and localStorage and add a new profile.
        profileData.update((pd:ProfileData) => {
            // Use existing profile ID or generate a random number if one doesn't exist
            const id = Math.floor(Math.random() * 100000)
            // Create a new profile object that will be added to the localStorage store
            const newProfile: Profile = {
                id: id,
                instance: inst,
                jwt: jwt,
                username: user!.user.local_user_view.person.name,
                avatar: user!.user.local_user_view.person.avatar,
                favorites: [],
                groups: []

            }

            // Set the value of the current profile store to the one we just created and attach the my_user data to that (as to not srore it in localStorage
            profile.set({
                ...newProfile,
                user: user!.user,
            })
            // Return data that gets written to localStorage->profileData
            // Sets the active profile to the one just created
            // Appends the new profile to the aray of profiles already stored.
            return {
                profile: id,
                profiles: [...pd.profiles, newProfile],
            }
            
        })
    }

    return user
}

async function userFromJwt(jwt: string, inst: string): Promise<{ user: PersonData; site: GetSiteResponse } | undefined> {
    try {
        const getSite = await getClient(inst, jwt).getSite()
        const myUser = getSite.my_user
        
        if (!myUser) return undefined
    
        return {
            user: {
                unreads: 0,
                reports: 0,
                registration_applications:0,
                ...myUser,
            },
            site: getSite,
        }
    } 
    catch (err) {
        console.log("auth.ts->userFromJWT", err);
        return undefined;
    }
}

// Returns the Profile data of the currently selected profile (profileData.profile -> profileData.profiles[profileData.profile])
function getProfile() {
    // Get currently active profile
    const id = get(profileData).profile

    if (id == -1) return getDefaultProfile()
    
    // Set the current instance if the profile is found
    const pd = get(profileData)
    let pFile = pd.profiles.find((p:Profile) => p.id == id)
    if (pFile) instance.set(pFile.instance)
    
    return pFile
}


export function resetProfile() {
    profile.set(getDefaultProfile())
    profileData.update((p) => ({ ...p, profile: -1 }))
    getClient().getSite().then((guestSiteInfo) => {
        site.set(guestSiteInfo)
    })
}

// Update the profile in the profileData object in localStorage
export function saveProfileToProfileData() {
    let pd = get(profileData)
    let pIndex = pd.profiles.findIndex((p:Profile) => p.id == pd.profile)
    
    profileData.update((pd:ProfileData) => {
        let newProfileData:ProfileData = {...pd}
        newProfileData.profiles[pIndex] = {...serializeUser(get(profile)!)}
        return { ...newProfileData}
    })
}



export function deleteProfile(id: number) {
    const pd = get(profileData)
    const index = pd.profiles.findIndex((p) => p.id == id)

    if (index <= -1) return

    pd.profiles.splice(index, 1)

    profileData.update((p) => ({
        ...p,
        profiles: pd.profiles,
    }))

    if (id == get(profile)?.id) {
        resetProfile()
    }
}

/** Strips out the `my_user` data so the returned value can be stored in profile->profileData without that*/
const serializeUser = (user: Profile): Profile => ({
    ...user,
    user: undefined,
})

/** Sets the currently active profile to the profile ID provided. 
 * @param id The profile ID (not the profile index)
*/
export async function setUserID(id: number) {
    const pd = get(profileData)
    
    // Set Guest profile
    if (id == -1) {
        resetProfile()
        return
    }

    // Get current profile
    let prof = pd.profiles.find((p) => p.id == id)

    // If current profile doesn't exist, return default/guest profile
    if (!prof) return profile.update(() => getDefaultProfile())
    
    // Remove the 'user' key from the profile (if present)
    prof = serializeUser(prof)
    
    // Set the current profile as the active one in profileData
    profileData.update((p) => ({ ...p, profile: id }))

    // Check for JWT in profile and fetch the current user information (goes into 'user' key)
    if (prof?.jwt) {
        
        // Set instance so the JS client will send the auth header
        instance.set(prof.instance)

        const user = await userFromJwt(prof.jwt, prof.instance)

        // If the given JWT doesn't resolve to a user (expired/invalid), throw a toast message and redirect to login
        if (!user) {
            toast({
                type: 'warning',
                title: 'Login Expired',
                content: ' Your login session is expired. Please log in again',
                duration: 30 * 1000,
                action: () => goto(`/login/${prof!.instance}`)
            })
        }

        // Set the site and current user details from the API
        site.set(user?.site)
        prof.user = user?.user
    }
    // Update the profile store (in memory only) with the data pulled from the API
    profile.update(() => prof ?? getDefaultProfile())

    // Return the profile to the caller
    return prof
}

export function moveProfile(id: number, up: boolean) {
    const pd = get(profileData)
    try {
        const index = pd.profiles.findIndex((i) => i.id == id)

        profileData.set({
            ...pd,
            profiles: moveItem(pd.profiles, index, index + (up ? -1 : 1)),
        })
    } catch (err) {
        // we dont care
    }
}

const getNotificationCount = async (mod: boolean, admin:boolean=false) => {
    const unreads = await getClient().getUnreadCount()

    let reports: number = 0

    if (mod) {
        const reportRes = await getClient().getReportCount({})

    reports =
        reportRes.comment_reports +
        reportRes.post_reports +
        (reportRes.private_message_reports ?? 0)
    }

    let applications = 0
    if (admin) {
        applications = (await getClient().listRegistrationApplications(
            { unread_only: true }
        ))?.registration_applications?.length ?? 0
    }

    return {
        unreads: unreads.mentions + unreads.private_messages + unreads.replies,
        reports: reports,
        registration_applications: applications
    }
}

// show unread dot
setInterval(async () => {
    if (!get(profile)) return

    const { user, jwt } = get(profile)!
    if (!jwt || !user) return

    const notifs = await getNotificationCount(amModOfAny(user) ?? false, isAdmin(user) ?? false)

    user.unreads = notifs.unreads
    user.reports = notifs.reports
    user.registration_applications = notifs.registration_applications

    profile.update((p) => ({
        ...p!,
        user: user,
    }))
}, get(userSettings).notifications.pollRate ?? 30 * 1000)

saveToStorage('seenUntil', Date.now().toString(), false)

export async function getInboxNotifications(dontUpdate: boolean = false) {
    if (!get(profile) || !get(userSettings).notifications.enabled) return

    const { jwt } = get(profile)!
    if (!jwt) return

    let until = Number(localStorage.getItem('seenUntil'))

    if (Number.isNaN(until) || until == 0) {
        const now = Date.now()
        localStorage.setItem('seenUntil', now.toString())
        until = now
    }

    const inbox = await getInbox(jwt, until)

    inbox.forEach((item) => {
        const notif = new Notification(
            item.person.display_name ?? item.person.name,
            {
                body: item.body,
                timestamp: item.created,
                icon: item.person.avatar,
            }
        )
        notif.onclick = (e) => { window.open('/inbox')}
    })

    if (dontUpdate) return

    localStorage.setItem('seenUntil', Date.now().toString())
}
