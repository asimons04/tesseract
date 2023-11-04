import type { GetPostsResponse, ListingType, SortType } from 'lemmy-js-client'

import { addMBFCResults, filterKeywords } from '$lib/components/lemmy/post/helpers'
import { get } from 'svelte/store'
import { getClient } from '$lib/lemmy.js'
import { goto } from '$app/navigation'
import { profile } from '$lib/auth.js'
import { toast } from '$lib/components/ui/toasts/toasts.js'
import { userSettings } from '$lib/settings.js'

const userProfile = get(profile)



let communities:number[] = [15, 12166, 7091, 12, 3428];
/*
profile.update((p) => {
        ...p,
        favorites: communities
    }
)
*/
console.log(userProfile);

let postsPerPage:number = 250;

// Use ceiling to ensure at least 1 post per community. 
let postsPerCommunity = Math.ceil(postsPerPage / communities.length)




export async function load(req: any) {
    let tasks:Array<Promise<any>> = []
    let tasksResult:GetPostsResponse[]
    let combinedPosts:GetPostsResponse[] = []

    const page = Number(req.url.searchParams.get('page') || 1) || 1
    const sort: SortType = (req.url.searchParams.get('sort') as SortType) || get(userSettings).defaultSort.sort
    
    const client = getClient(undefined, fetch)
    const params = {
        page: page,
        sort: sort,
        limit: postsPerCommunity,
        auth: get(profile)?.jwt
    }


    for (let i:number=0; i< communities.length; i++) {
        let community_id = communities[i];
        tasks.push(client.getPosts({
            ...params,
            community_id: community_id
        }))
    }

    tasksResult = await Promise.all(tasks);
    
    for (let i:number=0; i< tasksResult.length; i++) {
        let posts = tasksResult[i];
        combinedPosts = [...combinedPosts, ...posts.posts]
    }
    combinedPosts.sort((a, b) => Date.parse(b.post.published) - Date.parse(a.post.published))
    
    console.log(tasks)
    console.log(tasksResult);

    console.log(combinedPosts)
    return { posts: combinedPosts};

    /*
    
    try {
        const [posts] = await Promise.all([
            client.listPostReports({
                ...params,
            }),
            client.listCommentReports({
                ...params,
            }),
    
        ])






        let posts = await getClient(undefined, req.fetch).getPosts({
            limit: 40,
            community_name: req.params.name,
            page: page,
            sort: sort,
            auth: get(profile)?.jwt,
        });
        
        // Apply MBFC data object to post
        posts = addMBFCResults(posts.posts);
        
        // Filter the posts for keywords
        posts = filterKeywords(posts.posts);

        return {
            sort: sort,
            page: page,
            posts: posts,
            community: await getClient(undefined, req.fetch).getCommunity({
                name: req.params.name,
                auth: get(profile)?.jwt,
            }),
        }
    }
    
    // If the community is not found, try to resolve it
    catch {
        if (!get(profile)?.jwt) {
            toast({
                content: `You must be logged in to resolve communities not currently known to this instance.`,
                type: 'warning',
            })
            goto('/communities');
            return

        }
        toast({
            content: `This community is not known to your instance. Fetching community from its home instance. This may take a moment...`,
            type: 'success',
            duration: 10000
        })

        await getClient(undefined, fetch).resolveObject({
            auth: get(profile)!.jwt!,
            q: '!' + req.params.name,
        })
        
        let posts = await getClient(undefined, req.fetch).getPosts({
            limit: 40,
            community_name: req.params.name,
            page: page,
            sort: sort,
            auth: get(profile)?.jwt,
        })
        
        // Filter the posts for keywords
        posts = filterKeywords(posts.posts);


        return {
            sort: sort,
            page: page,
            posts: posts,
            community: await getClient(undefined, req.fetch).getCommunity({
                name: req.params.name,
                auth: get(profile)?.jwt,
            }),
        }
    }
    */
}

