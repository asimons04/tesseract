import type { InfiniteScrollStateVars } from '$lib/components/ui/infinitescroll/helpers'
import type { ListingType, SortType } from 'lemmy-js-client'


export interface FeedController {
    load: (initial?:boolean) => Promise<void>
    reset: (clearSnapshot?:boolean) => Promise<void>,
    refresh: (clearSnapshot?: boolean) => Promise<void>,
    scrollBottom: () => void,
    scrollTop: () => void,
    clearSnapshot: () => void,
    takeSnapshot: () => void,
    loadSnapshot: () => boolean,
    
    // Internal State
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