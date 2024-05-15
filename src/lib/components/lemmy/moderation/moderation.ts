import type { SubmissionView } from '$lib/lemmy/contentview.js'
import type { Community, MyUserInfo, Person, GetPersonDetailsResponse } from 'lemmy-js-client'
import { writable } from 'svelte/store'

interface Modals {
    reporting: {
        open: boolean
        item: SubmissionView | undefined
        reason: string | undefined
    }
    removing: {
        open: boolean
        item: SubmissionView | undefined
        purge: boolean
        reason: string
    }
    banning: {
        open: boolean
        banned: boolean
        user: Person | undefined
        community: Community | undefined
    }
    user: {
        open: boolean
        personDetails: GetPersonDetailsResponse | undefined
        mod: boolean
    }
    votes: {
        open: boolean,
        type: 'post' | 'comment',
        submission_id: number
    }

}

export let modals = writable<Modals>({
    reporting: {
        open: false,
        item: undefined,
        reason: ''
    },
    removing: {
        open: false,
        item: undefined,
        purge: false,
        reason: ''
    },
    banning: {
        open: false,
        banned: false,
        user: undefined,
        community: undefined,
    },
    user: {
        open: false,
        personDetails: undefined,
        mod: false,
    },
    votes: {
        open: false,
        type: 'post',
        submission_id: 0
    }
})

export function report(item: SubmissionView, reason:string='') {
  modals.update((m) => ({
    ...m,
    reporting: {
      open: true,
      item: item,
      reason: reason
    },
  }))
}

export function remove(item: SubmissionView, purge: boolean = false, reason:string='') {
  modals.update((m) => ({
    ...m,
    removing: {
      open: true,
      item: item,
      purge: purge,
      reason: reason,
    },
  }))
}

export function ban(banned: boolean, item: Person, community?: Community) {
    modals.update((m) => ({
        ...m,
        banning: {
            open: true,
            user: item,
            banned: banned,
            community,
        },
    }))
}

export function userProfileModal(personDetails:GetPersonDetailsResponse, mod:boolean=false) {
    modals.update((m) => ({
        ...m,
        user: {
            open: true,
            personDetails: personDetails,
            mod: mod,
        },

    }))

}

/** Launches the vote viewer modal
 * @param type 'post' or 'comment'
 * @param submission_id Post ID or comment ID of the submission to look up
*/
export function voteViewerModal(type:'post'|'comment', submission_id:number) {
    modals.update((m) => ({
        ...m,
        votes: {
            open: true,
            type: type,
            submission_id: submission_id
        }
    }))
}

export function amMod(me: MyUserInfo|undefined, community: Community):boolean {
    if (!me) return false
    return me.moderates.map((c) => c.community.id).includes(community.id) || (community.local && isAdmin(me))
}

export function amModOfAny (me?: MyUserInfo):boolean {
    if (!me) return false
    return me && (me.moderates.length > 0 || isAdmin(me))
}

export function isAdmin (me?: MyUserInfo):boolean {
    if (!me) return false
    return me.local_user_view.local_user.admin
}

export const removalTemplate = (
    input: string,
    content: {
        postTitle?: string
        communityLink?: string
        username?: string
        reason?: string
    }
) => {
    if (content.postTitle) input = input.replaceAll('{{post}}', content.postTitle)
    if (content.communityLink) input = input.replaceAll('{{community}}', content.communityLink)
    if (content.username) input = input.replaceAll('{{username}}', content.username)
    if (content.reason) input = input.replaceAll('{{reason}}', content.reason)
    return input
}
