import type { CommunityView, ListingType } from 'lemmy-js-client'

import { get } from 'svelte/store'
import { getClient } from '$lib/lemmy.js'
import { profile } from '$lib/auth.js'

interface CommunityList {
    communities: Array<CommunityView>
}

function communitySort(a:CommunityView, b:CommunityView) {
    if (a.community.title.toLowerCase() > b.community.title.toLowerCase()) return 1
    if (a.community.title.toLowerCase() < b.community.title.toLowerCase()) return -1
    return 0
}

export async function load({ url, fetch }) {
    const type = url.searchParams.get('type') as ListingType 
    const page = Number(url.searchParams.get('page')) || 1
    const query = url.searchParams.get('q')
    let communities: CommunityList

    let site = await getClient(undefined, fetch).getSite({})

    if (query) {
        communities = await getClient(undefined, fetch).search({
            limit: 40,
            page: page,
            sort: 'TopAll',
            type_: 'Communities',
            listing_type: type,
            q: query,
            auth: get(profile)?.jwt,
        })
        communities.communities.sort(communitySort)
    
    } else {
        communities = await getClient(undefined, fetch).listCommunities({
            limit: 40,
            page: page,
            sort: 'TopAll',
            type_: type,
            auth: get(profile)?.jwt,
        })
        communities.communities.sort(communitySort)
  }

  return {
    communities: communities.communities,
    site: site
  }
}
