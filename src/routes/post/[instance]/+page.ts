import { instance } from '$lib/instance.js'
import { error, redirect } from '@sveltejs/kit'
import { get } from 'svelte/store'

interface LoadParams {
    params: any,
    url: any
}
export function load({ params, url }:LoadParams) {
    // If url parameter is a number, assume it is a post id and redirect (/post/12345 -> /post/{instance}/12345
    if (Number(params.instance)) {
        const split = url.pathname.split('/')
        const post_id = split[2]
        if (Number(post_id)) {
            const inst = get(instance).toLowerCase()    
            throw redirect(300, `/post/${inst}/${post_id}`)
        }
    }

    throw error(404, 'Post Not found')
}
