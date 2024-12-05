/*  Library to define and dispatch events to 'window' to act as global/app-wide events.  Any custom events must be defined in
    src/app.d.ts under the svelteHTML HTML prop extensions to avoid IDE errors when adding the custom event listeners
*/

import type { SortType } from "lemmy-js-client"







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

export interface ChangeProfileEvent extends CustomEvent {
    detail: {
        pid: number
    }
}

export interface ClickIntoPostEvent extends CustomEvent {
    detail: {
        post_id: number
    }
}

export interface DistinguishCommentEvent extends CustomEvent {
    detail: {
        comment_id: number
        distinguished: boolean
    }
}

export interface FeaturePostEvent extends CustomEvent {

    detail: {
        post_id: number,
        featured: boolean
        community_id?: number
    }
}

export interface HideCommunityEvent extends CustomEvent {
    detail: { 
        community_id: number
        hidden: boolean
    }
}

export interface HidePostEvent extends CustomEvent {
    detail: {
        hide: boolean,
        post_ids: number[]
    }
}

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

export interface PurgeCommentEvent extends CustomEvent {
    detail: {
        comment_id: number
        purged: boolean
    }
}

export interface PurgePostEvent extends CustomEvent {
    detail: {
        post_id: number
        purged: boolean
    }
}

export interface RemoveCommentEvent extends CustomEvent {
    detail: {
        comment_id: number
        removed: boolean
    }
}

export interface RemoveCommunityEvent extends CustomEvent {
    detail: { 
        community_id: number
        removed: boolean
    }
}


export interface RemovePostEvent extends CustomEvent {
    detail: {
        post_id: number
        removed: boolean
    }
}

export interface ScrollPostIntoViewEvent extends CustomEvent {
    detail: {
        post_id: number
    }
}

export interface SetSortTypeEvent extends CustomEvent {
    detail: {
        sort: SortType
    }
}

export interface SubscribeEvent extends CustomEvent {
    detail: {
        community_id: number
        subscribed: boolean
    }
}

export interface SystemTimerEvent extends CustomEvent {
    detail: {
        timestamp: number
    }
}


/** Dispatches a custom event to the window which any mounted component can listen for
 * @param name The name of the custom event e.g. blockUser
 * @param detail The details of the event to pass to the window event listener
*/
export const dispatchWindowEvent = function<DetailType> (name:string, detail?:DetailType) {
    window.dispatchEvent(
        new CustomEvent(name, { 
            bubbles: true,
            detail: detail
        })
    )
}