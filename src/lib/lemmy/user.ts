import type { Community, InstanceBlockView, MyUserInfo, PersonBlockView, PersonView } from 'lemmy-js-client'
import type { PersonData } from '$lib/auth'

import { get } from 'svelte/store'
import { getClient } from '$lib/lemmy.js'
import { goto } from '$app/navigation'
import { profile } from '$lib/auth.js'
import { toast } from '$lib/components/ui/toasts/toasts.js'
import { trycatch } from '$lib/util.js'
import { userSettings} from '$lib/settings'
import { dispatchWindowEvent } from '$lib/ui/events'


export const userIsFiltered = function(actor_id?:string): boolean {
    if (!actor_id) return false
    const $userSettings = get(userSettings)
    return $userSettings.hidePosts.userList.includes(actor_id) ? true : false
}

export const filterUser = function(actor_id:string):boolean {
    let userFiltered = userIsFiltered(actor_id)
    const $userSettings = get(userSettings)

    //Un-Filter
    if (userFiltered) {
        const index = $userSettings.hidePosts.userList.findIndex((e) => e == actor_id)
        if (index >=0 ) $userSettings.hidePosts.userList.splice(index, 1)
        userFiltered = false
    }
    // Add community actor_id to community filter list
    else {
        $userSettings.hidePosts.userList.push(actor_id)
        $userSettings.hidePosts.userList.sort()
        userFiltered = true
    }
    
    userSettings.set($userSettings)
    
    dispatchWindowEvent('filterUser', {
        actor_id: actor_id,
        filtered: userFiltered
    })

    return userFiltered
}

export const isBlocked = function (me: PersonData|undefined, user: number) {
    if (!me) return false
    return me.person_blocks.map((b:PersonBlockView) => b.target.id).includes(user)
}

export const userIsInstanceBlocked = function (me: PersonData|undefined, instanceID: number) {
    if (!me) return false
    return me.instance_blocks.map((b:InstanceBlockView) => b.instance.id).includes(instanceID)
}


export const addSubscription = async (community: Community, subscribe: boolean = true) => {
    const p = get(profile)

    if (!p?.user) return
    
    if (subscribe) {
        const idx = p.user.follows.findIndex((c) => { c.community.actor_id == community.actor_id })
        if (idx < 0) {
            p.user.follows = [
                ...p.user.follows,
                {
                    community: community,
                    follower: p.user.local_user_view.person
                }
            ]
            profile.set(p)
        }
    }
    else {
        p.user.follows.splice(p.user.follows.findIndex((i) => i.community.actor_id == community.actor_id), 1)
        profile.set(p)
    }
}

export const addAdmin = async (handle: string) =>
    trycatch(async () => {
            const user = await getClient().resolveObject({
            q: handle,
        })

        if (!user.person) throw new Error('No user found')

        return await getClient().addAdmin({
            added: true,
            person_id: user.person.person.id,
        })
    })


export const blockUser = async function (personID: number, confirm:boolean=false, block?:boolean):Promise<boolean> {
    let userProfile = get(profile)
    
    if (!userProfile?.user || !userProfile?.jwt) throw new Error('Unauthenticated')
    
    const blocked = isBlocked(userProfile.user, personID)
    
    if (!confirm) {
        toast({
            title: "Confirmation",
            content: "Are you sure you want to block this user?",
            type: "warning",
            action: async () => await blockUser(personID, true)
        })
        return false
    }
    else {
        try {
            const blockResponse = await getClient().blockPerson({
                block: block ?? !blocked,
                person_id: personID,
            })
            
            if (!blockResponse) throw new Error('Failed to block user')
            
            // Update local cache of person blocks
           await refreshProfile()
            
            toast({
                title: "Succcess",
                content: `Successfully ${blockResponse.blocked ? 'blocked' : 'unblocked'} that user.`,
                type: 'success',
            })

            return blockResponse.blocked

        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
                title: 'Error'
            })
            return blocked
        }
    }
}


export const refreshProfile = async function() {
    let userProfile = get(profile)
    if (!userProfile?.user || !userProfile?.jwt) return 
    //throw new Error('Unauthenticated')

    // Update local cache of person blocks
    const getSiteResponse = await getClient().getSite()
    
    if (getSiteResponse?.my_user) {
        userProfile.user.person_blocks = getSiteResponse.my_user.person_blocks
        userProfile.user.instance_blocks = getSiteResponse.my_user.instance_blocks
        userProfile.user.community_blocks = getSiteResponse.my_user.community_blocks
        userProfile.user.follows = getSiteResponse.my_user.follows
        userProfile.user.moderates = getSiteResponse.my_user.moderates


        profile.set(userProfile)
    }

}
