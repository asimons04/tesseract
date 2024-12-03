import { get } from 'svelte/store'
import { userSettings } from '$lib/settings'

export type Alignment =
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'top-center'
    | 'left'
    | undefined

export function getMenuAlignment(expandCompact:boolean = false): Alignment {
    const $userSettings = get(userSettings)

    return $userSettings.uiState.reverseActionBar
        ? 'top-left'
        : 'top-right'


    /*
    return $userSettings.uiState.reverseActionBar 
        ? $userSettings.showCompactPosts && !expandCompact
            ? 'bottom-left'
            : 'top-left' 
        :  $userSettings.showCompactPosts && !expandCompact
            ? 'bottom-right'
            : 'top-right'
    */
}