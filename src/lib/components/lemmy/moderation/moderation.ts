import type{ CommunityGroup } from '$lib/auth'
import type { SubmissionView } from '$lib/lemmy/contentview.js'
import type { 
    CommentView,
    Community, 
    GetCommunityResponse,
    MyUserInfo, 
    Person, 
    PersonView, 
    PostView,
    PrivateMessageView,
} from 'lemmy-js-client'

import { 
    sortOptions as defaultSortOptions, 
    sortOptionNames as defaultSortOptionNames,
    getClient
} from '$lib/lemmy'

import { get } from 'svelte/store'
import { page } from '$app/stores'
import { pushState, replaceState } from '$app/navigation'
import { writable } from 'svelte/store'
import { isCommentView, isPostView, isUser } from '$lib/lemmy/item'
import { dispatchWindowEvent } from '$lib/ui/events'
import { toast } from '$lib/components/ui/toasts/toasts'

export type PostModerationModalPanels = 
    'none' | 
    'banning' | 
    'communityBanning' |
    'communityInfo' | 
    'modlog' | 
    'messaging' | 
    'showVotes' | 
    'removing' | 
    'reporting' | 
    'userSubmissions'


interface Modals {
    addCommunityToGroup: {
        open: boolean,
        community: Community | undefined
    },

    editCommunityGroup: {
        open: boolean,
        group: CommunityGroup | undefined
    }

    debug: {
        open: boolean,
        object: any
    },
    reporting: {
        open: boolean
        item: PostView | CommentView | PrivateMessageView | undefined
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
    postViewer: {
        open: boolean
        instance?: string | undefined
        comment_id?: number
        post_id?: number
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
    zooming: {
        open: boolean
        url: string
        altText?: string
    }

}

export let modals = writable<Modals>({
    addCommunityToGroup: {
        open: false,
        community: undefined
    },

    editCommunityGroup: {
        open: false,
        group: undefined
    },

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
    postViewer: {
        open: false,
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
    zooming:{
        open: false,
        url: '',
        altText: ''
    }
})

// Launches the modal to add the provided community to a group
export function addCommunityToGroup(community: Community) {
    modals.update((m) => ({
        ...m,
        addCommunityToGroup: {
            open: true,
            community: community
        }
    }))
    pushState('', {
        modals: {
            ...get(page).state.modals,
            AddCommunityGroupModal: true
        }
    })
}

// Ban Person Modal (Deprecated since PostModerationModal??)
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
    pushState('', {
        modals: {
            ...get(page).state.modals,
            BanModal: true
        }
    })
}


// Community Profile Modal
export function communityProfileModal(community:Community) {
    modals.update((m) => ({
        ...m,
        community: {
            community: community,
            open: true
        },
    }))
    pushState('', {
        modals: {
            ...get(page).state.modals,
            CommunityProfileModal: true
        }
    })
}

// Launches the modal to edit the provided community group
export function editCommunityGroup(group: CommunityGroup) {
    modals.update((m) => ({
        ...m,
        editCommunityGroup: {
            open: true,
            group: group
        }
    }))
    pushState('', {
        modals: {
            ...get(page).state.modals,
            EditCommunityGroupModal: true
        }
    })
}

// Debug Object Modal
export function debugModal(object: any) {
    modals.update((m) => ({
        ...m,
        debug: {
            open: true,
            object: object
        }
    }))
    pushState('', {
        modals: {
            ...get(page).state.modals,
            DebugModal: true
        }
    })
}


// Federation State Modal
export function federationStateModal(domain:string) {
    modals.update((m) => ({
        ...m,
        federationState: {
            open: true,
            domain: domain
        }
    }))
    pushState('', { 
        modals: { 
            ...get(page).state.modals,
            FederationStateModal: true 
        } 
    })
}

// Fediseer Modal
export function fediseerModal(instance:string) {
    modals.update((m) => ({
        ...m,
        fediseer: {
            open: true,
            instance: instance
        }
    }))
    pushState('', { 
        modals: { 
            ...get(page).state.modals,
            FediseerModal: true 
        } 
    })
}


// Link Preview Modal
export function linkPreviewModal(url: string, iframe=false) {
    modals.update((m) => ({
        ...m,
        linkPreview: {
            open: true,
            url: url,
            iframe: iframe
        }
    }))
    pushState('', {
        modals: {
            ...get(page).state.modals,
            LinkPreviewModal: true
        }
    })
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
    pushState('', { 
        modals: { 
            ...get(page).state.modals,
            PostModerationModal: true 
        } 
    })

}

// Post Viewer Modal
export function postViewerModal(instance?: string, post_id?:number, comment_id?:number) {
    modals.update((m) => ({
        ...m,
        postViewer: {
            open: true,
            instance: instance,
            post_id: post_id,
            comment_id: comment_id
        }
    }))
    
    // Only push state if not already open; prevents multiple history events if clicking nested post/comment links in a modal
    if (!get(page).state?.modals?.PostViewModal) {
        pushState('', { 
            modals: { 
                ...get(page).state.modals, 
                PostViewModal: true 
            } 
        })
    }

}

// Quick Settings Modal
export function quickSettingsModal(options:any) {
    modals.update((m) => ({
        ...m,
        quickSettings: {
            open: true,
            options: options
        }
    }))
    pushState('', { 
        modals: { 
            ...get(page).state.modals,
            QuickSettingsModal: true 
        } 
    })
}

// Remove Item Modal
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
    pushState('', { 
        modals: { 
            ...get(page).state.modals,
            RemoveModal: true 
        } 
    })
}

// Report Item Modal
export function report(item: PostView | CommentView | PrivateMessageView, reason:string='') {
    modals.update((m) => ({
        ...m,
        reporting: {
            open: true,
            item: item,
            reason: reason
        },
    }))
    pushState('', { 
        modals: { 
            ...get(page).state.modals,
            ReportModal: true 
        } 
    })
}

// User Profile Modal
export function userProfileModal(user:Person, mod:boolean=false) {
    modals.update((m) => ({
        ...m,
        user: {
            open: true,
            user: user,
            mod: mod,
        }
    }))
    pushState('', {
        modals: {
            ...get(page).state.modals,
            UserProfileModal: true
        }
    })
}

// Zoomable Image Modal
export function zoomImageModal(url:string, altText?:string) {
    modals.update((m) => ({
        ...m,
        zooming: {
            open: true,
            url: url,
            altText: altText
        }
    }))
    pushState('', {
        modals: {
            ...get(page).state.modals,
            ZoomImageModal: true
        }
    })
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


export interface ModQueueList {
    posts: PostView[]
    comments: CommentView[],
    users: PersonView[],
}



export class ModQueue {
    queue: ModQueueList
    constructor() {
        this.queue = {
            posts: [] as PostView[],
            comments: [] as CommentView[],
            users: [] as PersonView[]
        } as ModQueueList
    }

    add (item:CommentView|PostView|PersonView) {
        if (isCommentView(item) && this.queue.comments.findIndex((c) => c.comment.id == item.comment.id) < 0) {
            this.queue.comments.push(item)
            return
        }

        if (isPostView(item) && this.queue.comments.findIndex((c) => c.comment.id == item.post.id) < 0) {
            this.queue.posts.push(item)
            return
        }

        if (isUser(item) && this.queue.users.findIndex((c) => c.person.id == item.person.id) < 0) {
            this.queue.users.push(item)
            return
        }
        
    }

    clear() {
        this.queue.posts      = []
        this.queue.comments   = []
        this.queue.users      = []
    }

    containsComment(comment_id:number) {
        return (this.queue.comments.findIndex((c) => c.comment.id == comment_id) >= 0)
    }

    containsPost(post_id:number) {
        return (this.queue.posts.findIndex((c) => c.post.id == post_id) >= 0)
    }

    containsUser(person_id:number) {
        return (this.queue.users.findIndex((c) => c.person.id == person_id) >= 0)
    }

    delete(item:CommentView|PostView|PersonView) {
        const index = isCommentView(item)
            ? this.queue.comments.findIndex((c) => c.comment.id == item.comment.id)
            : isPostView(item)
                ? this.queue.comments.findIndex((c) => c.comment.id == item.post.id)
                : isUser(item)
                    ? this.queue.users.findIndex((c) => c.person.id === item.person.id)
                    : -1

        if (index >= 0 && isCommentView(item)) {
            this.queue.comments.splice(index,1)
            return
        }

        if (index >= 0 && isPostView(item)) {
            this.queue.posts.splice(index,1)
            return
        }

        if (index >=0 && isUser(item)) {
            this.queue.users.splice(index,1)
            return
        }
    }

    list() {
        return this.queue
    }

    async removeAllComments(form: {remove: boolean, reason?:string, banCommunity?:boolean, banSite?:boolean, banCommunityExpiry?:number, banSiteExpiry?:number}    ) {
        if (this.queue.comments.length < 1) {
            toast({
                title: "No Comments Selected",
                type: 'warning',
                content: `You must select one or more comments to ${form.remove ? 'remove' : 'restore'}.`
            })
            return
        }

        let successful = [] as CommentView[]
        
        for (let i:number = 0; i < this.queue.comments.length; i++) {
            const item = this.queue.comments[i]
            let comment_view: CommentView | undefined = undefined
            
            // Remove Comment if it's removed state does not match the desired state
            try {
                if (item.comment.removed != form.remove && !item.comment.deleted) {
                    comment_view = (await getClient().removeComment({
                        comment_id: item.comment.id,
                        removed: form.remove,
                        reason: form.reason
                    })).comment_view
                }
                dispatchWindowEvent('editComment', {
                    comment_view: comment_view ?? item
                })
                successful.push(item)
            }
            catch {}
        }
        
        // Delete the successful items from the queue
        for (let i:number = 0; i < successful.length; i++) {
            this.delete(successful[i])
        }

        if (successful.length == 0) {
            toast({
                title: "Operation Failed",
                type: 'error',
                content: `Failed to ${form.remove ? 'remove' : 'restore'} ${this.queue.comments.length > 1 ? 'any selected comments' : 'the selected comment'}.`
            })
        }
        else if (this.queue.comments.length > 0) {
            toast({
                title: "Partial Operation Complete",
                type: 'warning',
                content: `Successfully ${form.remove ? 'removed' : 'restored'} ${successful.length} out of ${this.queue.comments.length + successful.length}`
            })
        }
        else {
            toast({
                title: "Operation Complete",
                type: 'success',
                content: `Successfully ${form.remove ? 'removed' : 'restored'} ${successful.length} comments.`
            })
        }

    }

}


