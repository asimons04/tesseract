import type { GetPostsResponse, ListingType, PostView, SortType } from 'lemmy-js-client'

import { addMBFCResults, findCrossposts, filterKeywords, fixHourAheadPosts } from '$lib/components/lemmy/post/helpers'
import { getClient, site } from '$lib/lemmy.js'
import { get } from 'svelte/store'
import { error } from '@sveltejs/kit'
import { profile } from '$lib/auth.js'
import { userSettings } from '$lib/settings.js'

interface LoadParams {
    url: any,
    fetch?: any
}

export async function load({ url }: LoadParams) {
    const page = Number(url.searchParams.get('page') || 1) || 1
    const sort: SortType = (url.searchParams.get('sort') as SortType) || get(userSettings).defaultSort.sort
    const listingType: ListingType = (url.searchParams.get('type') as ListingType) || get(userSettings).defaultSort.feed

    try {
        // Fetch posts
        let [ posts, siteData ] = await Promise.all([
            getClient().getPosts({
                limit: get(userSettings)?.uiState.postsPerPage || 10,
                //page: page,
                //limit: 10,
                sort: sort,
                type_: listingType,
                auth: get(profile)?.jwt,
            }),
            getClient().getSite({})
        ])
        
        site.set(siteData)

        // Fix posts that come in an hour ahead
        posts.posts = fixHourAheadPosts(posts.posts)

        // Filter the posts for keywords
        posts.posts = filterKeywords(posts.posts);

        // Roll up any duplicate posts/crossposts
        posts.posts = findCrossposts(posts.posts);

        // Apply MBFC data object to post
        posts.posts = addMBFCResults(posts.posts);
        
        if (sort == 'New')          posts.posts.sort((a, b) => Date.parse(b.post.published) - Date.parse(a.post.published))
        if (sort == 'Old')          posts.posts.sort((a, b) => Date.parse(a.post.published) - Date.parse(b.post.published))
        if (sort == 'NewComments')  posts.posts.sort((a, b) => Date.parse(b.counts.newest_comment_time) - Date.parse(a.counts.newest_comment_time))
        if (sort == 'Active')       posts.posts.sort((a, b) => b.counts.hot_rank_active - a.counts.hot_rank_active)
        if (sort == 'Hot')          posts.posts.sort((a, b) => b.counts.hot_rank - a.counts.hot_rank)
        if (sort == 'MostComments') posts.posts.sort((a, b) => b.counts.comments - a.counts.comments)
        if (sort.startsWith('Top')) posts.posts.sort((a, b) => b.counts.score - a.counts.score)

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
