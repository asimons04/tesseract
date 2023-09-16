import { getClient } from '$lib/lemmy.js'
import { error } from '@sveltejs/kit'
import { LINKED_INSTANCE_URL } from "$lib/instance.js";

export async function load(req: any) {
    try {
        const site = await getClient(LINKED_INSTANCE_URL ?? req.params.instance, req.fetch).getSite({});
        return site;

    } catch (err) {
        throw error(500, {
            message: 'Failed to fetch site info.',
        })
    }
}
