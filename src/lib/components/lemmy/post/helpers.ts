import type { CommentView, GetPostsResponse, PersonView, PostView } from 'lemmy-js-client'

import { disableScrollHandling } from '$app/navigation'
import { get } from 'svelte/store';
import { getSessionStorage, setSessionStorage } from '$lib/session'
import { goto } from '$app/navigation'
import { lookup as MBFCLookup } from '$lib/MBFC/client'
import { userSettings as UserSettings} from '$lib/settings.js'
import { YTFrontends } from '$lib/settings.js'

// Import user settings
let userSettings: any = get(UserSettings);

// Export types used in post detection
export type PostDisplayType = 'post' | 'feed'

export type PostType = 
    'image' | 'video' | 'youtube' | 'spotify' | 'bandcamp' | 'vimeo' | 'odysee' |
    'songlink' | 'soundcloud' | 'link' |  'thumbLink' | 'text';

// Check whether current user can make changes to posts/comments
// Note:  These appear to be no longer referenced anywhere.  Marking as deprecated.
export const isMutable = (post: PostView, me: PersonView) =>
    (me.person.admin && post.post.local) || me.person.id == post.creator.id

export const isCommentMutable = (comment: CommentView, me: PersonView) =>
    me.person.id == comment.creator.id


// Return the image size based on the display type (feed/post) and the user's preference
export const imageSize = (displayType:PostDisplayType, ) => {
    if (displayType == 'feed') {
        return userSettings.imageSize.feed;
    }
    else if (displayType == 'post') {
        return  userSettings.imageSize.post;
    }
}

// Check if the provided URL is an image
export const isImage = (url: string | undefined) => {
    if (!url) return false
    return /\.(jpeg|jpg|gif|png|svg|bmp|webp)$/i.test(new URL(url).pathname)
}
// Check if provided URL is a video
export const isVideo = (inputUrl: string | undefined) => {
  if (!inputUrl) return false

  const url = new URL(inputUrl).pathname.toLowerCase()

  return url.endsWith('mp4') || url.endsWith('webm') || url.endsWith('mov') || url.endsWith('m4v')
}

// Checks if the post's URL is for a video Tesseract is capable of embedding
export const isEmbeddableVideo = (url: string | undefined):boolean => {
    if (!url) return false
    return (
        isInvidious(url) ||
        isYouTube(url) ||
        isPiped(url)
    )
}

// Check if URL is an embeddable Youtube from YT, Invidious, or Piped
// Invidious
export const isInvidious = (url: string):boolean => {
    for (let i=0; i<YTFrontends.invidious.length; i++) {
        if (url.startsWith(`https://${YTFrontends.invidious[i]}`)) {
            return true;
        }
    }
    return false;
}

// YouTube
export const isYouTube = (url:string):boolean => {
    return (
        url.startsWith('https://youtu.be') || 
        url.startsWith('http://youtu.be') || 
        url.startsWith('https://m.youtube.com') || 
        url.startsWith('http://m.youtube.com') || 
        url.startsWith('https://www.youtube.com') || 
        url.startsWith('http://www.youtube.com') || 
        url.startsWith('https://youtube.com') || 
        url.startsWith('http://youtube.com')
    )
}

//  Piped
export const isPiped = (url: string):boolean => {
    for (let i=0; i<YTFrontends.piped.length; i++) {
        if (url.startsWith(`https://${YTFrontends.piped[i]}`)) {
            return true;
        }
    }
    return false;

}

// Vimeo
export const isVimeo = (url: string | undefined):boolean => {
    if (!url) return false;
    
    if (url.startsWith('https://vimeo.com')) {
        return true;
    }
    return false;
}


// Spotify
export const isSpotify = (url: string | undefined):boolean => {
    if (!url) return false;
    
    if (url.startsWith('https://open.spotify.com')) {
        return true;
    }
    return false;

}

// SoundCloud
export const isSoundCloud = (url:string):boolean => {
    return (
        url.startsWith('https://m.soundcloud.com') || 
        url.startsWith('https://soundcloud.com') 
    )
}

// Odysee
export const isOdysee = (url:string):boolean => {
    return (
        url.startsWith('https://odysee.com') 
    )
}

// SongLink
export const isSongLink = (url:string):boolean => {
    return (
        url.startsWith('https://album.link') ||
        url.startsWith('https://song.link')
    )
}




// Returns a string representing the detected post type
// image | video | youtube | spotify | soundcloud | link | thumbLink | text
export const postType = (post: PostView | undefined ) => {
    
    if (!post) return 'text'
    
    if ( 
        (post.post.url && isImage(post.post.url) ) ||
        (post.post.embed_video_url && isImage(post.post.embed_video_url))
     ) {
        return "image"
    }

    if (
        (post.post.url && isVideo(post.post.url)) || (post.post.embed_video_url && isVideo(post.post.embed_video_url))
    ) {
        return "video"
    }

    if (post.post.url && isEmbeddableVideo(post.post.url)) {
        return "youtube"
    }
    
    if (post.post.url && isSpotify(post.post.url)) {
        return "spotify"
    }

    if (post.post.url && isVimeo(post.post.url)) {
        return "vimeo"
    }
    
    if (post.post.url && isSoundCloud(post.post.url)) {
        return "soundcloud"
    }

    if (post.post.embed_video_url && post.post.embed_video_url.startsWith("https://bandcamp.com")) {
        return "bandcamp"
    }

    if (post.post.url && isOdysee(post.post.url)) {
        return "odysee"
    }

    if (post.post.url && isSongLink(post.post.url)) {
        return "songlink"
    }



    // These need to be last
    if (
        post.post.url && !post.post.thumbnail_url) {
        return "link"
    }

    if (
        post.post.thumbnail_url && post.post.url) {
        return "thumbLink"
    }

    // If no other type matches, render as a plain text
    return "text"
}


export const fixLemmyEncodings = function (content:string|undefined):string|undefined {
    if (!content) return ' '
    
    try {
        let element:HTMLElement = document.createElement('div');
        element.innerHTML = content;
        return element.textContent ?? ' '
    }
    catch {
        console.log("fixLemmyEncodings(): Failed to parse content: " + content);
        return content;
    }
}
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const scrollToTop = function(element:HTMLElement|undefined|null, smooth:boolean=true):void {
    if (!element) return;
    try {
            
        // Offset = navbar height (-64) - sticky menu height (52) + 3 pixel gap
        let offset = 64 + 64 + 3;

        let y = element.getBoundingClientRect().top + window.pageYOffset - offset;

        if (smooth) {
            window.scrollTo({top: y, behavior: 'smooth'});
        }
        else {
            window.scrollTo(0, y);
        }
    
    }
    catch {}
}

export async function scrollToLastSeenPost() {
    let lastClickedPost = getSessionStorage('lastClickedPost')
                
    //@ts-ignore
    if (lastClickedPost?.postID) {
        //@ts-ignore
        let postID = lastClickedPost.postID
        await sleep(100)

        let postElement = document.getElementById(postID.toString())
        if (postElement) {
            disableScrollHandling()
            scrollToTop(postElement, false)
            //setSessionStorage('lastClickedPost', undefined)
        }
    }
}



// Used in post fetch loader to filter posts by keywords
export const filterKeywords = function (posts:PostView[]):PostView[] {
    try {
        let filteredPosts: PostView[] = [];
        let filterWords = get(UserSettings)?.hidePosts?.keywordList ?? [] as string[];

        // Bypass filtering if keyword filtering is disabled by user
        if (!get(UserSettings)?.hidePosts?.keywords) return posts;

        // Loop over posts and check for any keywords that should be filtered out
        for(let i:number=0; i<posts.length; i++) {
            let post:PostView = posts[i];
            
            for (let j:number=0; j<filterWords.length; j++) {
                let word:string = filterWords[j];

                // Keywords starting with a carat should be evaluated as "startsWith"
                if (word[0] == '^') {
                    word = word.substring(1,word.length) + ' ';
                    if ( 
                        post?.post?.name?.toLowerCase().startsWith(word.toLowerCase()) || 
                        post?.post?.body?.toLowerCase().startsWith(word.toLowerCase()) || 
                        post?.post?.embed_description?.toLowerCase().startsWith(word.toLowerCase())
                    ) {
                        
                        filteredPosts.push(posts.splice(i, 1));
                        i--;
                        console.log(`Filtering post '${post.post.name}' because it starts with the keyword '${word}'`);
                        break;
                    }

                }
                // Keywords starting with exclamation mark should be evaluated as case-sensitive
                else if (word[0] == '!') {
                    word = word.substring(1,word.length) + ' ';
                    if ( 
                        post?.post?.name?.includes(word) || 
                        post?.post?.body?.includes(word) || 
                        post?.post?.embed_description?.includes(word)
                    ) {
                        filteredPosts.push(posts.splice(i, 1));
                        i--;
                        console.log(`Filtering post '${post.post.name}' because it includes the keyword '${word}'`);
                        break;
                    }

                    
                }

                // If the keyword is contained by any other word
                else if (word[0] == '*') {
                    word = word.substring(1,word.length);
                    if ( 
                        post?.post?.name?.includes(word) || 
                        post?.post?.body?.includes(word) || 
                        post?.post?.embed_description?.includes(word)
                    ) {
                        filteredPosts.push(posts.splice(i, 1));
                        i--;
                        console.log(`Filtering post '${post.post.name}' because it includes the keyword '${word}'`);
                        break;
                    }

                    
                }
                
                // Keyword is contained within the post (case-insensitive)
                else {
                    word = word + ' ';
                    if ( 
                        post?.post?.name?.toLowerCase().includes(word.toLowerCase()) || 
                        post?.post?.body?.toLowerCase().includes(word.toLowerCase()) || 
                        post?.post?.embed_description?.toLowerCase().includes(word.toLowerCase())
                    ) {
                        filteredPosts.push(posts.splice(i, 1));
                        i--;
                        console.log(`Filtering post '${post.post.name}' because it includes the keyword '${word}'`);
                        break;
                    }
                }

            }
        }
        console.log(filteredPosts);
        
        return posts
        //return { posts: posts };
    }
    catch (err) {
        console.log("filterKeywords():  An error has occurred. Returning unfiltered posts list");
        console.log(err);
        return posts
        //return { posts: posts}
    }

}

// Used in post fetch loader to detect and "roll up" crossposts
export const findCrossposts = function (posts:PostView[]):PostView[] {
    try {
        let uniquePosts: PostView[] = [];

        const isCrosspost = function(post:PostView, otherPost:PostView):boolean {    
            if ( 
                    post.post.id != otherPost.post.id && 
                    !post.post.deleted && !otherPost.post.deleted &&
                    !post.post.removed && !otherPost.post.removed &&
                    ( 
                        (post.post.url && otherPost.post.url && post.post.url == otherPost.post.url) || 
                        post.post.name.toLowerCase().trim() == otherPost.post.name.toLowerCase().trim()
                    ) 
            ){
                return true;
            }
            return false;
        }
            
        // Loop over each post
        for (let i:number=0; i<posts.length; i++) {
            let post = {...posts[i]};
            post.cross_posts = [] as PostView[];
            
            // Loop over each post again to find cross posts.
            for (let j:number=0; j < posts.length; j++) {
                let otherPost = posts[j];

                if (isCrosspost(post, otherPost)) {
                    post.cross_posts.push(posts.splice(j, 1)[0]);
                    // Repeat the loop until no more cross posts are found.
                    j=0;
                }
            }
            
            // Set oldest cross post as parent and remove the defined parent from the list of cross posts.
            if (post.cross_posts.length >0) {

                // Build a new PostView object to append after massaging the cross posts
                let oldestCrossPost:PostView = {...post}
                
                // Loop over the cross posts, find the oldest one, and set that as the parent.
                for (let j:number=0; j<post.cross_posts.length; j++) {
                    if (new Date(post.post.published) > new Date(post.cross_posts[j].post.published)) {
                        oldestCrossPost = {...post.cross_posts[j]}
                        
                        oldestCrossPost.cross_posts = [...post.cross_posts]
                        
                        oldestCrossPost.cross_posts.push({...post})
                    }
                }

                // Finally, remove the cross post entry that matches the parent.
                if (oldestCrossPost.cross_posts) {
                    for (let j:number=0; j<oldestCrossPost.cross_posts.length; j++) {
                        if (oldestCrossPost.post.id == oldestCrossPost.cross_posts[j].post.id) {
                            oldestCrossPost.cross_posts.splice(j,1);
                        }
                    }
                }
                // Add our custom Post object to the return array
                uniquePosts.push(oldestCrossPost);
            }
            // If no cross posts were found for this post, add it as a unique post.
            else {
                uniquePosts.push(post)
            }
        }

        return posts
        //return { posts: uniquePosts };
    }
    catch (err) {
        console.log("findCrossposts():  An error has occurred. Returning unfiltered posts list");
        console.log(err);
        return posts
        //return { posts: posts }
    }
}

//Used in post fetch loader to add MBFC report info to post objects (if found)
export const addMBFCResults = function (posts:PostView[]):PostView[] {
    try {
        for (let i:number=0; i<posts.length; i++) {
            let post = posts[i];

            if (post.post?.url) {
                // @ts-ignore
                post.mbfc = MBFCLookup(post.post.url);
            }

        }
    }
    catch (err) {
        console.log("addMBFCResults():  An error has occurred. Returning original posts list");
        console.log(err);
    }

    return posts
    //return {posts: posts};

}


// Crosspost a post
export const crossPost = function(post:PostView):void {
    setSessionStorage('postDraft', {
        body: `cross-posted from: ${post.post.ap_id}\n\n${
            post.post.body || ''
        }`,
        url: post.post.url || '',
        name: post.post.name,
        loading: false,
        nsfw: post.post.nsfw,
        community: null,
        image: null,
    })
    goto('/create/post?crosspost=true')
}