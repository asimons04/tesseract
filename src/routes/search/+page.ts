import { profile } from '$lib/auth.js'
import { getClient, getInstance } from '$lib/lemmy.js'
import { getItemPublished } from '$lib/lemmy/item.js'
import type {
  GetCommunityResponse,
  GetPersonDetailsResponse,
  SearchType,
  SortType,
} from 'lemmy-js-client'
import { get } from 'svelte/store'
interface LoadParams {
    url: URL
}

interface Filters {
    community?: GetCommunityResponse,
    person?: GetPersonDetailsResponse
} 

export async function load({ url }: LoadParams) {
    const query = url.searchParams.get('q')
    const page = Number(url.searchParams.get('page')) || 1
    const community = Number(url.searchParams.get('community_id'))
    const sort = url.searchParams.get('sort') ?? 'New'
    const type = url.searchParams.get('type') ?? 'All'
    const person = Number(url.searchParams.get('person'));
    const limit = Number(url.searchParams.get('limit')) || 50;

    const filters: Filters = {
        community: undefined,
        person: undefined
    }

    if (query) {
        const results = await getClient().search({
            q: query ?? ' ',
            auth: get(profile)?.jwt,
            community_id: community ?? undefined,
            creator_id: person ?? undefined,
            limit: limit,
            page: page,
            sort: (sort as SortType) || 'New',
            listing_type: 'All',
            type_: (type as SearchType) ?? 'All',
        })

        if (community) {
            filters.community = await getClient().getCommunity({
                id: community
            })
        }

        if (person) {
            filters.person = await getClient().getPersonDetails({
                person_id: person
            })
        }

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
                object: ( get(profile)?.jwt && (query.startsWith('!') || query.startsWith('@') || query.startsWith('https://') ))
                ? getClient().resolveObject({
                    auth: get(profile)!.jwt!,
                    q: query,
                })
                : undefined,
            },
        }
    }

    return {
        page: 1,
        sort: sort,
        type: type,
        query: '',

        community_name: community ?? undefined
    }
}
