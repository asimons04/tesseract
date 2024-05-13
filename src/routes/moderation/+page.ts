import type { StandardReport } from './components/helpers'
import { createStandardReport } from './components/helpers'

import { getClient } from '$lib/lemmy.js'
import { getItemPublished } from '$lib/lemmy/item.js'
import { get } from 'svelte/store'
import { isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
import { profile } from '$lib/auth'

type ReportListType = 'unread' | 'all'
type ReportFilter = 'all' | 'posts' | 'comments' | 'messages'

export async function load({ url, fetch }) {
    const page = Number(url.searchParams.get('page')) || 1
    const type: ReportListType = (url.searchParams.get('type') as ReportListType) || 'unread'
    const filter: ReportFilter = (url.searchParams.get('filter') as ReportFilter) || 'all'

    
    const $profile = get(profile)
    const jwt = $profile?.jwt
    
    if (!jwt) return { type: type, page: page }
  
    const client = getClient()

    const params = {
        limit: 20,
        page: page,
        unresolved_only: type == 'unread',
    }

    const [posts, comments, private_messages] = await Promise.all([
        client.listPostReports({
            ...params,
        }),
        
        client.listCommentReports({
            ...params,
        }),
        
        isAdmin($profile.user)
            ? client.listPrivateMessageReports({...params,})
            : { private_message_reports: [] }
    ])

    const everything = [...posts.post_reports, ...comments.comment_reports, ...private_messages.private_message_reports]
        .sort((a, b) => Date.parse(getItemPublished(b)) - Date.parse(getItemPublished(a)))

    const reports = [] as StandardReport[]
    everything.forEach((item) => {
        reports.push(createStandardReport(item))
    })

    return {
        type: type,
        page: page,
        reports: reports,
    }
}
