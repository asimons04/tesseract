import type {
    Community
} from 'lemmy-js-client'

import { addSubscription } from '$lib/lemmy/user.js'
import { fullCommunityName } from '$lib/util.js'
import { get } from 'svelte/store'
import { getClient } from '$lib/lemmy'
import { profile } from '$lib/auth'
import { setSessionStorage } from '$lib/session'
import { toast } from '$lib/components/ui/toasts/toasts.js'

export const createPost = function (community:Community) {
    setSessionStorage('lastSeenCommunity', {
        id: community.id,
        name: fullCommunityName(community.name, community.actor_id),
    });
    // Hack to get the session storage to read on create post. "goto" wasn't picking up the change
    window.location.pathname='/create/post';
}


// Subscribe and un-subscribe to a community; returns the subscribed state
export const subscribe = async function(community:Community, subscribed:boolean):Promise<boolean> {
    const userProfile = get(profile)
    if (!userProfile?.jwt) return subscribed
   
    try {
        await getClient().followCommunity({
            auth: userProfile.jwt,
            community_id: community.id,
            follow: !subscribed,
        })
        subscribed = !subscribed
    } catch (error) {
        toast({ content: error as any, type: 'error' })
    }
    
    addSubscription(community, subscribed)
    return subscribed
}