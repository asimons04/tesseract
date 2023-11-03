import type {
    CommentView,
    CommunityView,
    Modlog,
    PersonView,
    PostView,

} from 'lemmy-js-client'

export type SidePanelTypes = 'posts' | 'comments' | 'profile' | 'community' | 'modlog' | 'closed'
export type PanelWidths = 'w-full' | 'w-1/5' | 'w-1/4' | 'w-1/3' | 'w-1/2'

export interface ContentRemovalTemplate {
    name: string,
    message: string
}

export interface ContentRemovalTemplateReturn {
    options: string[],
    names: string[]
}



//  Used to hold the modlog-specific variables in the report panel
export interface ModlogContainer {
    url: URL,
    loading:boolean,
    data?:Modlog,
}


// Used to hold posts, person profile, and  comments when loading user data in the report panel
export interface PersonProfile {
        posts?: PostView[],
        comments?: CommentView[],
        person_view?: PersonView,
        loading:boolean,
}

// Holds a named set of mod actions used to pre-populate the mod action form
export interface ModActionFormPreset {
    name: string,
    actions: ModActionList
    community?: CommunityView
    category?: string 

}



export interface ModActionList {
    lock: boolean,
    unlock: boolean,

    remove: boolean,
    removeReason: string,
    removeReplyToAuthor: boolean,

    restore: boolean,
    restoreReason: string,
    restoreReplyToAuthor: string

    banCommunity: boolean,
    banCommunityReason: string,
    banCommunityDeleteData: boolean,
    banCommunityExpires: string
    banCommunityNotify: boolean
    
    unbanCommunity: boolean,
    unbanCommunityReason: string,
    unbanCommunityNotify: boolean

    banInstance: boolean,
    banInstanceReason: string,
    banInstanceDeleteData: boolean,
    banInstanceExpires: string

    unbanInstance: boolean,
    unbanInstanceReason: string
    
    replyReporter: boolean,
    replyReporterText: string,
    replyReporterBody: string,
    replyReporterIncludeActions: boolean
}

// Object containing the actions to perform
export let blank_actions:ModActionList = {
    lock: false,
    unlock: false,

    remove: false,
    removeReason: '',
    removeReplyToAuthor: false,
    
    restore: false,
    restoreReason: '',
    restoreReplyToAuthor: '',
    
    banCommunity: false,
    banCommunityReason: '',
    banCommunityDeleteData: false,
    banCommunityExpires: '',
    banCommunityNotify: false,
    
    unbanCommunity: false,
    unbanCommunityReason: '',
    unbanCommunityNotify: false,

    banInstance: false,
    banInstanceReason: '',
    banInstanceDeleteData: false,
    banInstanceExpires: '',

    unbanInstance: false,
    unbanInstanceReason: '',

    replyReporter: false,
    replyReporterText: '',
    replyReporterBody: '',
    replyReporterIncludeActions: true,
}

let a:ModActionFormPreset = {
    name: "Test",
    actions: blank_actions,
}