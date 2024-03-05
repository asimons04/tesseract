import { getInstance } from '$lib/lemmy.js'
import { redirect } from '@sveltejs/kit'

interface LoadParams {
    params: any
}
export function load({ params }: LoadParams) {
    throw redirect(300, `/comment/${getInstance()}/${params.instance}`)
}
