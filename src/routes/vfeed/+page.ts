import type { GetPostsResponse, ListingType, SortType } from 'lemmy-js-client'

import { addMBFCResults, filterKeywords, findCrossposts } from '$lib/components/lemmy/post/helpers'
import { get } from 'svelte/store'
import { getClient } from '$lib/lemmy.js'
import { goto } from '$app/navigation'

import { 
    type Profile, 
    type ProfileData,
    profile, 
    profileData 
} from '$lib/auth.js'

import { addFavorite, delFavorite, resolveFavorite } from '$lib/favorites'

import { toast } from '$lib/components/ui/toasts/toasts.js'
import { userSettings } from '$lib/settings.js'


let userProfile = get(profile)
let communities = userProfile.favorites?.map((c) => c.id) ?? []

let postsPerPage = 50;

// Use ceiling to ensure at least 1 post per community. 
let postsPerCommunity = Math.ceil(postsPerPage / communities.length)
postsPerCommunity > 50
    ? postsPerCommunity=50
    : undefined

export async function load(req: any) {
    
    //console.log(await resolveFavorite(12166));
    
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

    let site = client.getSite();

    // Loop over the communities array and call getPosts for each. Store each promise in the tasks array.
    for (let i:number=0; i< communities.length; i++) {
        let community_id = communities[i];
        tasks.push(client.getPosts({
            ...params,
            community_id: community_id
        }))
    }

    // Await all of the promises in the tasks array and store the results in the tasksResult array
    tasksResult = await Promise.all(tasks);
    
    // Loop over tasksResults and join the posts it returned into the combinedPosts array
    for (let i:number=0; i< tasksResult.length; i++) {
        let posts = tasksResult[i];
        combinedPosts = [...combinedPosts, ...posts.posts]
    }

    // Sort the posts however (currently new->old)
    combinedPosts.sort((a, b) => Date.parse(b.post.published) - Date.parse(a.post.published))
    
    // Load the posts into a posts object
    let posts = { posts: [...combinedPosts] }
    



    // Filter the posts for keywords
    posts = filterKeywords(posts.posts);
    
    // Roll up crossposts
    posts = findCrossposts(posts.posts);

    // Apply MBFC data object to post
    posts = addMBFCResults(posts.posts);
        
    //console.log(tasks)
    //console.log(tasksResult);
    //console.log(combinedPosts)
    
    
    return {
        ...posts,
        site: site,
        page: page,
        sort: sort
    }
}

