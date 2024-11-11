import type {
    GetCommunityResponse,
    GetPersonDetailsResponse,
    SearchType,
    SortType,
} from 'lemmy-js-client'
  
import { get } from 'svelte/store'
import { getClient, getInstance } from '$lib/lemmy.js'
import { getItemPublished } from '$lib/lemmy/item.js'
import { profile } from '$lib/auth.js'


interface LoadParams {
    url: URL
}

interface Filters {
    community?: GetCommunityResponse,
    person?: GetPersonDetailsResponse
} 

export async function load({ url }: LoadParams) {
    const community = url.searchParams.get('community_id')
        ? Number(url.searchParams.get('community_id'))
        : undefined

    const person    =  url.searchParams.get('person_id')
        ? Number(url.searchParams.get('person_id'))
        : undefined

    const page      = Number(url.searchParams.get('page')) || 1
    const sort      = url.searchParams.get('sort') ?? 'New'
    
    const limit     = Number(url.searchParams.get('limit')) || 50;
    let query     = url.searchParams.get('q') ?? ((community || person) ? ' ' : undefined)
    let type      = url.searchParams.get('type') ?? 'All'
    let originalQuery = query

    if (query?.startsWith('@')) {
        type = 'Users'
        query = query.substring(1)
    }

    if (query?.startsWith('!')) {
        type = 'Communities'
        query = query.substring(1)
    }

    const filters: Filters = {
        community: undefined,
        person: undefined
    }


    if (community) {
        filters.community = await getClient().getCommunity({
            id: community
        })
    }

    if (person) {
        filters.person = await getClient().getPersonDetails({
            person_id: person,
            limit: 1
        })
    }


    if (query && originalQuery) {
        const results = await getClient().search({
            q: query ?? ' ',
            community_id: community ?? undefined,
            creator_id: person ?? undefined,
            limit: limit,
            page: page,
            sort: (sort as SortType) || 'New',
            listing_type: 'All',
            type_: (type as SearchType) ?? 'All',
        })

        

        const [posts, comments, users, communities] = [
            results.posts,
            results.comments,
            results.users,
            results.communities,
        ]

        const everything = sort == 'New'
            ? [...posts, ...comments, ...users, ...communities].sort(
                (a, b) => Date.parse(getItemPublished(b)) - Date.parse(getItemPublished(a))
            )
            : [...posts, ...comments, ...users, ...communities].sort(
                (a, b) => Date.parse(getItemPublished(b)) + Date.parse(getItemPublished(a))
            )


        

        const counts = {
            posts: results.posts.length,
            comments: results.comments.length,
            users: results.users.length,
            communities: results.communities.length,
            total: everything.length
        }

        return {
            page: page,
            sort: sort,
            type: type,
            community_id: community ?? undefined,
            person: person ?? undefined,
            query: query ?? ' ',
            counts: counts,
            filters: filters,
            results: everything,
            limit: limit,
            streamed: {
                object: ( get(profile)?.jwt && (originalQuery?.startsWith('!') || originalQuery?.startsWith('@') || originalQuery?.startsWith('https://')) )
                ? getClient().resolveObject({
                    q: originalQuery,
                })
                : undefined,
            },
        }
    }

    return {
        page: 1,
        sort: sort,
        type: type,
        filters: filters,
        query: '',

        community_name: community ?? undefined
    }
}
