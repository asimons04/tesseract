import type { CommunityView, ListingType } from 'lemmy-js-client'

import { error } from '@sveltejs/kit'
import { get } from 'svelte/store'
import { getClient } from '$lib/lemmy.js'
import { instance as homeInstance, LINKED_INSTANCE_URL } from '$lib/instance'
import { profile } from '$lib/auth'

interface CommunityList {
    communities: Array<CommunityView>
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




export async function load( req: any) {
    
    const page = Number(req.url.searchParams.get('page')) || 1
    const query = req.url.searchParams.get('q')
    const sort = req.url.searchParams.get('sort') || 'asc'
    const type = req.url.searchParams.get('type') || 'All'
    const instance = req.url.searchParams.get('instance') ?? req.params.instance ?? get(homeInstance) ?? LINKED_INSTANCE_URL

    let communities:CommunityList
    

    try { 
        // Pull in site info to load into sidebar
        let site = await getClient(instance).getSite({})
        
        if (query) { 
            communities = await getClient(instance).search({
                limit: 50,
                page: page,
                sort: 'TopAll',
                type_: 'Communities',
                listing_type: type,
                q: query,
                auth: instance == get(homeInstance)
                    ? get(profile)?.jwt
                    : undefined
            })
        }
        else { 
            communities = await getClient(instance).listCommunities({
                limit: 50,
                page: page,
                sort: 'TopAll',
                type_: type,
                auth: instance == get(homeInstance)
                    ? get(profile)?.jwt
                    : undefined
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
    catch {
        throw error(500, {
            message: `Failed to fetch site info for ${instance}.`,
        })
    }
}
