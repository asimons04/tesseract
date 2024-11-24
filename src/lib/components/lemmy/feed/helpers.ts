import type { InfiniteScrollStateVars } from '$lib/components/ui/infinitescroll/helpers'
import type { GetPostsResponse, ListingType, PostView, SortType } from 'lemmy-js-client'
import type { StorageController } from '$lib/storage-controller'

import { get } from 'svelte/store'
import { userSettings } from '$lib/settings'

export interface FeedControllerLoadOptions {
    append?: boolean           // Whether the loader should append to the current posts or replace them. Default undefined/false
    loadSnapshot?: boolean     // Whether to load from the snapshot (only needed on initial fetch. Default: undefined/false
}

export interface FeedController {
    invalidate: () => void
    load: (opts?:FeedControllerLoadOptions) => Promise<void>
    reset: (clearSnapshot?:boolean) => Promise<void>,
    refresh: (clearSnapshot?: boolean) => void,
    scrollBottom: () => void,
    scrollTop: () => void,
    clearSnapshot: () => void,
    takeSnapshot: () => Promise<void>,
    loadSnapshot: () => Promise<boolean>,
    
    storage: StorageController
    
    // Internal State
    bound: boolean
    truncated: boolean
    instance: string
    scrollContainer?: HTMLDivElement
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
    show_hidden?: boolean,
    sort: SortType
    storageKey: string,
    type: ListingType
}


export const parseSortType = (sort?:string): SortType => {
    if (!sort)                  return get(userSettings)?.defaultSort.sort ?? 'New'
    switch(sort?.toLowerCase()) {
        case 'old':             return "Old"
        case 'new':             return "New"
        case 'active':          return 'Active'
        case 'hot':             return 'Hot'
        case 'topday':          return "TopDay"
        case 'topweek':         return "TopWeek"
        case 'topmonth':        return 'TopMonth'
        case 'topyear':         return 'TopYear'
        case 'topall':          return 'TopAll'
        case 'mostcomments':    return 'MostComments'
        case 'newcomments':     return 'NewComments'
        case 'tophour':         return 'TopHour'
        case 'topsixhour':      return 'TopSixHour'
        case 'toptwelvehour':   return 'TopTwelveHour'
        case 'topthreemonths':  return 'TopThreeMonths'
        case 'topsixmonths':    return 'TopSixMonths'
        case 'topninemonths':   return 'TopNineMonths'
        case 'controversial':   return 'Controversial'
        case 'scaled':          return 'Scaled'

        default:                return get(userSettings)?.defaultSort.sort ?? 'New'
    }
}

export const parseListingType = (lType?:string|null): ListingType  => {
    if (!lType)             return get(userSettings)?.defaultSort.feed ?? 'All'
    
    switch(lType?.toLowerCase()) {
        case 'all':         return 'All'
        case 'local':       return 'Local'
        case 'subscribed':  return 'Subscribed'
        
        default:            return get(userSettings)?.defaultSort.feed ?? 'All'
    }
}