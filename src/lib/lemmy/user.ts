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
            auth: jwt,
            q: handle,
        })

        if (!user.person) throw new Error('No user found')

        return await getClient().addAdmin({
            auth: jwt,
            added: true,
            person_id: user.person.person.id,
        })
    })


export const blockUser = async function (personID: number, confirm:boolean=false):Promise<void> {
    if (!confirm) {
        toast({
            content: "Are you sure you want to block this user?",
            type: "warning",
            action: () => blockUser(personID, true)
        })
        return
    }
    else {
        try {
            const userProfile = get(profile)
            if (!userProfile?.user || !userProfile?.jwt) throw new Error('Unauthenticated')

            const blocked = isBlocked(userProfile.user, personID)

            await getClient().blockPerson({
                auth: userProfile.jwt,
                block: !blocked,
                person_id: personID,
            })

            if (blocked) {
                const index = userProfile.user.person_blocks
                    .map((p) => p.target.id)
                    .indexOf(personID)
                userProfile.user.person_blocks.splice(index, 1)
            }
            
            toast({
                content: `Successfully ${blocked ? 'unblocked' : 'blocked'} that user.`,
                type: 'success',
            })

            // Refresh the page to effect the change in block status
            goto(window.location.href, {
                invalidateAll: true,
            })

        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
            })
        }
    }
}
