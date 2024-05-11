import { DEFAULT_INSTANCE_URL } from '$lib/instance'
import { get } from 'svelte/store'
import { instance } from '$lib/instance'
import { redirect } from '@sveltejs/kit'

// Instance param, here, will refer to the comment ID:  /comment/123456 -> /comment/DEFAULT_INSTANCE/123456
interface LoadParams {
    params: any
}
export function load({ params }: LoadParams) {
    throw redirect(300, `/comment/${get(instance) ?? DEFAULT_INSTANCE_URL}/${params.instance}`)
}
