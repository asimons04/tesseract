import type { GetSiteResponse } from 'lemmy-js-client'

import { get } from 'svelte/store'
import { instance as currentInstance} from '$lib/instance'
import { getClient, site } from '$lib/lemmy.js'
import { StorageController } from '$lib/storage-controller'


const storage = new StorageController({
    type: 'session',
    ttl: -1,
    useCompression: true   
})

interface LoadParams {
    params: any,
    url: any,
}

export async function load({ params, url }: LoadParams) {
    // Fetch the site info for the provided user. Default to current instance.
    let instance =  get(currentInstance)
    let siteData: GetSiteResponse
    
    // If the username is non-local (e.g. user@instance), grab the domain part. Treat usernames without instances as local
    if (params.name && params.name.split('@')[1]) instance = params.name.split('@')[1]

    try {
        // Check the session storage cache to see if this instance has been cached
        siteData = await storage.get(`getSite:${instance}`)
        
        // If site data for that instance isn't already cached, fetch it and cache it.
        if (!siteData) {
            siteData = await getClient().getSite()
            
            // Don't store the user's profile data in case this is the local instance
            if (siteData?.my_user) delete siteData.my_user
            
            // Cache the site data response for that instance for later
            storage.put(`getSite:${instance}`, siteData)
        }
        
    }
    
    // If any issue, just use the site data for the home instance
    catch {
        siteData = get(site) ?? await getClient().getSite()
    }

    return {
        site: siteData
    }
}
