import type {
    CommentReportView,
    CommentView,
    Community,
    Person,
    Post,
    PostView,
    PostReportView,
    PrivateMessageReportView,
    PrivateMessageView,
} from 'lemmy-js-client'

import { 
    getItemPublished, 
    isCommentReport, 
    isPrivateMessageReport,
    isPostReport, 
} from '$lib/lemmy/item.js'


import type { IconSource } from 'svelte-hero-icons'
import {
    ChatBubbleLeftEllipsis,
    ChatBubbleLeftRight,
    Flag,
    Photo
} from 'svelte-hero-icons'

export interface StandardReport {
    type: 'comment' | 'post' | 'private_message'
    type_friendly: 'Comment' | 'Post' | 'Private Message'
    icon: IconSource
    id: number
    reporter: Person
    reportee: Person
    resolver?: Person
    resolved: boolean
    community?: Community
    creator_banned_from_community: boolean
    reason: string
    post_view?: PostView,
    comment_view?: CommentView,
    private_message_view?: PrivateMessageView
    published: string,
    title: string,
    
}

function createPostView(item:PostReportView): PostView {
    return {
        post: {
                ...item.post,
                name:   item.post_report.original_post_name,
                url:    item.post_report.original_post_url,
                body:   item.post_report.original_post_body,
        },
        creator: item.post_creator,
        community: item.community,
        creator_banned_from_community: item.creator_banned_from_community,
        counts: item.counts,
        subscribed: 'NotSubscribed',
        saved: false,
        read: false,
        creator_blocked: false,
        my_vote: item.my_vote,
        unread_comments: 0
    } as PostView
}

function createCommentView(item:CommentReportView): CommentView {
    return {
        comment:    {...item.comment},
        creator:    {...item.comment_creator},
        post:       {...item.post},
        community:  {...item.community},
        counts:     {...item.counts},
        creator_banned_from_community: item.creator_banned_from_community,
        subscribed: 'NotSubscribed',
        saved: false,
        creator_blocked: false,
        my_vote: item.my_vote
    } as CommentView

}

function createPMView(item:PrivateMessageReportView): PrivateMessageView {
    return {
        private_message: {...item.private_message},
        creator: {...item.private_message_creator},
        recipient: {...item.creator}
    } as PrivateMessageView
}

export function createStandardReport(item: PostReportView | CommentReportView | PrivateMessageReportView): StandardReport{
    let report: StandardReport = {
        type: isCommentReport(item) ? 'comment' : isPostReport(item) ? 'post' : 'private_message',
        type_friendly: isCommentReport(item) ? 'Comment' : isPostReport(item) ? 'Post' : 'Private Message',
        id: isCommentReport(item) ? item.comment_report.id : isPostReport(item) ? item.post_report.id : item.private_message_report.id,
        icon: isCommentReport(item) ? ChatBubbleLeftEllipsis : isPostReport(item) ? Photo : isPrivateMessageReport(item) ? ChatBubbleLeftRight : Flag,
        reporter: item.creator,
        reportee: isCommentReport(item) ? item.comment_creator : isPostReport(item) ? item.post_creator : item.private_message_creator,
        
        community: isCommentReport(item) || isPostReport(item) ? item.community : undefined,
        reason: isCommentReport(item) ? item.comment_report.reason : isPostReport(item) ? item.post_report.reason : item.private_message_report.reason,
        title: isCommentReport(item) ? item.comment.content : isPostReport(item) ? item.post.name : '',
       
        post_view: isPostReport(item) ? createPostView(item) : undefined,
        comment_view: isCommentReport(item) ? createCommentView(item) : undefined,
        private_message_view: isPrivateMessageReport(item) ? createPMView(item) : undefined,
        
        creator_banned_from_community: isCommentReport(item) || isPostReport(item) ? item.creator_banned_from_community : false,
        published: isCommentReport(item) ? item.comment_report.published : isPostReport(item) ? item.post_report.published : item.private_message_report.published,

        resolved: isCommentReport(item) ? item.comment_report.resolved : isPostReport(item) ? item.post_report.resolved : item.private_message_report.resolved,
        resolver: item.resolver ?? undefined,
    }

    return report
}
