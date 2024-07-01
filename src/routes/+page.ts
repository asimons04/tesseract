import type { GetPostsResponse, GetSiteResponse, ListingType, PostView, SortType } from 'lemmy-js-client'

import { addMBFCResults, findCrossposts, filterKeywords, sortPosts } from '$lib/components/lemmy/post/helpers'
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
    const page_cursor = url.searchParams.get('page_cursor')
    const sort: SortType = (url.searchParams.get('sort') as SortType) || get(userSettings).defaultSort.sort
    const listingType: ListingType = (url.searchParams.get('type') as ListingType) || get(userSettings).defaultSort.feed
    
    try {
        // Fetch posts
        let [ posts, siteData ] = await Promise.all([
            getClient().getPosts({
                limit: get(userSettings)?.uiState.postsPerPage || 10,
                sort: sort,
                type_: listingType,
                page_cursor: page_cursor,
            }),
            passedSite ?? getClient().getSite()
        ])
        
        site.set(siteData)

        // Filter the posts for keywords
        posts.posts = filterKeywords(posts.posts);

        // Roll up any duplicate posts/crossposts
        posts.posts = findCrossposts(posts.posts);

        // Apply MBFC data object to post
        posts.posts = addMBFCResults(posts.posts);
        
        // Only sort the first fetch. If a site object is passed, it can be used to indicate this is a re-fetch (which are sorted after being retrieved)
        //if (!passedSite) posts.posts = sortPosts(posts.posts, sort)

        // Return the data to the frontend
        return {
            sort: sort,
            listingType: listingType,
            posts: posts,
            site: siteData,
            type: listingType
        }
        
    } catch (err) {
        console.log(err)
        throw error(500, {
            message: 'Failed to fetch homepage.',
        })
    }
}
