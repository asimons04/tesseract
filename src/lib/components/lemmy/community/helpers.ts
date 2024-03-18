import type {
    Community
} from 'lemmy-js-client'

import { addSubscription } from '$lib/lemmy/user.js'
import { fullCommunityName } from '$lib/util.js'
import { get } from 'svelte/store'
import { getClient } from '$lib/lemmy'
import { goto } from '$app/navigation'
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
        const followResponse = await getClient().followCommunity({
            auth: userProfile.jwt,
            community_id: community.id,
            follow: !subscribed,
        })
        subscribed = !subscribed
        
        toast({
            title: "Success",
            content: `Successfully ${subscribed ? 'subscribed to' : 'unsubscribed from'} ${followResponse.community_view.community.title ?? followResponse.community_view.community.name}`,
            type: "success",
        })

    } catch (error) {
        toast({ content: error as any, type: 'error' })
    }
    
    addSubscription(community, subscribed)
    return subscribed
}

// Used for context-menu community blocking; cannot check current status of community block
export const blockCommunity = async function(communityID:number, confirm:boolean=false):Promise<void> {
    const userProfile = get(profile)

    if (!userProfile?.jwt) return
    
    if (!confirm) {
        toast({
            title: "Confirm Community Block",
            content: "Are you sure you want to block and unsubscribe from this community?",
            type: "warning",
            action: () => blockCommunity(communityID, true)
        })
        return
    }
    
    try {
        const blockedCommunity = await getClient().blockCommunity({
            auth: userProfile.jwt,
            community_id: communityID,
            block: true,
        })
        

        toast({
            title: "Success",
            content: `Successfully blocked ${blockedCommunity.community_view.community.title ?? blockedCommunity.community_view.community.name}`,
            type: "success",
        })
    } catch (error) {
        toast({ content: error as any, type: 'error' })
    }
}