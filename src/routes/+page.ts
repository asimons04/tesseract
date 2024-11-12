import type { GetPostsResponse, GetSiteResponse, ListingType, PostView, SortType } from 'lemmy-js-client'

import { getClient, site } from '$lib/lemmy.js'
import { get } from 'svelte/store'
import { error } from '@sveltejs/kit'
import { profile } from '$lib/auth.js'
import { userSettings } from '$lib/settings.js'

interface LoadParams {
    url: any,
    fetch?: any,
    passedSite?: GetSiteResponse    // Pass back the site info so we don't have to fetch it again (used for infinite scroll new batches)
}


export async function load({ url, passedSite }: LoadParams) {
    try {
        let siteData = get(site) ?? (await getClient().getSite())
        site.set(siteData)
        return {
            site: siteData
        }
    }
    catch (err) {
        console.log(err)
        throw error(500, {
            message: 'Failed to fetch homepage.',
        })
    }

}



