import type { Community, MyUserInfo, PersonBlockView, PersonView } from 'lemmy-js-client'

import { get } from 'svelte/store'
import { getClient } from '$lib/lemmy.js'
import { goto } from '$app/navigation'
import { profile } from '$lib/auth.js'
import { toast } from '$lib/components/ui/toasts/toasts.js'
import { trycatch } from '$lib/util.js'

/*
export const blockUser = async (block: boolean, id: number) => {
  const auth = get(profile)?.jwt

  if (!auth) throw new Error('Unauthorized')

  const response = await getClient().blockPerson({
    auth: auth,
    block: block,
    person_id: id,
  })
}
*/
export const isBlocked = (me: MyUserInfo, user: number) => me.person_blocks.map((b:PersonBlockView) => b.target.id).includes(user)

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


export const blockUser = async function (block: number):Promise<void> {
    let userProfile = get(profile)

    if (!userProfile?.user || !userProfile?.jwt) throw new Error('Unauthenticated')

    try {
        const blocked = isBlocked(userProfile.user, block)

        await getClient().blockPerson({
            auth: userProfile.jwt,
            block: !blocked,
            person_id: block,
        })

        if (blocked) {
            const index = userProfile.user.person_blocks
                .map((p) => p.target.id)
                .indexOf(block)
            userProfile.user.person_blocks.splice(index, 1)
        }
        
        toast({
            content: `Successfully ${blocked ? 'unblocked' : 'blocked'} that user.`,
            type: 'success',
        })

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
