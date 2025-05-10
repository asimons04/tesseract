import { profile } from '$lib/auth.js'
import { getClient } from '$lib/lemmy.js'
import type {
    AdminPurgeCommentView,
    AdminPurgeCommunityView,
    AdminPurgePersonView,
    AdminPurgePostView,
    Comment,
    Community,
    ModAddCommunityView,
    ModAddView,
    ModBanFromCommunityView,
    ModBanView,
    ModFeaturePostView,
    ModHideCommunityView,
    ModLockPostView,
    ModRemoveCommentView,
    ModRemoveCommunityView,
    ModRemovePostView,
    ModTransferCommunityView,
    ModlogActionType,
    ModlogListParams,
    Person,
    Post,
} from 'lemmy-js-client'

export type ActionName =
    | 'ban'
    | 'banCommunity'
    | 'unban'
    | 'unbanCommunity'
    | 'postRemoval'
    | 'postRestore'
    | 'commentRemoval'
    | 'commentRestore'
    | 'postLock'
    | 'postUnlock'
    | 'postUnfeature'
    | 'postFeature'
    | 'modAdd'
    | 'modRemove'
    | 'purge'
    | 'removeCommunity'
    | 'restoreCommunity'
    | 'transferCommunity'
    | 'hideCommunity'
    | 'unhideCommunity'
    | 'Unknown'

type ModAction =
    | ModBanFromCommunityView
    | ModRemoveCommentView
    | ModRemoveCommunityView
    | ModRemovePostView
    | ModAddCommunityView
    | ModLockPostView
    | ModFeaturePostView
    | ModTransferCommunityView
    | AdminPurgeCommentView
    | AdminPurgeCommunityView
    | AdminPurgePostView
    | AdminPurgePersonView
    | ModHideCommunityView
    | ModBanView
    | ModAddView

export interface ModLog {
    reason?: string
    moderatee?: Person
    content?: string
    moderator?: Person
    community?: Community
    actionName: ActionName
    timestamp: number
    link?: string
    expires?:string
    when: string
    post?: Post,
    comment?: Comment
    type: ModlogActionType
}

export interface Filters {
    title?: string,
    moderator: {
        set: boolean,
        person?: Person 
        loading: boolean
    },
    moderatee: {
        set: boolean,
        person?: Person 
        loading: boolean
    },
    community: {
        set: boolean,
        community?: Community
        loading: boolean
    },
    action: {
        set: boolean,
        action?: ModlogActionType 
    }
}

const fullUserName = (user: Person) => `${user.name}@${new URL(user.actor_id).hostname}`

function timestamp (when: string): number {
    return Date.parse(when)
}


export const _toModLog = (item: ModAction): ModLog => {
    if ('mod_ban_from_community' in item) {
        return {
            moderator: item.moderator,
            moderatee: item.banned_person,
            community: item.community,
            actionName: item.mod_ban_from_community.banned
                ? 'banCommunity'
                : 'unbanCommunity',
            reason: item.mod_ban_from_community.reason,
            timestamp: timestamp(item.mod_ban_from_community.when_),
            when: item.mod_ban_from_community.when_,
            expires: item.mod_ban_from_community.expires,
            type: 'ModBanFromCommunity'
        }
    }
    else if ('mod_remove_comment' in item) {
        return {
            actionName: item.mod_remove_comment.removed
                ? 'commentRemoval'
                : 'commentRestore',
            community: item.community,
            content: item.comment.content,
            timestamp: timestamp(item.mod_remove_comment.when_),
            when: item.mod_remove_comment.when_,
            moderatee: item.commenter,
            moderator: item.moderator,
            reason: item.mod_remove_comment.reason,
            link: `/comment/${item.comment.id}`,
            comment: item.comment,
            type: 'ModRemoveComment'
        }
    }
    else if ('mod_remove_post' in item) {
        return {
            actionName: item.mod_remove_post.removed ? 'postRemoval' : 'postRestore',
            community: item.community,
            content: item.post.name,
            timestamp: timestamp(item.mod_remove_post.when_),
            when: item.mod_remove_post.when_,
            moderator: item.moderator,
            reason: item.mod_remove_post.reason,
            link: `/post/${item.post.id}`,
            post: item.post,
            type: 'ModRemovePost'
        }
    } 
    else if ('mod_remove_community' in item) {
        return {
            actionName: item.mod_remove_community.removed ? 'removeCommunity' : 'restoreCommunity',
            community: item.community,
            timestamp: timestamp(item.mod_remove_community.when_),
            when: item.mod_remove_community.when_,
            moderator: item.moderator,
            reason: item.mod_remove_community.reason,
            link: `/c/${item.community.name}@${new URL(item.community.actor_id).hostname}`,
            type: 'ModRemoveCommunity'
        }
    }
    else if ('mod_hide_community' in item) {
        return {
            actionName: item.mod_hide_community.hidden ? 'hideCommunity' : 'unhideCommunity',
            community: item.community,
            timestamp: timestamp(item.mod_hide_community.when_),
            when: item.mod_hide_community.when_,
            moderator: item.admin,
            reason: item.mod_hide_community.reason,
            link: `/c/${item.community.name}@${new URL(item.community.actor_id).hostname}`,
            type: 'ModHideCommunity'
        }
    }

    else if ('mod_add_community' in item) {
        return {
            actionName: item.mod_add_community.removed ? 'modRemove' : 'modAdd',
            community: item.community,
            timestamp: timestamp(item.mod_add_community.when_),
            when: item.mod_add_community.when_,
            moderator: item.moderator,
            moderatee: item.modded_person,
            type: 'ModAddCommunity'
        }
    }
    else if ('mod_feature_post' in item) {
        return {
            actionName: item.mod_feature_post.featured
                ? 'postFeature'
                : 'postUnfeature',
            timestamp: timestamp(item.mod_feature_post.when_),
            when: item.mod_feature_post.when_,
            community: item.community,
            link: `/post/${item.post.id}`,
            moderator: item.moderator,
            content: item.post.name,
            post: item.post,
            type: 'ModFeaturePost'
        }
    } 
    else if ('mod_lock_post' in item) {
        return {
            actionName: item.mod_lock_post.locked ? 'postLock' : 'postUnlock',
            timestamp: timestamp(item.mod_lock_post.when_),
            when: item.mod_lock_post.when_,
            community: item.community,
            link: `/post/${item.post.id}`,
            moderator: item.moderator,
            content: item.post.name,
            post: item.post,
            type: 'ModLockPost'
        }
    } 
    else if ('mod_transfer_community' in item) {
        return {
            actionName: 'transferCommunity',
            timestamp: timestamp(item.mod_transfer_community.when_),
            when: item.mod_transfer_community.when_,
            moderator: item.moderator,
            moderatee: item.modded_person,
            community: item.community,
            type: 'ModTransferCommunity'
        }   
    }
    else if ('admin_purge_post' in item) {
        return {
            actionName: 'purge',
            timestamp: timestamp(item.admin_purge_post.when_),
            when: item.admin_purge_post.when_,
            moderator: item.admin,
            community: item.community,
            content: 'Purged a post',
            reason: item.admin_purge_post.reason,
            type: 'AdminPurgePost'
        }
    } 
    else if ('admin_purge_comment' in item) {
        return {
            actionName: 'purge',
            timestamp: timestamp(item.admin_purge_comment.when_),
            when: item.admin_purge_comment.when_,
            moderator: item.admin,
            content: 'Purged a comment',
            reason: item.admin_purge_comment.reason,
            type: 'AdminPurgeComment'
        }
    } 
    else if ('admin_purge_community' in item) {
        return {
            actionName: 'purge',
            timestamp: timestamp(item.admin_purge_community.when_),
            when: item.admin_purge_community.when_,
            moderator: item.admin,
            content: 'Purged a community',
            reason: item.admin_purge_community.reason,
            type: 'AdminPurgeCommunity'
        }
    } 
    else if ('admin_purge_person' in item) {
        return {
            actionName: 'purge',
            timestamp: timestamp(item.admin_purge_person.when_),
            when: item.admin_purge_person.when_,
            moderator: item.admin,
            content: 'Purged a user',
            reason: item.admin_purge_person.reason,
            type: 'AdminPurgePerson'
        }
    } 
    else if ('mod_ban' in item) {
        return {
            actionName: item.mod_ban.banned ? 'ban' : 'unban',
            timestamp: timestamp(item.mod_ban.when_),
            when: item.mod_ban.when_,
            moderator: item.moderator,
            moderatee: item.banned_person,
            reason: item.mod_ban.reason,
            link: `/u/${fullUserName(item.banned_person)}`,
            expires: item.mod_ban.expires,
            type: 'ModBan'
        }
    } 
    else if ('mod_add' in item) {
        return {
            actionName: item.mod_add.removed ? 'modRemove' : 'modAdd',
            timestamp: timestamp(item.mod_add.when_),
            when: item.mod_add.when_,
            moderator: item.moderator,
            moderatee: item.modded_person,
            type: 'ModAdd'
        }
    }

    return {
        actionName: 'Unknown',
        timestamp: 0,
        when: new Date().toISOString(),
        type: 'All'
    }
}

interface LoadParams {
    url: any
}

export async function load({ url }: LoadParams) {
    const community     = Number(url.searchParams.get('community')) || undefined
    const personId      = Number(url.searchParams.get('other_person_id')) || undefined
    const modId         = Number(url.searchParams.get('mod_id')) || undefined
    const commentID     = Number(url.searchParams.get('comment_id')) || undefined
    const postID        = Number(url.searchParams.get('post_id')) || undefined
    const page          = Number(url.searchParams.get('page')) || 1
    const type: ModlogActionType = (url.searchParams.get('type') as ModlogActionType) || 'All'

    const results = await getClient().getModlog({
        community_id: community,
        limit: 20,
        type_: type,
        page: page,
        mod_person_id: modId,
        other_person_id: personId,
        comment_id: commentID,
        post_id: postID
    })

    const moderation = [
        ...results.banned_from_community,
        ...results.removed_comments,
        ...results.removed_communities,
        ...results.removed_posts,
        ...results.added_to_community,
        ...results.transferred_to_community,
        ...results.featured_posts,
        ...results.locked_posts,
        ...results.admin_purged_comments,
        ...results.admin_purged_communities,
        ...results.admin_purged_posts,
        ...results.admin_purged_persons,
        ...results.hidden_communities,
        ...results.banned,
        ...results.added,
    ]

    const moderationActions = moderation
        .map(_toModLog)
        .sort((a, b) => b.timestamp - a.timestamp)

    return {
        page: page,
        type: type,
        modlog: moderationActions,
    }
}
