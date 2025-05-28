import { get } from 'svelte/store'
import { getClient } from '$lib/lemmy.js'
import { instance } from '$lib/instance'
import { error, redirect } from '@sveltejs/kit'
import { userSettings } from '$lib/settings.js'

interface LoadParams {
    params: any,
    url: any,
    fetch?: any
}

export async function load({ params, url }: LoadParams) {
    // Support /post/{post_id}/{comment_id} link formats. Has to be here to avoid route conflicts.
    if (Number(params.instance)) {
        const comment_id = url.pathname.split('/')[3]
        if (Number(comment_id)) {
            const inst = get(instance).toLowerCase()
            console.log("Redirecting to", `/comment/${inst}/${comment_id}`)
            throw redirect(300, `/comment/${inst}/${comment_id}`)
        }
    }
    
    try {
        const post = await getClient(params.instance.toLowerCase()).getPost({
            id: Number(params.id),
        })

        const thread = url.searchParams.get('thread')
        let parentId: number | undefined
        let threadDepth: number | undefined

        if (thread) {
            parentId = Number(thread.split('.')[1])
            threadDepth = thread.split('.').length
            
            if (!Number.isInteger(parentId)) {
                parentId = undefined
            }
        }
        
        // Set the max-depth of comments to fetch. Fetch more layers if loading a particular thread, otherwise base it on the total number of comments.
        const max_depth = (parentId && threadDepth)
            ? (threadDepth <= 50) ? threadDepth : 50
            : (post.post_view.counts.comments > 50) 
                ? 5 
                : 50

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
        console.log(err)
    }
}
