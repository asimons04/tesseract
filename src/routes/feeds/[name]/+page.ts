import type { Community, GetPostsResponse, ListingType, PostView, SortType } from 'lemmy-js-client'

import { addMBFCResults, filterKeywords, findCrossposts, sortPosts } from '$lib/components/lemmy/post/helpers'
import { get } from 'svelte/store'
import { getClient } from '$lib/lemmy.js'

import { type CommunityGroup, profile } from '$lib/auth.js'
import { userSettings } from '$lib/settings.js'



export async function load(req: any) {
    // Import profile and settings
    let userProfile = get(profile)
    let settings    = get(userSettings);

    // Get sorting and page number from URL query string or default to safe values or from user settings
    const page              = Number(req.url.searchParams.get('page') || 1) || 1
    const sort: SortType    = (req.url.searchParams.get('sort') as SortType) || settings.defaultSort.sort

    // Get the named feed from the request 
    let feed        = req.params.name?.toLowerCase() || 'favorites'
    let feedName    = ''
    let communities = [] as number[];

    
    if (userProfile?.groups) {
        // Search the user's defined groups to see if the supplied feed name matches a group
        let index = userProfile.groups.findIndex((cg:CommunityGroup) => cg.name.toLowerCase() == feed)
        if (index >=0) {
            communities = userProfile.groups[index].communities.map((c:Community) => c.id) ?? []
            feedName    = userProfile.groups[index].name
        }
        else {
            communities = [] as number[]
            feedName = 'Feed Not Found'
            feed = ''
        }
    }
    else {
        communities = [] as number[]
        feedName = 'Feed Not Found'
        feed = ''
    }

    
    
    // Determine the number of posts to retrieve per community
    let postsPerPage = settings.uiState.postsPerPage || 50;
    
    // Use ceiling to ensure at least 1 post per community. If number ever 
    let postsPerCommunity = Math.ceil(postsPerPage / communities.length)
    postsPerCommunity > 50
        ? postsPerCommunity=50
        : undefined

    // Setup the arrays to run the tasks and hold the results
    let tasks:Array<Promise<any>> = []
    let tasksResult:GetPostsResponse[]
    let combinedPosts:PostView[] = [] as PostView[]

    // Instantiate a Lemmy client and parameters to use for each community fetch.
    const client = getClient(undefined, fetch)
    const params = {
        page: page,
        sort: sort,
        limit: postsPerCommunity,
        auth: get(profile)?.jwt
    }

    // Grab the site info to populate the sidebar
    let site = await client.getSite();

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
        let posts = tasksResult[i] as GetPostsResponse;
        combinedPosts = [...combinedPosts, ...posts.posts]
    }

    // Load the posts into a posts object
    let posts = { posts: [...combinedPosts] }
    
    // Sort the posts however
    posts.posts = sortPosts(posts.posts, sort)

    // Filter the posts for keywords
    posts.posts = filterKeywords(posts.posts);
    
    // Roll up crossposts
    posts.posts = findCrossposts(posts.posts);

    // Apply MBFC data object to post
    posts.posts = addMBFCResults(posts.posts);
        
    //console.log(tasks)
    //console.log(tasksResult);
    //console.log(combinedPosts)
    //console.log(posts)
    //console.log(params);
    
    return {
        ...posts,
        site: site,
        page: page,
        sort: sort,
        feed: feed,
        feedName: feedName
    }
}

