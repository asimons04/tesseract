import { profile } from '$lib/auth.js'
import { getClient } from '$lib/lemmy.js'
import { getInboxItemPublished, isRead } from '$lib/lemmy/inbox.js'
import { get } from 'svelte/store'
import { userSettings } from '$lib/settings'

export type InboxFeedType = 'unread' | 'replies' | 'mentions' | 'messages' | 'all'

interface LoadParams {
    url: URL
}


export async function load({ url }:LoadParams) {
    const auth = get(profile)
    if (!auth?.jwt) return

    const type: InboxFeedType = (url.searchParams.get('type') as InboxFeedType) || 'all'
    const client = getClient()
    const page = Number(url.searchParams.get('page')) || 1
    const unreadOnly: boolean = url.searchParams.has('unreadOnly')
        ? (url.searchParams.get('unreadOnly')=='true' )
        : get(userSettings)?.uiState.inboxDefaultUnread

    const params = {
        limit: 50,
        page: page,
        unread_only: unreadOnly,
    }

    const [replies, mentions, privateMessages] = await Promise.all([
        ['all', 'replies'].includes(type)
            ?   client.getReplies({
                    ...params,
                    sort: 'New',
                })
            : { replies: [] },
        ['all', 'mentions'].includes(type)
            ?   client.getPersonMentions({
                    ...params,
                    sort: 'New',
                })
            :   { mentions: [] },

        ['all', 'messages'].includes(type)
            ?   client.getPrivateMessages({ ...params })
            :   { private_messages: [], },
    ])

    const data = [
        ...replies.replies,
        ...mentions.mentions,
        ...privateMessages.private_messages,
    ].sort( (a, b) => Date.parse(getInboxItemPublished(b)) - Date.parse(getInboxItemPublished(a)) )
    
    let unreadCount = 0
    data.forEach((item) => {
        if (!isRead(item)) {
            unreadCount++;
        }
    })

    return { 
        unreadOnly: unreadOnly, 
        unreadCount: unreadCount,
        type: unreadOnly ? 'unread' : type, 
        page: page, 
        data: data 
    }
}
