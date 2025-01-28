import type { GetPostsResponse, GetSiteResponse, ListingType, PostView, SortType } from 'lemmy-js-client'

import { getClient, site } from '$lib/lemmy.js'
import { get } from 'svelte/store'
import { error } from '@sveltejs/kit'

export async function load() {
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



