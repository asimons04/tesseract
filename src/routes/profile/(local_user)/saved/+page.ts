import type { CommentSortType, CommentView, ListingType, PostView, SortType } from 'lemmy-js-client'

import { get } from 'svelte/store'
import { getClient } from '$lib/lemmy.js'
import { profile } from '$lib/auth.js'
import { userSettings } from '$lib/settings'


function getSavedItemPublished(item: PostView | CommentView) {
    if ('comment' in item) {
        return item.comment.published
    } else {
        return item.post.published
    }
}

export async function load({ url, fetch }) {
    if (!get(profile)) return { posts: [] }

    const page = Number(url.searchParams.get('page')) || 1
    const type: 'comments' | 'posts'| 'all' = url.searchParams.get('type') || 'all'
    const sort: SortType = (url.searchParams.get('sort') as SortType) || 'New'

    const client = getClient(undefined, fetch)

    const params = {
        auth: get(profile)!.jwt!,
        saved_only: true,
        limit: get(userSettings)?.uiState.postsPerPage || 20,
        page: page,
        sort: sort,
        type_: 'All' as ListingType
    }

    let posts:PostView[] = []
    let comments:CommentView[] = []


    if (type == 'all') {
        [posts, comments] = await Promise.all([
            client.getPosts(params),
            client.getComments(params),
        ])
    }
    else if (type=='comments') {
        comments = await client.getComments(params);
    }
    else if (type =='posts') {
        posts = await client.getPosts(params);
        comments = []
    }
    
    const everything = [
        ...posts?.posts || [], 
        ...comments?.comments || []
    ]
    
    if (sort == 'New') everything.sort( (a, b) => Date.parse(getSavedItemPublished(b)) - Date.parse(getSavedItemPublished(a)) )
    if (sort == 'Old') everything.sort( (a, b) => Date.parse(getSavedItemPublished(a)) - Date.parse(getSavedItemPublished(b)) )

    return { 
        data: everything,
        type: type,
        sort: sort,
        page: page,
    }
}
