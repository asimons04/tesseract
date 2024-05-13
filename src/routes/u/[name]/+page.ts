import type { SortType, GetPersonDetailsResponse } from 'lemmy-js-client'

import { get } from 'svelte/store'
import { profile } from '$lib/auth.js'
import { getClient } from '$lib/lemmy.js'
import { getItemPublished } from '$lib/lemmy/item.js'
import { userSettings } from '$lib/settings'


interface LoadParams {
    params: any,
    url: any,
}

export async function load({ params, url }: LoadParams) {
    
    const page = Number(url.searchParams.get('page')) || 1
    const type: 'comments' | 'posts' | 'all' = (url.searchParams.get('type') as 'comments' | 'posts' | 'all') || 'all'
    const sort: SortType = (url.searchParams.get('sort') as SortType) || 'New'
    const limit = Number(url.searchParams.get('limit')) || get(userSettings)?.uiState.postsPerPage || 20

    const user = await getClient().getPersonDetails({
        limit: limit,
        page: page,
        username: params.name ?? get(profile)?.username,
        sort: sort,
    })

    
    const items = [...user.posts, ...user.comments]
    
    if (sort == 'TopAll') {
        items.sort( (a, b) => (b.counts.upvotes - b.counts.downvotes) - (a.counts.upvotes - a.counts.downvotes) )
    }
    
    if (sort == 'New') {
        items.sort( (a, b) => Date.parse(getItemPublished(b)) - Date.parse(getItemPublished(a)) )
    }

    if (sort == 'Old') {
        items.sort( (a, b) => Date.parse(getItemPublished(a)) - Date.parse(getItemPublished(b)) )
    }
    
    console.log("/u/ loader running")
    return {
        limit: limit,
        type: type,
        page: page,
        sort: sort,
        person_view: user.person_view,
        moderates: user.moderates,
        items:items,
    }
}
