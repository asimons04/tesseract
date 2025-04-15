import { instance } from '$lib/instance.js'
import { error, redirect } from '@sveltejs/kit'
import { get } from 'svelte/store'

interface LoadParams {
    params: any,
    url: any
}
export function load({ params, url }:LoadParams) {
    const inst = get(instance).toLowerCase()
    throw redirect(300, `/comment/${inst}/${params.comment_id}`)


}
