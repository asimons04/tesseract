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

export async function load({ url }) {
    const query = url.searchParams.get('q')
    const page = Number(url.searchParams.get('page')) || 1
    const community = Number(url.searchParams.get('community_id'))
    const sort = url.searchParams.get('sort') ?? 'New'
    const type = url.searchParams.get('type') ?? 'All'
    const person = Number(url.searchParams.get('person'));
    const limit = Number(url.searchParams.get('limit')) || 50;

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
            type: type,
            community_id: community ?? undefined,
            person: person ?? undefined,
            query: query ?? ' ',
            fullResults: results,
            results: everything,
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
