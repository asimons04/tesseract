import type { InfiniteScrollStateVars } from '$lib/components/ui/infinitescroll/helpers'
import type { ListingType, SortType } from 'lemmy-js-client'


export interface FeedControllerLoadOptions {
    append?: boolean           // Whether the loader should append to the current posts or replace them. Default undefined/false
    loadSnapshot?: boolean     // Whether to load from the snapshot (only needed on initial fetch. Default: undefined/false
}

export interface FeedController {
    load: (opts?:FeedControllerLoadOptions) => Promise<void>
    reset: (clearSnapshot?:boolean) => Promise<void>,
    refresh: (clearSnapshot?: boolean) => Promise<void>,
    scrollBottom: () => void,
    scrollTop: () => void,
    clearSnapshot: () => void,
    takeSnapshot: () => void,
    loadSnapshot: () => boolean,
    
    // Internal State
    instance: string
    scrollContainer: HTMLDivElement
    scrollState: InfiniteScrollStateVars
    loading: boolean
    refreshing: boolean
    mounting: boolean
    clearingSnapshot: boolean
    loadedFromSnapshot: boolean
    last_refreshed: number
    page: number
    last_clicked_post?: number
    page_cursors: (string|undefined)[]

    // Getters/Setters
    isLoading: boolean
    busy: boolean
    community_id?: number
    community_name?: string
    data: any
    disliked_only?: boolean,
    liked_only?: boolean,
    saved_only?: boolean,
    sort: SortType
    storageKey: string,
    type: ListingType
}