import { getClient } from '$lib/lemmy.js'
import type { GetSite } from 'lemmy-js-client'

export async function load({ fetch }) {
    const site:GetSite = await getClient(undefined, fetch).getSite({})
    return {
        site: site,
    }
}
