import { getInstance } from '$lib/lemmy.js'
import { redirect } from '@sveltejs/kit'

// Instance param, here, will refer to the comment ID:  /comment/123456 -> /comment/{$homeInstance}/123456
interface LoadParams {
    params: any
}
export function load({ params }: LoadParams) {
    throw redirect(300, `/comment/${getInstance()}/${params.instance}`)
}
