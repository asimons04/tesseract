import type { ListingType, PostView, SortType } from 'lemmy-js-client'

import { getClient, site } from '$lib/lemmy.js'
import { get } from 'svelte/store'
import { error } from '@sveltejs/kit'
import { profile } from '$lib/auth.js'
import { userSettings } from '$lib/settings.js'

function findCrossposts(posts:PostView[]):PostView[] {

    let uniquePosts: PostView[] = [];

    // Check for duplicate posts.post.url and generate a cross_posts object to attach to the older post
    for (let i:number=0; i<posts.length; i++) {
        let post = posts[i];
        post.cross_posts = [] as PostView[];
        
        // Loop over the posts  backwards
        for (let j:number=0; j < posts.length; j++) {
            let otherPost = posts[j];
            otherPost.cross_posts = [] as PostView[];
            
            if ( 
                    post.post.id != otherPost.post.id && 
                    !post.post.deleted && !otherPost.post.deleted &&
                    !post.post.removed && !otherPost.post.removed &&
                    ( 
                        (post.post.url && post.post.url == otherPost.post.url) || post.post.name == otherPost.post.name
                    ) 
            ){
                // The newer post should be the cross post
                if (new Date(post.post.published) < new Date(otherPost.post.published)) {
                    post.cross_posts.push(otherPost);
                    posts.splice(j,1);
                }
                else {
                    otherPost.cross_posts.push(post);
                    post = otherPost;
                    posts.splice(j,1);
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
