import type { Community, GetSiteResponse, MyUserInfo, SortType } from 'lemmy-js-client'

import { amModOfAny } from '$lib/components/lemmy/moderation/moderation.js'
import { DEFAULT_INSTANCE_URL, instance } from '$lib/instance.js'
import { get, writable } from 'svelte/store'
import { getClient, site } from '$lib/lemmy.js'
import { getInbox, getInboxItemPublished } from '$lib/lemmy/inbox.js'
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
}

export interface Profile {
    id: number
    instance: string
    jwt?: string
    user?: PersonData
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


export let profile = writable<Profile | undefined>(getProfile())

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
export async function setUser(jwt: string, inst: string, username: string): Promise<{ user: PersonData; site: GetSiteResponse } | undefined>  {
    let user:{ user: PersonData; site: GetSiteResponse } | undefined = undefined
    
    // Test that the instance parameter can be a valid URL
    try {
        new URL(`https://${inst}`)
    } catch (err) {
        console.log("auth.ts->setUser(jwt, inst) -> Invalid instance URL", err);
        return
    }
    
    try {
        // Make authenticated call to getSite to grab the my_user key.
        user = await userFromJwt(jwt, inst)

    }
    catch (err) {
        console.log("auth.ts->setUser(jwt, inst) -> userFromJwt:", err);
    }

    // If user object unresolved for any reason, toast an error and return
    if (!user) {
        toast({
            content: 'Failed to fetch your user. Is your instance down?',
            type: 'error',
        })
        return
    }

    // Set the instance store value to the provided instance (it's confirmed to be valid since userFromJwt would have to return successfully)
    instance.set(inst)

    // Update the profileData store and localStorage and add a new profile.
    profileData.update((pd:ProfileData) => {
        
        // Generate a random number to use as the profile ID
        const id = Math.floor(Math.random() * 100000)

        // Create a new profile object that will be added to the localStorage store
        const newProfile: Profile = {
            id: id,
            instance: inst,
            jwt: jwt,
            username: user!.user.local_user_view.person.name,
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

    return user
}

async function userFromJwt(jwt: string, instance: string): Promise<{ user: PersonData; site: GetSiteResponse } | undefined> {
    try {
        const site = await getClient(instance, undefined, jwt).getSite({ auth: jwt })
        const myUser = site.my_user
    
        if (!myUser) return undefined
    
        return {
            user: {
                unreads: 0,
                reports: 0,
                ...myUser,
            },
            site: site,
        }
    } 
    catch (err) {
        console.log("auth.ts->userFromJWT", err);
        return undefined;
    }
}

// Returns the Profile data of the currently selected profile (profileData.profile -> profileData.profiles[profileData.profile])
function getProfile() {
    const id = get(profileData).profile

    if (id == -1) {
        return getDefaultProfile()
    }

    const pd = get(profileData)

    return pd.profiles.find((p:Profile) => p.id == id)
}


export function resetProfile() {
    profile.set(getDefaultProfile())
    profileData.update((p) => ({ ...p, profile: -1 }))
}

// Update the profile in the profileData object in localStorage
export function saveProfileToProfileData() {
    let pd = get(profileData)
    let pIndex = pd.profiles.findIndex((p:Profile) => p.id == pd.profile)
    
    profileData.update((pd:ProfileData) => {
        let newProfileData:ProfileData = {...pd}
        newProfileData.profiles[pIndex] = {...get(profile)!}
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

const serializeUser = (user: Profile): Profile => ({
    ...user,
    user: undefined,
})

export async function setUserID(id: number) {
    const pd = get(profileData)

    if (id == -1) {
        resetProfile()
        return
    }

    let prof = pd.profiles.find((p) => p.id == id)

    if (!prof) return profile.update(() => getDefaultProfile())
    
    prof = serializeUser(prof)
    profileData.update((p) => ({ ...p, profile: id }))

    if (prof?.jwt) {
        const user = await userFromJwt(prof.jwt, prof.instance)
        instance.set(prof.instance)
        prof.user = user?.user
        site.set(user?.site)
    }
    profile.update(() => prof ?? getDefaultProfile())

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

const getNotificationCount = async (jwt: string, mod: boolean) => {
    const unreads = await getClient().getUnreadCount({
        auth: jwt,
    })

    let reports: number = 0

    if (mod) {
        const reportRes = await getClient().getReportCount({
            auth: jwt,
    })

    reports =
        reportRes.comment_reports +
        reportRes.post_reports +
        (reportRes.private_message_reports ?? 0)
    }

    return {
        unreads: unreads.mentions + unreads.private_messages + unreads.replies,
        reports: reports,
    }
}

// show unread dot
setInterval(async () => {
    if (!get(profile)) return

    const { user, jwt } = get(profile)!
    if (!jwt || !user) return

    const notifs = await getNotificationCount(jwt, amModOfAny(user) ?? false)

    user.unreads = notifs.unreads
    user.reports = notifs.reports

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
