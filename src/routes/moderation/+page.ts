import type { StandardReport } from './helpers'
import { createStandardReport } from './helpers'

import { getClient } from '$lib/lemmy.js'
import { getItemPublished } from '$lib/lemmy/item.js'
import { get } from 'svelte/store'
import { isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
import { profile } from '$lib/auth'

type ReportFilter = 'all' | 'posts' | 'comments' | 'messages' | 'unread'

export async function load({ url, fetch }) {
    const page = Number(url.searchParams.get('page')) || 1
    const filter: ReportFilter = (url.searchParams.get('filter') as ReportFilter) || 'unread'
    const community_id: number | undefined = Number(url.searchParams.get('community_id')) || undefined
    
    const $profile = get(profile)
    const jwt = $profile?.jwt
    let unreadCount = 0

    if (!jwt) return { filter: filter, page: page }
  
    const client = getClient()

    const params = {
        limit: 20,
        page: page,
        unresolved_only: filter == 'unread',
    }

    const [posts, comments, private_messages] = await Promise.all([
        ['all', 'unread', 'posts'].includes(filter)
            ?   client.listPostReports({...params, community_id: community_id})
            :   { post_reports: [] },
        
        ['all', 'unread', 'comments'].includes(filter)
            ?   client.listCommentReports({...params, community_id: community_id})
            :   { comment_reports: [] },
        
        !community_id && isAdmin($profile.user) && ['all', 'unread', 'messages'].includes(filter)
            ? client.listPrivateMessageReports({...params})
            : { private_message_reports: [] }
    ])

    const everything = [...posts.post_reports, ...comments.comment_reports, ...private_messages.private_message_reports]
        .sort((a, b) => Date.parse(getItemPublished(b)) - Date.parse(getItemPublished(a)))

    const reports = [] as StandardReport[]
    
    everything.forEach((item) => {
        let report = createStandardReport(item)
        if (!report.resolved) unreadCount++
        reports.push(report)
    })
    

    return {
        filter: filter,
        community_id: community_id,
        page: page,
        reports: reports,
        unreadCount: unreadCount
    }
}
