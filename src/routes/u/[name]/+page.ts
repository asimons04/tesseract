import type { SortType, GetPersonDetailsResponse, GetSiteResponse } from 'lemmy-js-client'

import { get } from 'svelte/store'
import { instance as currentInstance} from '$lib/instance'
import { profile } from '$lib/auth.js'
import { getClient, site } from '$lib/lemmy.js'
import { getItemPublished } from '$lib/lemmy/item.js'

import { userSettings } from '$lib/settings'


interface LoadParams {
    params: any,
    url: any,
}

export async function load({ params, url }: LoadParams) {
    let instance =  get(currentInstance)
    let siteData: GetSiteResponse
    
    if (params.name && params.name.split('@')[1]) instance = params.name.split('@')[1]

    try {
        if (instance == get(currentInstance)){
            siteData = get(site) ?? await getClient().getSite()
        }
        else {
            siteData = await getClient(instance).getSite()
        }
    }
    catch {
        siteData = get(site) ?? await getClient().getSite()
    }

    return {
        site: siteData
    }
}
