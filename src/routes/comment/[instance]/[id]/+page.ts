import { getClient } from '$lib/lemmy.js'
import { redirect } from '@sveltejs/kit'

interface loadParams {
    params: any,
}

export async function load({ params }:loadParams) {
    const comment = await getClient(params.instance).getComment({
        id: Number(params.id),
    })

    throw redirect( 300,
        `/post/${params.instance}/${comment.comment_view.post.id}?thread=${comment.comment_view.comment.path}`
    )
}
