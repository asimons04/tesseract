import { error } from '@sveltejs/kit'
import { get } from 'svelte/store'
import { getClient } from '$lib/lemmy.js'
import { userSettings } from '$lib/settings.js'


interface LoadParams {
    params: any,
    url: any,
    fetch?: any
}
export async function load({ params, url }: LoadParams) {
    try {
        const post = await getClient(params.instance.toLowerCase()).getPost({
            id: Number(params.id),
        })

        const thread = url.searchParams.get('thread')
        let parentId: number | undefined

        if (thread) {
            parentId = Number(thread.split('.')[1])

            if (!Number.isInteger(parentId)) {
                parentId = undefined
            }
        }
        
        // Set the max-depth of comments to fetch. Fetch more layers if loading a particular thread, otherwise base it on the total number of comments.
        const max_depth = parentId
            ? 15
            : post.post_view.counts.comments > 50 ? 2 : 3

        const sort = get(userSettings)?.defaultSort?.comments ?? 'Hot'

        const commentParams: any = {
            post_id: Number(params.id),
            type_: 'All',
            max_depth: max_depth,
            saved_only: false,
            sort: sort,
            parent_id: parentId,
        }

        return {
            singleThread: parentId != undefined,
            post: post,
            commentSort: sort,
            streamed: {
                comments: getClient(params.instance).getComments(commentParams),
            },
        }
    }
    catch (err) {
        console.log(err);
        throw error(500, {
            message: 'Failed to fetch post.',
        })
    }
}
