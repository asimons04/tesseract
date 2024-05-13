import type {
    Community
} from 'lemmy-js-client'

import { addSubscription } from '$lib/lemmy/user.js'
import { fixLemmyEncodings } from '../post/helpers'
import { fullCommunityName } from '$lib/util.js'
import { get } from 'svelte/store'
import { getClient } from '$lib/lemmy'
import { goto, invalidate } from '$app/navigation'
import { profile } from '$lib/auth'
import { toast } from '$lib/components/ui/toasts/toasts.js'


/** Clears the last seen community from session storage */
export function clearLastSeenCommunity() {
    sessionStorage.removeItem('lastSeenCommunity')
}

/** Stores the given community to the lastSeenCommunity session storage key */
export function setLastSeenCommunity(community:Community) {
    sessionStorage.setItem('lastSeenCommunity', JSON.stringify(community))
}

/** Retrieves the community from the lastSeenCommunity session storage key (or undefined if not set)*/
export function getLastSeenCommunity():Community | undefined {
    try {
        let community = sessionStorage.getItem('lastSeenCommunity')
        if (!community) return
        return JSON.parse(community)
    }
    catch { return }
}

export const createPost = function (community:Community) {
    const route = `/c/${community.name}@${new URL(community.actor_id).hostname}/create_post`
    goto(route)
    
}


// Subscribe and un-subscribe to a community; returns the subscribed state
export const subscribe = async function(community:Community, subscribed:boolean):Promise<boolean> {
    const userProfile = get(profile)
    if (!userProfile?.jwt) return subscribed
   
    try {
        const followResponse = await getClient().followCommunity({
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

/** If community title is > 40 characters, split it at the hyphen or colon and only return the text to the left of that */
export function shortenCommunityName(name:string) {
    if (!name) return
    let shortened =  name.length > 40
        ? fixLemmyEncodings(name).split(':')[0].split('-')[0].trim()
        : fixLemmyEncodings(name)
    return shortened.substring(0,40)
}