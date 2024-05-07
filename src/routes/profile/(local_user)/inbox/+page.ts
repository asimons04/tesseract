import { profile } from '$lib/auth.js'
import { getClient } from '$lib/lemmy.js'
import { getInboxItemPublished } from '$lib/lemmy/inbox.js'
import { get } from 'svelte/store'

type InboxFeedType = 'replies' | 'mentions' | 'messages' | 'all'

interface LoadParams {
    url: URL
}


export async function load({ url }:LoadParams) {
    const auth = get(profile)
    if (!auth?.jwt) return

    const type: InboxFeedType = (url.searchParams.get('type') as InboxFeedType) || 'all'
    const client = getClient()
    const page = Number(url.searchParams.get('page')) || 1
    const unreadOnly: boolean = (url.searchParams.get('unreadOnly') || 'true') == 'true'

    const params = {
        limit: 50,
        page: page,
        auth: auth.jwt,
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

    return { unreadOnly: unreadOnly, type: type, page: page, data: data }
}
