import { StorageController } from '$lib/storage-controller'

import { getClient } from '$lib/lemmy.js'
import { error } from '@sveltejs/kit'
import type { GetSiteResponse } from 'lemmy-js-client'

const storage = new StorageController({
    type: 'session',
    ttl: 60,
    useCompression: true   
})

export async function load(req: any) {
    try {
        const storageKey = `getSite:${req.params.instance}`
        let getSiteResponse: GetSiteResponse | undefined = await storage.get(storageKey)

        if (!getSiteResponse) {
            getSiteResponse = await getClient(req.params.instance).getSite()
            storage.put(storageKey, getSiteResponse)
        }

        return {
            site: getSiteResponse
        }

    } catch (err) {
        throw error(500, {
            message: 'Failed to fetch remote site info.',
        })
    }
}

