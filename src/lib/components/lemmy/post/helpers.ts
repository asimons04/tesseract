import type { Alignment } from '$lib/components/ui/menu/menu.js'
import type { 
    CommentView, 
    Community,
    GetPostsResponse, 
    Person,
    PersonView, 
    PostView as LemmyPostView, 
    Post,
    PostAggregates,
    SortType, 
    CommentReplyView, 
    PersonMentionView, 
    LocalUserView 
} from 'lemmy-js-client'

import type { MBFCReport } from '$lib/MBFC/types'

export interface PostView extends LemmyPostView {
    mbfc?: MBFCReport,
    cross_posts?: PostView[]
}

export interface MediaEmbedItem {
    embed_url?: string,
    type?: PostType,
    title?: string,
    description?: string,
    thumbnail_url?: string,
    open?: boolean
}


import { disableScrollHandling } from '$app/navigation'
import { get } from 'svelte/store';
import { getSessionStorage, setSessionStorage } from '$lib/session'
import { goto } from '$app/navigation'
import { lookup as MBFCLookup } from '$lib/MBFC/client'
import { page } from '$app/stores'
import { userSettings as UserSettings} from '$lib/settings.js'
import { YTFrontends } from '$lib/settings.js'



// Import user settings
let userSettings: any = get(UserSettings);

// Export types used in post detection
export type PostDisplayType = 'post' | 'feed'

export type PostType = 
    'image' | 'video' | 'youtube' | 'spotify' | 'bandcamp' | 'vimeo' | 'odysee' | 'peertube' |
    'songlink' | 'soundcloud' | 'link' |  'thumbLink' | 'text';

// Check whether current user can make changes to posts/comments
// Note:  These appear to be no longer referenced anywhere.  Marking as deprecated.
export const isMutable = (post: PostView, me: PersonView) =>
    (me.is_admin && post.post.local) || me.person.id == post.creator.id

export const isCommentMutable = (comment: CommentView, me: PersonView|LocalUserView) =>
    me.person.id == comment.creator.id

export function isPostView(item: PostView | CommentReplyView | PersonMentionView): item is PostView {
    return !('comment' in item)
}

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
    const testURL = new URL(unproxyImage(url))
    return /\.(jpeg|jpg|gif|png|svg|bmp|webp)$/i.test(testURL.pathname)
}

// Check if the provided URL is an embeddable audio file
export const isAudio = (url: string | undefined) => {
    if (!url) return false
    const testURL = new URL(unproxyImage(url))
    return /\.(mp3|oga|opus|aac)$/i.test(testURL.pathname)
}


/** Check if provided URL is a video */
export const isVideo = (inputUrl: string | undefined) => {
  if (!inputUrl) return false
  const url = new URL(unproxyImage(inputUrl)).pathname.toLowerCase()
  return url.endsWith('mp4') || url.endsWith('webm') || url.endsWith('mov') || url.endsWith('m4v') || url.endsWith('ogv')
}

/** Unproxies Lemmy's godawfully stupid method of image proxying */
export const unproxyImage = (inputURL:string) => {
    //Blech!  https://slrpnk.net/api/v3/image_proxy?url=https%3A%2F%2Fimgs.xkcd.com%2Fcomics%2Fearth_temperature_timeline_2x.png
    
    // Fix any relative image URLs
    if (inputURL.startsWith('/'))
        inputURL = window.origin + inputURL
    
    const testURL = new URL(inputURL)
    return (testURL.pathname == '/api/v3/image_proxy' && testURL.searchParams.get('url')) 
        ? decodeURI(testURL.searchParams.get('url') as string)
        : inputURL
}

// Checks if the post's URL is for a video Tesseract is capable of embedding
export const isYoutubeLikeVideo = (url: string | undefined):boolean => {
    if (!url) return false
    return (
        isInvidious(url) ||
        isYouTube(url) ||
        isPiped(url)
    )
}

// Check if URL is a peerTube embed
export const isPeertube = (embed_video_url:string): boolean => {
    const regex = `\/videos\/embed\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}`
    const found = embed_video_url.match(regex)
    return found ? true : false
}

// Check if URL is an embeddable Youtube from YT, Invidious, or Piped
// Invidious
export const isInvidious = (url: string):boolean => {
    const frontends = [...YTFrontends.invidious, ...userSettings.embeddedMedia.userDefinedInvidious]
    for (let i=0; i<frontends.length; i++) {
        if (url.startsWith(`https://${frontends[i]}`)) {
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
        url.startsWith('http://music.youtube.com') ||
        url.startsWith('https://music.youtube.com') ||
        url.startsWith('https://www.youtube.com') || 
        url.startsWith('http://www.youtube.com') || 
        url.startsWith('https://youtube.com') || 
        url.startsWith('http://youtube.com') ||
        url.startsWith('https://youtube.de') ||
        url.startsWith('https://www.youtube.de') ||
        url.startsWith('http://youtube.de') ||
        url.startsWith('http://www.youtube.de') ||
        url.startsWith('https://y2u.be/')
    )
}

//  Piped
export const isPiped = (url: string):boolean => {
    const frontends = [...YTFrontends.piped, ...userSettings.embeddedMedia.userDefinedPiped]
    for (let i=0; i<frontends.length; i++) {
        if (url.startsWith(`https://${frontends[i]}`)) {
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


// Build a Youtube-like embed link from the post URL
export const buildYouTubeEmbedLink = (postURL:string, displayType: 'post'|'feed' = 'post', autoplay:boolean|undefined=undefined): URL|undefined => {
    if (!postURL) return
    
    try { new URL(postURL) }
    catch { return }

    let embedURL: URL
    let videoID: string|null
    
    // Base the embed URL from the user's chosen YouTube frontend
    if (userSettings.embeddedMedia.YTFrontend == "Invidious" && userSettings.embeddedMedia.customInvidious !='') {
        embedURL = new URL('https://' + userSettings.embeddedMedia.customInvidious);
    }
    else if (userSettings.embeddedMedia.YTFrontend == "Piped" && userSettings.embeddedMedia.customPiped !='') {
        embedURL = new URL('https://' + userSettings.embeddedMedia.customPiped);
    }
    else {
        embedURL = new URL('https://www.youtube-nocookie.com')
    }


    // Parse URLs to pick out video IDs to create embed URLs
    videoID = new URL(postURL).searchParams.get('v');
        
    // If 'v' video ID param not found, check for older /watch/ABCDEFG format
    if (!videoID) {
        videoID = new URL(postURL).pathname.replace('/watch','').replace('/shorts/','').replace('/','');
    }
        
    // Return early if a video ID could not be found
    if (!videoID) return

    // Search for valid extra parameters

    // Append the video ID to the embed URL
    embedURL.pathname = `/embed/${videoID}`


    // Enable autoplay videos in post if setting is enabled
    if (displayType ==  'post' && (autoplay ?? userSettings.embeddedMedia.autoplay)) {
        embedURL.searchParams.set('autoplay', '1');
    }
    else if (autoplay) {
        embedURL.searchParams.set('autoplay', '1');
    }
    else {
        embedURL.searchParams.set('autoplay', '0');
    }

    if (userSettings.embeddedMedia.loop) {
        embedURL.searchParams.set('loop', '1');
    }

    // Start time: Can be either t (legacy) or start
    let startTime = new URL(postURL).searchParams.get('t') ?? new URL(postURL).searchParams.get('start');
    if (startTime) {
        embedURL.searchParams.set('t', startTime);
    }

    // End time: 
    let endTime = new URL(postURL).searchParams.get('end');
    if (endTime) {
        embedURL.searchParams.set('end', endTime);
    }

    return embedURL
}

// Build a Vimeo embed link from the post URL
export const buildVimeoEmbedLink = (postURL:string, displayType: 'post'|'feed' = 'post', autoplay:boolean|undefined=undefined): URL|undefined => {
    if (!postURL) return

    try { new URL(postURL) }
    catch { return }
    
    let embedURL = new URL('https://player.vimeo.com')
    embedURL.searchParams.set('autopause', '0')

    // Parse URLs to pick out video IDs to create embed URLs
    let videoID = new URL(postURL).pathname.replace('/','')
        
    // Handle the /groups/123456/videos/{videoID} style links
    if (videoID.startsWith('groups')) {
        let re = new RegExp("/groups/[0-9]+/videos/", "i");
        videoID = new URL(postURL).pathname.replace(re, '')
    }

    // Vimeo video IDs are numeric, so make sure we extracted a valid value (hopefully)
    if (parseInt(videoID)) {
        // Append the video ID to the embed URL
        embedURL.pathname = `/video/${videoID}`
    }

    if (embedURL.pathname != '/') {
        if (displayType ==  'post' && (autoplay ?? userSettings.embeddedMedia.autoplay)) {
            embedURL.searchParams.set('autoplay','1')
        }

        return embedURL
    }
    return

    
}

// Build a Songlink embed URL from the post URL
export const buildSonglinkEmbedLink = (postURL:string, displayType: 'post'|'feed' = 'post', autoplay:boolean|undefined=undefined): URL|undefined => {
    let embedURL = new URL('https://odesli.co')
    
    // Parse URLs to pick out video IDs to create embed URLs
    embedURL.pathname = '/embed/'
    embedURL.searchParams.set('url', encodeURIComponent(postURL))
    embedURL.searchParams.set('autopause', '0')

    // @ts-ignore (This function is in index.html)
    if ( dark() ) embedURL.searchParams.set('theme', 'dark')
    if (displayType == 'post' && autoplay) embedURL.searchParams.set('autoplay', '1')

    return embedURL
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

    if (post.post.url && isYoutubeLikeVideo(post.post.url)) {
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

    if (post.post.embed_video_url && isPeertube(post.post.embed_video_url)) {
        return "peertube"
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


export const fixLemmyEncodings = function (content:string|undefined):string {
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

export const scrollToTop = async function(element:HTMLElement|undefined|null, smooth:boolean=true):Promise<void> {
    if (!element) return;
    await sleep(150)
    try {
        // Offset = navbar height (-64) - sticky menu height (52) + 3 pixel gap
        let offset = 64 + 64 + 3;

        // Account for the profile button bar (height=58px) in the offset calculation
        if (get(page) && get(page).url.pathname.startsWith('/profile/')) {
            offset = offset + 58;
        } 
        

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

export const lastSeenPost = {
    getKey: function() {
        const Page = get(page)
        const key = Page.url.pathname != "/" && Page.url.pathname.endsWith('/')
            ? Page.url.pathname.substring(0, Page.url.pathname.length-1)
            : Page.url.pathname
        return key
    },

    set: function(postID: number) {
        const key = this.getKey()
        const lastSeenPosts = JSON.parse(sessionStorage.getItem('tesseract_last_seen_posts') ?? '{}')
        if (postID > 0) lastSeenPosts[key] = postID.toString()
        else delete lastSeenPosts[key]

        sessionStorage.setItem('tesseract_last_seen_posts', JSON.stringify(lastSeenPosts))
    },

    get: function() {
        const key = this.getKey()
        const lastSeenPosts = JSON.parse(sessionStorage.getItem('tesseract_last_seen_posts') ?? '{}')
        if (key in lastSeenPosts) return lastSeenPosts[key]
        else return undefined
    }
}


export async function scrollToLastSeenPost(delay=200) {
    const postID = lastSeenPost.get()
    if (postID) {
        await sleep(delay)
        const element = document.getElementById(postID)
        
        if (element) {
            disableScrollHandling()
            scrollToTop(element, false)
        }
        else {
            window.scrollTo(0,0)
        }
    }
}

export async function scrollTo(pos:number, delay=100) {
    if (!pos) return
    await sleep(delay)
    disableScrollHandling()
    window.scrollTo(0, pos)
}



// Used in post fetch loader to filter posts by keywords
export const filterKeywords = function (posts:PostView[]):PostView[] {
    try {
        let filteredPosts = [] as PostView[];
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
                        
                        filteredPosts.push(...posts.splice(i, 1));
                        //posts.splice(i, 1)
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
                        filteredPosts.push(...posts.splice(i, 1));
                        //posts.splice(i, 1)
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
                        filteredPosts.push(...posts.splice(i, 1));
                        //posts.splice(i, 1)
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
                        filteredPosts.push(...posts.splice(i, 1));
                        i--;
                        console.log(`Filtering post '${post.post.name}' because it includes the keyword '${word}'`);
                        break;
                    }
                }

            }
        }
        console.log(filteredPosts);
        
        return posts
    }
    catch (err) {
        console.log("filterKeywords():  An error has occurred. Returning unfiltered posts list");
        console.log(err);
        return posts
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
                        (userSettings?.uiState?.matchCrossPostOnTitle && post.post.name.toLowerCase().trim() == otherPost.post.name.toLowerCase().trim())
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

        return uniquePosts
    }
    catch (err) {
        console.log("findCrossposts():  An error has occurred. Returning unfiltered posts list");
        console.log(err);
        return posts
    }
}

//Used in post fetch loader to add MBFC report info to post objects (if found)
export const addMBFCResults = function (posts:PostView[]):PostView[] {
    try {
        for (let i:number=0; i<posts.length; i++) {
            let post = posts[i];

            if (post.post?.url) {
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
        body: `cross-posted from: ${post.post.ap_id}\n\n${post.post.body || ''}`,
        url: post.post.url || '',
        name: post.post.name,
        loading: false,
        nsfw: post.post.nsfw,
        image: null,
    })
    goto('/create/post?crosspost=true')
}

// Sort an array of posts
export const sortPosts = function(posts:PostView[], direction:SortType): PostView[] {
    const Page = get(page)
    const inCommunity = (Page?.url?.pathname && Page.url.pathname.startsWith('/c/')) ?? false

    if (direction == 'New')          posts.sort((a, b) => Date.parse(b.post.published) - Date.parse(a.post.published))
    if (direction == 'Old')          posts.sort((a, b) => Date.parse(a.post.published) - Date.parse(b.post.published))
    if (direction == 'NewComments')  posts.sort((a, b) => Date.parse(b.counts.newest_comment_time) - Date.parse(a.counts.newest_comment_time))
    //if (direction == 'Active')       posts.sort((a, b) => b.counts.hot_rank_active - a.counts.hot_rank_active)
    //if (direction == 'Hot')          posts.sort((a, b) => b.counts.hot_rank - a.counts.hot_rank)
    if (direction == 'MostComments') posts.sort((a, b) => b.counts.comments - a.counts.comments)
    if (direction.startsWith('Top')) posts.sort((a, b) => b.counts.score - a.counts.score)
    
    // Move featured posts to the beginning of the arrray
    posts.sort((a,b) => Number(b.post.featured_local) - Number(a.post.featured_local))

    // Move community featured posts to beginning if browsing community page
    if (inCommunity) posts.sort((a,b) => Number(b.post.featured_community) - Number(a.post.featured_community))
    
    
    return posts
}

// Used in infinite scroll load function to merge the new batch of posts into the existing while removing duplicates.
export const mergeNewInfiniteScrollBatch = function (old: GetPostsResponse, next:GetPostsResponse):  GetPostsResponse {
    // Merge the new results into the current set, deduplicate, and then sort.
    for (let i:number=0; i < next.posts.length; i++) {
        // Check if the current new post already exists in the existing array of posts
        let exists = false
        if (old.posts.some(p => p.post.id == next.posts[i].post.id)) exists = true
        if (!exists) old.posts.push(next.posts[i])
    }

    if (next.next_page) old.next_page = next.next_page

    return old
}

export function removeURLParams(url:string):string {
    let fullURL = new URL(url)
    fullURL.search = ''
    return fullURL.toString()
}

export function isThreadComment(commentID:number):boolean {
    const $page = get(page)
    if ($page.url.searchParams.get('thread')) {
        let thread = $page.url.searchParams.get('thread')
        let path = thread?.split('.')
        
        if  (path && path.length>0) {
            const threadCommentID = Number(path[path.length-1])
            if (threadCommentID && threadCommentID == commentID) {
                return true
            }
        }
    }
    return false
}

export function isNewAccount(date:string, daysOld?:number):boolean {
    return new Date().getTime()/1000/60 - (
            (Date.parse(date)/1000/60) 
    ) < 1440 * (daysOld ?? userSettings?.hidePosts?.newAccountMinAge ?? 5)
}


export function extractFlairsFromTitle(title:string ): {name: string, flairs: Array<string>}  {
    let postName = fixLemmyEncodings(title)
    let flairs = [] as string[]
    let finalFlairs = [] as string[]

    if (userSettings.extractFlairsFromTitle) {
        const flairRegex = new RegExp(/(\[.[^\]]+\])/g)
        const matches = postName.matchAll(flairRegex)
        
        // Add (with dedup) matched tags to flair 
        for (let match of matches) {
            if (!flairs.includes(match[0])) flairs.push(match[0])
        }
        
        // Remove the [tag]s from the post name
        for (let flair of flairs) {
            postName = postName.replaceAll(flair, '').trim()
        }

        // Look for any nested flairs (comma-separated flairs in the same brackets [music, metal, 2000s rock]
        for (let i:number = 0; i < flairs.length; i++) {
            let flair = flairs[i].replace('[', '').replace(']','')
            
            let nestedFlairs = flair.split(',')
            
            if (nestedFlairs.length > 1) {
                nestedFlairs.forEach((f) => {
                    finalFlairs.push(f)
                })
            }
            else {
                finalFlairs.push(flair)
            }
        }
   
        return { 
            name: postName,
            flairs: finalFlairs
        }
    }
    else {
        return {
            name: postName,
            flairs: [] as string[]
        }
    }
}

export function getPostTitleWithoutFlairs(title: string): string {
    let {name} = extractFlairsFromTitle(title)
    return name
}

export function createFakePost(): Post {
    return {
        ap_id: 'https://example.com/fake/ap_id',
        community_id: -1,
        creator_id: -1,
        deleted: false,
        featured_community: false,
        featured_local: false,
        id: -1,
        language_id: -1,
        local: false,
        locked: false,
        removed: false,
        name: 'Dummy',
        nsfw: false,
        published: new Date().toString()
    }
}

export function createFakeCommunity(): Community {
    return {
        actor_id: 'https://example.com/c/dummy',
        deleted: false,
        hidden: false,
        id: -1,
        instance_id: -1,
        local: false,
        name: 'Dummy',
        nsfw: false,
        posting_restricted_to_mods: false,
        published: new Date().toString(),
        removed: false,
        title: 'Dummy',
        visibility: 'Public'
    }
}

export function createFakePerson(): Person {
    return {
        actor_id: 'https://example.com/u/dummy',
        banned: false,
        bot_account: false,
        deleted: false,
        id: -1,
        instance_id: -1,
        local: false,
        name: 'Dummy',
        published: new Date().toString(),
    }
}

export function createFakePostAggregates(): PostAggregates {
    return {
        comments: 0,
        downvotes: 0,
        newest_comment_time: new Date().toString(),
        post_id: -1,
        published: new Date().toString(),
        score: 0,
        upvotes: 0
    }
}

export function createFakePostView(): LemmyPostView {
    return {
        banned_from_community: false,
        community: createFakeCommunity(),
        counts: createFakePostAggregates(),
        creator: createFakePerson(),
        creator_banned_from_community: false,
        creator_blocked: false,
        creator_is_admin: false,
        creator_is_moderator: false,
        hidden: false,
        post: createFakePost(),
        read: false,
        saved: false,
        subscribed: 'NotSubscribed',
        unread_comments: 0
    }
}

