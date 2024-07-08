/*  Library to define and dispatch events to 'window' to act as global/app-wide events.  Any custom events must be defined in
    src/app.d.ts under the svelteHTML HTML prop extensions to avoid IDE errors when adding the custom event listeners
*/

export interface BlockCommunityEvent extends CustomEvent {
    detail: {
        community_id: number,
        blocked: boolean
    }
}

export interface BlockUserEvent extends CustomEvent {
    detail: {
        person_id: number,
        blocked: boolean
    }
}

export const dispatchWindowEvent = function<DetailType> (name:string, detail:DetailType) {
    window.dispatchEvent(
        new CustomEvent(name, { 
            bubbles: true,
            detail: detail
        })
    )
}