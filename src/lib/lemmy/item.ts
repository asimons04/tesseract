import type {
    CommentReportView,
    CommentView,
    CommunityView,
    Comment,
    PersonView,
    PostReportView,
    PostView,
    Post,
    PrivateMessageReportView,
    PrivateMessageView,
    PersonMentionView,
    CommentReplyView,
} from 'lemmy-js-client'

export type Result =
  | PostView
  | Post
  | CommentView
  | Comment
  | PersonView
  | CommunityView
  | PrivateMessageView
  | PostReportView
  | CommentReportView
  | PrivateMessageReportView
  | PersonMentionView
  | CommentReplyView

export function getItemPublished(item: Result) {
  
    if ('post_report' in item)            return item.post_report.published
    if ('comment_report' in item)         return item.comment_report.published
    if ('private_message_report' in item) return item.private_message_report.published

    // others
    if ('private_message' in item)        return item.private_message.published
    
    if ('comment' in item)                return item.comment.published 
    else if ('post' in item)              return item.post.published 

    if ('person' in item)                 return item.person.published
    if ('community' in item)              return item.community.published

    return ''
}

export function getPostOrCommentPublished(item:PostView|CommentView) {
    if ('post' in item && 'comment' in item) return item.comment.published
    if ('post' in item && !('comment' in item)) return item.post.published
    return ''
}


export function isPostView(item: Result): item is PostView {
    return 'post' in item && !('comment' in item)
}

export function isPost(item: Result): item is Post {
    return 'name' in item && !('content' in item)
}

export function isCommentView(item: Result): item is CommentView {
    if (!item) return false
    return 'comment' in item
}

export function isComment(item: Result): item is Comment {
    return 'content' in item
}

export function isCommunityView(item: Result): item is CommunityView {
    return 'community' in item
}

export function isUser(item: Result): item is PersonView {
    return 'person' in item
}

export function isPostReport(item: Result): item is PostReportView {
    return 'post_report' in item
}

export function isCommentReport(item: Result): item is CommentReportView {
    return 'comment_report' in item
}

export function isPrivateMessageReport(item: Result): item is PrivateMessageReportView {
    return 'private_message_report' in item
}

export function isPrivateMessage(item: Result): item is PrivateMessageView {
    return 'private_message' in item
}

export function isPersonMention(item:Result): item is PersonMentionView {
    return 'person_mention' in item
}

export function isCommentReply(item:CommentReplyView | PersonMentionView | PrivateMessageView, my_user_id:number = -1): item is CommentReplyView {
    return 'comment_reply' in item && item.post.creator_id != my_user_id
}

export function isPostReply(item:CommentReplyView | PersonMentionView | PrivateMessageView, my_user_id:number = -1): item is CommentReplyView {
    return 'comment_reply' in item && item.post.creator_id == my_user_id
}