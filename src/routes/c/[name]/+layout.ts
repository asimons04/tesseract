import type { ListingType, SortType } from 'lemmy-js-client'

import { findCrossposts, filterKeywords } from '$lib/components/lemmy/post/helpers'
import { get } from 'svelte/store'
import { getClient } from '$lib/lemmy.js'
import { goto } from '$app/navigation'
import { profile } from '$lib/auth.js'
import { toast } from '$lib/components/ui/toasts/toasts.js'
import { userSettings } from '$lib/settings.js'

export async function load(req: any) {
    const page = Number(req.url.searchParams.get('page') || 1) || 1

    const sort: SortType = (req.url.searchParams.get('sort') as SortType) || get(userSettings).defaultSort.sort
    
    
    try {
        let posts = await getClient(undefined, req.fetch).getPosts({
            limit: 40,
            community_name: req.params.name,
            page: page,
            sort: sort,
            auth: get(profile)?.jwt,
        });
        
        // Filter the posts for keywords
        posts = filterKeywords(posts.posts);

        return {
            sort: sort,
            page: page,
            posts: posts,
            community: await getClient(undefined, req.fetch).getCommunity({
                name: req.params.name,
                auth: get(profile)?.jwt,
            }),
        }
    }
    
    // If the community is not found, try to resolve it
    catch {
        if (!get(profile)?.jwt) {
            toast({
                content: `You must be logged in to resolve communities not currently known to this instance.`,
                type: 'warning',
            })
            goto('/communities');
            return

        }
        toast({
            content: `This community is not known to your instance. Fetching community from its home instance. This may take a moment...`,
            type: 'success',
            duration: 10000
        })

        await getClient(undefined, fetch).resolveObject({
            auth: get(profile)!.jwt!,
            q: '!' + req.params.name,
        })
        
        let posts = await getClient(undefined, req.fetch).getPosts({
            limit: 40,
            community_name: req.params.name,
            page: page,
            sort: sort,
            auth: get(profile)?.jwt,
        })
        
        // Filter the posts for keywords
        posts = filterKeywords(posts.posts);


        return {
            sort: sort,
            page: page,
            posts: posts,
            community: await getClient(undefined, req.fetch).getCommunity({
                name: req.params.name,
                auth: get(profile)?.jwt,
            }),
        }
    }
}

