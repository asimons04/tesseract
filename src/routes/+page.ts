import type { ListingType, PostView, SortType } from 'lemmy-js-client'

import { getClient, site } from '$lib/lemmy.js'
import { get } from 'svelte/store'
import { error } from '@sveltejs/kit'
import { profile } from '$lib/auth.js'
import { userSettings } from '$lib/settings.js'


function findCrossposts(posts:PostView[]):PostView[] {
    let uniquePosts: PostView[] = [];
    let crossPosts: PostView[] = [];

    const isCrosspost = function(post:PostView, otherPost:PostView):boolean {    
        if ( 
                post.post.id != otherPost.post.id && 
                !post.post.deleted && !otherPost.post.deleted &&
                !post.post.removed && !otherPost.post.removed &&
                ( 
                    (post.post.url && post.post.url == otherPost.post.url) || 
                    post.post.name.toLowerCase().trim() == otherPost.post.name.toLowerCase().trim()
                ) 
        ){
            return true;
        }
        return false;
    }
        
    // Loop over each post
    for (let i:number=0; i<posts.length; i++) {
        let post = posts[i];
        post.cross_posts = [] as PostView[];
        
        // Loop over each post again to find cross posts.
        for (let j:number=0; j < posts.length; j++) {
            let otherPost = posts[j];

            if (isCrosspost(post, otherPost)) {
                post.cross_posts.push(posts.splice(i, 1)[0]);
                // Repeat the loop until no more cross posts are found.
                j=0;
            }
        }
        
        // Set oldest cross post as parent and remove the defined parent from the list of cross posts.
        if (post.cross_posts.length >0) {
            let oldestCrossPost:PostView = post;
            let crossPosts = [...post.cross_posts]
            
            // Loop over the cross posts, find the oldest one, and set that as the parent.
            for (let j:number=0; j<post.cross_posts.length; j++) {
                if (new Date(post.post.published) > new Date(post.cross_posts[j].post.published)) {
                    oldestCrossPost = post.cross_posts[j]
                }
            }

            post = oldestCrossPost;
            post.cross_posts = crossPosts;
            
            // Finally, remove the cross post entry that matches the parent.
            for (let j:number=0; j<post.cross_posts.length; j++) {
                if (post.post.id == post.cross_posts[j].post.id) {
                    post.cross_posts.splice(j,1);
                }
            }
        }
        
        uniquePosts.push(post)
    }

    return uniquePosts;
}


export async function load({ url, fetch }) {
    const page = Number(url.searchParams.get('page') || 1) || 1
    const sort: SortType = (url.searchParams.get('sort') as SortType) || get(userSettings).defaultSort.sort
    const listingType: ListingType = (url.searchParams.get('type') as ListingType) || get(userSettings).defaultSort.feed


    

   
    try {
        let posts = await getClient(undefined, fetch).getPosts({
            limit: get(userSettings)?.uiState.postsPerPage || 20,
            page: page,
            sort: sort,
            type_: listingType,
            auth: get(profile)?.jwt,
        });
    
        let siteData = await getClient(undefined, fetch).getSite({});
        site.set(siteData)

        return {
            sort: sort,
            listingType: listingType,
            page: page,
            posts: {posts:findCrossposts(posts.posts)},
            site: siteData,
        }
    } catch (err) {
        console.log(err)
        throw error(500, {
            message: 'Failed to fetch homepage.',
        })
    }
}
