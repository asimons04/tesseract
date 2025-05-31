/*  Library to define and dispatch events to 'window' to act as global/app-wide events.  Any custom events must be defined in
    src/app.d.ts under the svelteHTML HTML prop extensions to avoid IDE errors when adding the custom event listeners
*/

import type { PostViewType } from "$lib/settings"
import type { CommentView, PostView, SortType } from "lemmy-js-client"

export type TesseractEvent = 
    'banUser'               |
    'banCommunity'          | 
    'blockUser'             |
    'blockCommunity'        |
    'blockInstance'         |
    'changeCompactView'     |
    'changeProfile'         |
    'changeView'            |
    'clickIntoPost'         |
    'distinguishComment'    |
    'editComment'           |
    'editPost'              |
    'expandAll'             |
    'featurePost'           |
    'filterCommunity'       |
    'filterUser'            |
    'hideCommunity'         |
    'hidePost'              |
    'lastClickedPost'       |
    'lockPost'              |
    'purgeComment'          |
    'purgePost'             |
    'refreshFeed'           |
    'removeComment'         |
    'removeCommunity'       |
    'removePost'            |
    'requestSnapshot'       |
    'scrollPostIntoView'    |
    'setSortType'           |
    'subscribe'             |
    'systemTimer'


/** Dispatches a custom event to the window which any mounted component can listen for
 * @param name The name of the custom event e.g. blockUser
 * @param detail The details of the event to pass to the window event listener
*/
export const dispatchWindowEvent = function<DetailType> (name:TesseractEvent, detail?:DetailType) {
    window.dispatchEvent(
        new CustomEvent(name, { 
            bubbles: true,
            detail: detail
        })
    )
}


// Ban User From Community
export interface BanCommunityEvent extends CustomEvent {
    detail: {
        person_id: number,
        banned: boolean,
        community_id: number
        remove_content: boolean
    }
}

// Ban user from instance
export interface BanUserEvent extends CustomEvent {
    detail: {
        person_id: number,
        banned: boolean,
        remove_content: boolean
    }
}

// Blocking a Community
export interface BlockCommunityEvent extends CustomEvent {
    detail: {
        community_id: number,
        blocked: boolean
    }
}

// Blocking an instance
export interface BlockInstanceEvent extends CustomEvent {
    detail: {
        instance_id: number,
        blocked: boolean
    }
}

// Blocking a User
export interface BlockUserEvent extends CustomEvent {
    detail: {
        person_id: number,
        blocked: boolean
    }
}

// Changing profiles in the UI
export interface ChangeProfileEvent extends CustomEvent {
    detail: {
        pid: number
    }
}

export interface ChangeViewEvent extends CustomEvent {
    detail: {
        view: PostViewType
    }
}

// Dispatched when clicking into a post (usually used to close the open modal that initiated it)
export interface ClickIntoPostEvent extends CustomEvent {
    detail: {
        post_id: number
    }
}

// Distinguish a comment
export interface DistinguishCommentEvent extends CustomEvent {
    detail: {
        comment_id: number
        distinguished: boolean
    }
}

// Fires when a post is edited
export interface EditCommentEvent extends CustomEvent {
    detail: {
        comment_view: CommentView
    }
}

// Fires when a post is edited
export interface EditPostEvent extends CustomEvent {
    detail: {
        post: PostView
    }
}


export interface ExpandAllInboxItemEvent extends CustomEvent {
    detail: {
        expanded: boolean
    }
}

// Feature a post (community or instance)
export interface FeaturePostEvent extends CustomEvent {

    detail: {
        post_id: number,
        featured: boolean
        community_id?: number
    }
}

// Filter a Community
export interface FilterCommunityEvent extends CustomEvent {
    detail: {
        actor_id: string
        filtered: boolean
    }
}

export interface FilterUserEvent extends CustomEvent {
    detail: {
        actor_id: string
        filtered: boolean
    }
}

// Hide a Community
export interface HideCommunityEvent extends CustomEvent {
    detail: { 
        community_id: number
        hidden: boolean
    }
}

// Hide a Post
export interface HidePostEvent extends CustomEvent {
    detail: {
        hide: boolean,
        post_ids: number[]
    }
}

// Dispatches on touchStart/mouseover/click from posts to track the last one that was interacted with; used to restore scroll position when reloading feed from snapshot
export interface LastClickedPostEvent extends CustomEvent {
    detail: {
        post_id: number
    }
}

// Lock Post
export interface LockPostEvent extends CustomEvent {
    detail: {
        post_id: number,
        locked: boolean,
    }
}

// Purging a Comment
export interface PurgeCommentEvent extends CustomEvent {
    detail: {
        comment_id: number
        purged: boolean
    }
}

// Purging a Post
export interface PurgePostEvent extends CustomEvent {
    detail: {
        post_id: number
        purged: boolean
    }
}

// Remove Comment
export interface RemoveCommentEvent extends CustomEvent {
    detail: {
        comment_id: number
        removed: boolean
    }
}

// Remove Community
export interface RemoveCommunityEvent extends CustomEvent {
    detail: { 
        community_id: number
        removed: boolean
    }
}

// Remove Post
export interface RemovePostEvent extends CustomEvent {
    detail: {
        post_id: number
        removed: boolean
    }
}

// Triggers a post to scroll itself into view
export interface ScrollPostIntoViewEvent extends CustomEvent {
    detail: {
        post_id: number
    }
}

// Triggers when the sort type changes (used on main feed to plumb in external controls for feed component)
export interface SetSortTypeEvent extends CustomEvent {
    detail: {
        sort: SortType
    }
}

// Dispatches when subscribing/unsubscribing to a community
export interface SubscribeEvent extends CustomEvent {
    detail: {
        community_id: number
        subscribed: boolean
    }
}

// Dispatched from the app-level setInterval to trigger updates in the UI
export interface SystemTimerEvent extends CustomEvent {
    detail: {
        timestamp: number
    }
}
