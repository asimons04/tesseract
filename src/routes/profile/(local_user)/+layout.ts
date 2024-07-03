import { getClient } from '$lib/lemmy.js'

export async function load() {
    return (await getClient().getSite()).my_user
}

