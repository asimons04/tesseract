import type { GetPostsResponse, ListingType, PostView, SortType } from 'lemmy-js-client'

import { addMBFCResults, findCrossposts, filterKeywords } from '$lib/components/lemmy/post/helpers'
import { getClient, site } from '$lib/lemmy.js'
import { get } from 'svelte/store'
import { error } from '@sveltejs/kit'
import { profile } from '$lib/auth.js'
import { userSettings } from '$lib/settings.js'

interface LoadParams {
    url: any,
    fetch: any
}

export async function load({ url }: LoadParams) {
    const page = Number(url.searchParams.get('page') || 1) || 1
    const sort: SortType = (url.searchParams.get('sort') as SortType) || get(userSettings).defaultSort.sort
    const listingType: ListingType = (url.searchParams.get('type') as ListingType) || get(userSettings).defaultSort.feed
   
    try {
        // Fetch posts
        let [ posts, siteData ] = await Promise.all([
            getClient().getPosts({
                //limit: get(userSettings)?.uiState.postsPerPage || 20,
                //page: page,
                limit: 20,
                sort: sort,
                type_: listingType,
                auth: get(profile)?.jwt,
            }),
            getClient().getSite({})
        ])
        
        site.set(siteData)
        // Filter the posts for keywords
        posts.posts = filterKeywords(posts.posts);

        // Roll up any duplicate posts/crossposts
        posts.posts = findCrossposts(posts.posts);

        // Apply MBFC data object to post
        posts.posts = addMBFCResults(posts.posts);
        
        // Return the data to the frontend
        return {
            sort: sort,
            listingType: listingType,
            page: page,
            posts: posts,
            site: siteData,
        }
    } catch (err) {
        console.log(err)
        throw error(500, {
            message: 'Failed to fetch homepage.',
        })
    }
}
