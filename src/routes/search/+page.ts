import { profile } from '$lib/auth.js'
import { getClient, getInstance } from '$lib/lemmy.js'
import { getItemPublished } from '$lib/lemmy/item.js'
import type {
  CommentView,
  CommunityView,
  PersonView,
  PostView,
  SearchResponse,
  SearchType,
  SortType,
} from 'lemmy-js-client'
import { get } from 'svelte/store'

export async function load({ url, fetch }) {
    const query = url.searchParams.get('q')
    const page = Number(url.searchParams.get('page')) || 1
    const community = url.searchParams.get('community_name')
    const sort = url.searchParams.get('sort')
    const type = url.searchParams.get('type')
    const person = url.searchParams.get('person');
    const limit = url.searchParams.get('limit') || 40;

    if (query) {
        const results = await getClient(getInstance(), fetch).search({
            q: query,
            auth: get(profile)?.jwt,
            community_name: community ?? undefined,
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

        const everything = [...posts, ...comments, ...users, ...communities].sort(
            (a, b) => Date.parse(getItemPublished(b)) - Date.parse(getItemPublished(a))
        )

        return {
            page: page,
            sort: sort,
            community_name: community ?? undefined,
            results: everything,
            streamed: {
                object: ( get(profile)?.jwt && (query.startsWith('!') || query.startsWith('@') || query.startsWith('https://') ))
                ? getClient(undefined, fetch).resolveObject({
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
        community_name: community ?? undefined
    }
}
