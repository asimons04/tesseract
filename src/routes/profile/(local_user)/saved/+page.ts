import type { 
    CommentView, 
    GetComments,
    GetCommentsResponse,
    GetPosts,
    GetPostsResponse,
    ListingType, 
    PostView, 
    SortType 
} from 'lemmy-js-client'

export type SavedItemType = 'comments' | 'posts'| 'all'

import { get } from 'svelte/store'
import { getClient } from '$lib/lemmy.js'
import { profile } from '$lib/auth.js'
import { userSettings } from '$lib/settings'

interface LoadParams {
    url: URL
}

function getSavedItemPublished(item: PostView | CommentView) {
    if ('comment' in item) return item.comment.published
    else return item.post.published
}

export async function load({ url }: LoadParams) {
    if (!get(profile)) return { posts: [] }

    const page = Number(url.searchParams.get('page')) || 1
    const type: SavedItemType = (url.searchParams.get('type') || 'all') as SavedItemType
    const sort: SortType = (url.searchParams.get('sort') || 'New') as SortType

    const client = getClient()

    const params = {
        saved_only: true,
        limit: get(userSettings)?.uiState.postsPerPage || 20,
        page: page,
        sort: sort,
        type_: 'All' as ListingType
    }

    let posts:GetPostsResponse = { posts: [] }
    let comments:GetCommentsResponse = { comments: [] }


    if (type == 'all') {
        [posts, comments] = await Promise.all([
            client.getPosts(params as GetPosts),
            client.getComments(params as GetComments),
        ])
    }
    else if (type=='comments') {
        comments = await client.getComments(params as GetComments);
    }
    else if (type =='posts') {
        posts = await client.getPosts(params as GetPosts);
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
