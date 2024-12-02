import type { CommunityView, ListingType } from 'lemmy-js-client'

import { StorageController } from '$lib/storage-controller'
import { error } from '@sveltejs/kit'
import { get } from 'svelte/store'
import { getClient } from '$lib/lemmy.js'
import { instance as homeInstance, LINKED_INSTANCE_URL } from '$lib/instance'
import { profile } from '$lib/auth'

interface CommunityList {
    communities: CommunityView[]
}




function communitySortAsc(a:CommunityView, b:CommunityView) {
    if (a.community.title.toLowerCase() > b.community.title.toLowerCase()) return 1
    if (a.community.title.toLowerCase() < b.community.title.toLowerCase()) return -1
    return 0
}

function communitySortDesc(a:CommunityView, b:CommunityView) {
    if (a.community.title.toLowerCase() > b.community.title.toLowerCase()) return -1
    if (a.community.title.toLowerCase() < b.community.title.toLowerCase()) return 1
    return 0
}

function communitySortPostsAsc(a:CommunityView, b:CommunityView) {
    if (a.counts.posts > b.counts.posts) return 1
    if (a.counts.posts < b.counts.posts) return -1
    return 0
}

function communitySortPostsDesc(a:CommunityView, b:CommunityView) {
    if (a.counts.posts > b.counts.posts) return -1
    if (a.counts.posts < b.counts.posts) return 1
    return 0
}

function communitySortSubscribersAsc(a:CommunityView, b:CommunityView) {
    if (a.counts.subscribers > b.counts.subscribers) return 1
    if (a.counts.subscribers < b.counts.subscribers) return -1
    return 0
}

function communitySortSubscribersDesc(a:CommunityView, b:CommunityView) {
    if (a.counts.subscribers > b.counts.subscribers) return -1
    if (a.counts.subscribers < b.counts.subscribers) return 1
    return 0
}

function dedupe(arr:Array<CommunityView>) {
    return [...new Map(arr.map(item => [item.community.id, item])).values()];
}

const storage = new StorageController({
    type: 'session',
    ttl: -1,
    useCompression: true   
})



export async function load( req: any) {
    const instance = req.params.instance ?? get(homeInstance) ?? LINKED_INSTANCE_URL
    const page = Number(req.url.searchParams.get('page')) || 1
    const query = req.url.searchParams.get('q')
    const sort = req.url.searchParams.get('sort') || 'asc'
    const type: ListingType | undefined = req.url.searchParams.get('type') ?? 'All' 
    
    let communities:CommunityList
    

    try { 
        // Pull in site info to load into sidebar
        let site = await storage.get(`getSite:${instance}`) 
        
        if (!site) {
            site = await getClient(instance).getSite()
            if (site?.my_user) delete site.my_user
            storage.put(`getSite:${instance}`, site)
        }
        
        if (query) { 
            communities = await getClient(instance).search({
                limit: 50,
                page: page,
                sort: 'TopAll',
                type_: 'Communities',
                listing_type: type,
                q: query,
            })
        }
        else { 
            communities = await getClient(instance).listCommunities({
                limit: 50,
                page: page,
                sort: 'TopAll',
                type_: type,
            })
        }
        
        switch(sort) {
            case "asc": {
                communities.communities.sort(communitySortAsc)
                break;
            }
            case "desc": {
                communities.communities.sort(communitySortDesc)
                break;
            }

            case "posts_asc": {
                communities.communities.sort(communitySortPostsAsc)
                break;
            }

            case "posts_desc": {
                communities.communities.sort(communitySortPostsDesc)
                break;
            }

            case "subscribers_asc": {
                communities.communities.sort(communitySortSubscribersAsc)
                break;
            }

            case "subscribers_desc": {
                communities.communities.sort(communitySortSubscribersDesc)
                break;
            }

            default: {
                communities.communities.sort(communitySortAsc)
            }
        }
        

        return {
            communities: communities.communities,
            site: site,
            instance: instance,
            page: page,
            query: query ?? '',
            sort: sort,
            type: type

        }
    } 
    catch (err) {
        console.log(err)
        throw error(500, {
            message: `Failed to fetch site info for ${instance}.`,
        })
    }
}
