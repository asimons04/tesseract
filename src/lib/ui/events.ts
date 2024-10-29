/*  Library to define and dispatch events to 'window' to act as global/app-wide events.  Any custom events must be defined in
    src/app.d.ts under the svelteHTML HTML prop extensions to avoid IDE errors when adding the custom event listeners
*/

// Lock Post
export interface LockPostEvent extends CustomEvent {
    detail: {
        post_id: number,
        locked: boolean,
    }
}

export interface FeaturePostEvent extends CustomEvent {

    detail: {
        post_id: number,
        featured: boolean
        community_id?: number
    }
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

export interface SubscribeEvent extends CustomEvent {
    detail: {
        community_id: number
        subscribed: boolean
    }
}

export interface RemovePostEvent extends CustomEvent {
    detail: {
        post_id: number
        removed: boolean
    }
}

export interface RemoveCommentEvent extends CustomEvent {
    detail: {
        comment_id: number
        removed: boolean
    }
}

export interface PurgePostEvent extends CustomEvent {
    detail: {
        post_id: number
        purged: boolean
    }
}

export interface PurgeCommentEvent extends CustomEvent {
    detail: {
        comment_id: number
        purged: boolean
    }
}

/** Dispatches a custom event to the window which any mounted component can listen for
 * @param name The name of the custom event e.g. blockUser
 * @param detail The details of the event to pass to the window event listener
*/
export const dispatchWindowEvent = function<DetailType> (name:string, detail:DetailType) {
    window.dispatchEvent(
        new CustomEvent(name, { 
            bubbles: true,
            detail: detail
        })
    )
}