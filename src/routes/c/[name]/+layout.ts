import type { ListingType, SortType } from 'lemmy-js-client'

import { addMBFCResults, filterKeywords } from '$lib/components/lemmy/post/helpers'
import { get } from 'svelte/store'
import { getClient } from '$lib/lemmy.js'
import { goto } from '$app/navigation'
import { profile } from '$lib/auth.js'
import { toast } from '$lib/components/ui/toasts/toasts.js'
import { userSettings } from '$lib/settings.js'

export async function load(req: any) {
    // Don't call this loader if accessing the settings panels beyond this path
    if (req.url.pathname.includes('/settings')) return

    const page_cursor = req.url.searchParams.get('page_cursor') ?? undefined
    const sort: SortType = (req.url.searchParams.get('sort') as SortType) ?? get(userSettings).defaultSort.sort ?? 'New'
    const community_name = req.url.searchParams.get('community_name') ?? req.params.name
    
    try {
        let posts = await getClient().getPosts({
            limit: get(userSettings)?.uiState.postsPerPage || 10,
            community_name: community_name,
            page_cursor: page_cursor,
            sort: sort,
        });
        
        // Apply MBFC data object to post
        posts.posts = addMBFCResults(posts.posts);
        
        // Filter the posts for keywords
        posts.posts = filterKeywords(posts.posts);

        return {
            sort: sort,
            posts: posts,
            community_name: community_name,
            community: req.passedCommunity ?? await getClient().getCommunity({
                name: req.params.name,
            }),
        }
    }
    
    // If the community is not found, try to resolve it
    catch {
        if (!get(profile)?.jwt) {
            toast({
                title: "Notice",
                content: `You must be logged in to resolve communities not currently known to this instance.`,
                type: 'warning',
            })
            goto('/communities');
            return

        }
        toast({
            content: `This community is not known to your instance. Fetching community from its home instance. This may take a moment...`,
            type: 'success',
            title: "Please Wait",
            loading: true,
            duration: 15000
        })

        await getClient().resolveObject({
            q: '!' + req.params.name,
        })
        
        let posts = await getClient().getPosts({
            limit: get(userSettings)?.uiState.postsPerPage || 10,
            community_name: req.params.name,
            sort: sort,
        })
        
        // Filter the posts for keywords
        posts.posts = filterKeywords(posts.posts);

        // Apply MBFC data object to post
        posts.posts = addMBFCResults(posts.posts);


        return {
            sort: sort,
            posts: posts,
            community_name: community_name,
            community: await getClient().getCommunity({
                name: req.params.name,
            }),
        }
    }
}

