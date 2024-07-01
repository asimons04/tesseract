import type { Community, MyUserInfo, PersonBlockView, PersonView } from 'lemmy-js-client'
import type { PersonData } from '$lib/auth'

import { get } from 'svelte/store'
import { getClient } from '$lib/lemmy.js'
import { goto } from '$app/navigation'
import { profile } from '$lib/auth.js'
import { toast } from '$lib/components/ui/toasts/toasts.js'
import { trycatch } from '$lib/util.js'


export const isBlocked = (me: PersonData, user: number) => me.person_blocks.map((b:PersonBlockView) => b.target.id).includes(user)

export const addSubscription = (community: Community, subscribe: boolean = true) => {
    const p = get(profile)

    if (!p?.user) return

    if (subscribe) {
        profile.set({
            ...p,
            user: {
                ...p.user,
                follows: [
                    ...p.user.follows,
                    {
                        community: community,
                        follower: p.user.local_user_view.person,
                    },
                ],
            },
        })
    } else {
        p.user.follows.splice(p.user.follows.findIndex((i) => i.community.id == community.id), 1)
        profile.set(p)
    }
}

export const addAdmin = async (handle: string, added: boolean, jwt: string) =>
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
            const getSiteResponse = await getClient().getSite()
            if (getSiteResponse?.my_user) {
                userProfile.user.person_blocks = getSiteResponse.my_user.person_blocks
                profile.set(userProfile)
            }
            
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
