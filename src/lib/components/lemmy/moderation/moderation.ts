import type { SubmissionView } from '$lib/lemmy/contentview.js'
import type { 
    CommentView,
    Community, 
    GetCommunityResponse,
    MyUserInfo, 
    Person, 
    PostView,
} from 'lemmy-js-client'

import { 
    sortOptions as defaultSortOptions, 
    sortOptionNames as defaultSortOptionNames
} from '$lib/lemmy'

import { writable } from 'svelte/store'


export type PostModerationModalPanels = 'none' | 'banning' | 'communityInfo' | 'modlog' | 'messaging' | 'showVotes' | 'removing' | 'reporting' | 'userSubmissions'


interface Modals {
    debug: {
        open: boolean,
        object: any
    },
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
    federationState: {
        open: boolean,
        domain:string
    },
    fediseer: {
        open: boolean
        instance: string
    },
    linkPreview: {
        open: boolean
        url: string
        iframe: boolean
    },
    postModeration: {
        open: boolean
        item: PostView | CommentView | undefined
        panel: PostModerationModalPanels

    }
    quickSettings: {
        open: boolean
        options: {
            listingType: boolean,
            listingTypeOptions: string[]
            listingTypeOptionNames: string[],
            selectedListingType: string,
            listingTypeTitle: string,
            sortMenu: boolean,
            sortOptions: string[],
            sortOptionNames: string[],
            selectedSortOption: string,
            sortPreventDefault: boolean,
            iconSize: number
        }
    },
    user: {
        open: boolean
        user: Person | undefined
        mod: boolean
    },
    community: {
        open: boolean,
        community: Community | undefined
    },
    votes: {
        open: boolean,
        type: 'post' | 'comment',
        submission_id: number
    }
    zooming: {
        open: boolean
        url: string
        altText?: string
    }

}

export let modals = writable<Modals>({
    debug: {
        open: false,
        object: {},
    },

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
    federationState: {
        open: false,
        domain: ''
    },
    fediseer: {
        open: false,
        instance: '',
    },
    linkPreview: {
        open: false,
        url: '',
        iframe: false
    },
    postModeration: {
        open: false,
        item: undefined,
        panel: 'none'
    },
    quickSettings: {
        open: false,
        options: {
            listingType: false,
            listingTypeOptions: ['Subscribed', 'Local', 'All'],
            listingTypeOptionNames: ['Subscribed', 'Local', 'All'],
            selectedListingType: '',
            listingTypeTitle: 'Listing Type',
            sortMenu: false,
            sortOptions: defaultSortOptions,
            sortOptionNames: defaultSortOptionNames,
            selectedSortOption: '',
            sortPreventDefault: false,
            iconSize: 28
        }
    },
    user: {
        open: false,
        user: undefined,
        mod: false,
    },
    community: {
        open: false,
        community: undefined
    },
    votes: {
        open: false,
        type: 'post',
        submission_id: 0
    },
    zooming:{
        open: false,
        url: '',
        altText: ''
    }
})

export function debugModal(object: any) {
    modals.update((m) => ({
        ...m,
        debug: {
            open: true,
            object: object
        }

    }))
}

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

export function userProfileModal(user:Person, mod:boolean=false) {
    modals.update((m) => ({
        ...m,
        user: {
            open: true,
            user: user,
            mod: mod,
        },

    }))
}

export function communityProfileModal(community:Community) {
    modals.update((m) => ({
        ...m,
        community: {
            community: community,
            open: true
        },
    }))
}

export function fediseerModal(instance:string) {
    modals.update((m) => ({
        ...m,
        fediseer: {
            open: true,
            instance: instance
        }
    }))
}

export function federationStateModal(domain:string) {
    modals.update((m) => ({
        ...m,
        federationState: {
            open: true,
            domain: domain
        }
    }))
}

export function zoomImageModal(url:string, altText?:string) {
    modals.update((m) => ({
        ...m,
        zooming: {
            open: true,
            url: url,
            altText: altText
        }
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


/** Launches the link preview modal */
export function linkPreviewModal(url: string, iframe=false) {
    modals.update((m) => ({
        ...m,
        linkPreview: {
            open: true,
            url: url,
            iframe: iframe
        }
    }))
}

export function postModerationModal(item: PostView|CommentView, panel:PostModerationModalPanels = 'none') {
    modals.update((m) => ({
        ...m,
        postModeration: {
            open: true,
            item: item,
            panel: panel
        }
    }))

}

export function quickSettingsModal(options:any) {
    modals.update((m) => ({
        ...m,
        quickSettings: {
            open: true,
            options: options
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

export function isTopMod(me: MyUserInfo|undefined, community: GetCommunityResponse): boolean {
    if (!me) return false
    return me.local_user_view.person.id == community.moderators[0].moderator.id
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
