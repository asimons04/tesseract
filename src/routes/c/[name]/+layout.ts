import { profile } from '$lib/auth.js'
import { getClient } from '$lib/lemmy.js'
import { userSettings } from '$lib/settings.js'
import type { ListingType, SortType } from 'lemmy-js-client'
import { get } from 'svelte/store'
import { toast } from '$lib/components/ui/toasts/toasts.js'

export async function load(req: any) {
    const page = Number(req.url.searchParams.get('page') || 1) || 1

    const sort: SortType = (req.url.searchParams.get('sort') as SortType) || get(userSettings).defaultSort.sort
    try {
        return {
            sort: sort,
            page: page,
            posts: await getClient(undefined, req.fetch).getPosts({
                limit: 40,
                community_name: req.params.name,
                page: page,
                sort: sort,
                auth: get(profile)?.jwt,
            }),
            community: await getClient(undefined, req.fetch).getCommunity({
                name: req.params.name,
                auth: get(profile)?.jwt,
            }),
        }
    }
    
    // If the community is not found, try to resolve it
    catch {
        toast({
            content: `This community is not known to your instance. Fetching community from its home instance. This may take a moment...`,
            type: 'success',
            duration: 10000
        })

        await getClient(undefined, fetch).resolveObject({
            auth: get(profile)!.jwt!,
            q: '!' + req.params.name,
        })

        return {
            sort: sort,
            page: page,
            posts: await getClient(undefined, req.fetch).getPosts({
                limit: 40,
                community_name: req.params.name,
                page: page,
                sort: sort,
                auth: get(profile)?.jwt,
            }),
            community: await getClient(undefined, req.fetch).getCommunity({
                name: req.params.name,
                auth: get(profile)?.jwt,
            }),
        }
    }
}

