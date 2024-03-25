import { profile } from '$lib/auth.js'
import { getClient } from '$lib/lemmy.js'
import { getItemPublished } from '$lib/lemmy/item.js'
import type { SortType } from 'lemmy-js-client'
import { get } from 'svelte/store'

interface LoadParams {
    params: any,
    url: any,
    fetch: any
}
export async function load({ params, url, fetch }: LoadParams) {
    const page = Number(url.searchParams.get('page')) || 1
    const type: 'comments' | 'posts' | 'all' = (url.searchParams.get('type') as 'comments' | 'posts' | 'all') || 'all'
    const sort: SortType = (url.searchParams.get('sort') as SortType) || 'New'

    const user = await getClient(undefined, fetch).getPersonDetails({
        limit: 50,
        page: page,
        username: params.name,
        sort: sort,
        auth: get(profile)?.jwt,
    })

    
    const items = [...user.posts, ...user.comments]

  if (sort == 'TopAll') {
    items.sort(
      (a, b) =>
        b.counts.upvotes -
        b.counts.downvotes -
        (a.counts.upvotes - a.counts.downvotes)
    )
  } else if (sort == 'New') {
    items.sort(
      (a, b) =>
        Date.parse(getItemPublished(b)) - Date.parse(getItemPublished(a))
    )
  }

  return {
    type: type,
    page: page,
    sort: sort,
    person_view: user.person_view,
    moderates: user.moderates,
    items,
    posts: user.posts,
    comments: user.comments
  }
}
