<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostType, PostDisplayType } from './helpers.js'
    
    
    import { imageProxyURL } from '$lib/image-proxy'
    import {isImage, isVideo, postType as identifyPostType} from './helpers.js'
    import { scrollToTop } from './helpers.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings.js'

    import ArchiveLinkSelector from './utils/ArchiveLinkSelector.svelte';
    import Card from '$lib/components/ui/Card.svelte'
    import Crossposts from '$lib/components/lemmy/post/Crossposts.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import MBFC from '$lib/MBFC/MBFC.svelte'
    import NSFWOverlay from './utils/NSFWOverlay.svelte'
    import PostActions from '$lib/components/lemmy/post/PostActions.svelte'
    import PostMeta from '$lib/components/lemmy/post/PostMeta.svelte'
    import PostBody from '$lib/components/lemmy/post/PostBody.svelte'
    import PostLink from './PostLink.svelte';
    

    export let post: PostView
    export let actions: boolean = true
    export let displayType: PostDisplayType = "feed"
    export let expandCompact: boolean;
    export let expandPreviewText:boolean 
    export let disablePostLinks:boolean = false
    export let collapseBadges:boolean = false;
    export let postContainer: HTMLDivElement

    $: postType = identifyPostType(post)
</script>


<Card class="flex flex-col w-full p-2 gap-0 {disablePostLinks ? 'pointer-events-none list-none' : ''}" >
    
    <!--- If post is NSFW, only show the metadata + title and overlay the rest--->
    {#if post.post.nsfw}
        <div class="flex flex-col gap-1 w-full">
            <PostMeta bind:post={post} showTitle={true} {collapseBadges}/>                
            <NSFWOverlay bind:nsfw={post.post.nsfw} displayType={displayType} text="[Reveal NSFW Post]"/>
        </div>
    {:else}
        
        <!---Image and Video Posts--->
        <!---These will have the thumbnail in the upper-right corner rather than in the metadata--->
        {#if  (['image', 'video'].includes(postType)) }
            
            <div class="flex flex-row w-full gap-2">
                
                <div class="flex flex-col gap-1 {!$userSettings.uiState.hideCompactThumbnails && post.post.thumbnail_url ? 'w-[calc(100%-128px)]' : 'w-full'}">
                    <PostMeta bind:post={post} showTitle={true} {collapseBadges}/>            
                    
                    {#if post.post.url && !(['image'].includes(postType))}
                        <span class="flex flex-row flex-wrap my-auto w-full gap-2 mb-1">
                            
                            <!---Show archive link if not a media post--->
                            {#if ['youtube', 'link', 'thumbLink'].includes(postType)}
                                <ArchiveLinkSelector url={post.post?.url} {postType}/>
                            {/if}
                            
                            <Link class="text-xs min-w-[0%] max-w-[100%] text-ellipsis" href={post.post?.url} newtab={$userSettings.openInNewTab.links} title={post.post?.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap/>
                            <MBFC post={post} rightJustify={true}/>
                        </span>
                    {/if}

                    {#if (displayType == 'feed' && $userSettings.uiState.postBodyPreviewLength >= 0) || displayType=='post'}
                        <PostBody bind:post bind:postContainer {displayType} bind:expandPreviewText class="my-1" />
                    {/if}
                </div>
                
                {#if !$userSettings.uiState.hideCompactThumbnails && (post.post.thumbnail_url || isVideo(post.post.url))}
                    
                    <div class="flex-none w-[128px] h-[128px] mx-auto mt-2 overflow-hidden">
                    
                        <!--- Expand the post in place when clicking thumbnail--->
                        <button class="cursor-pointer" title="{expandCompact ? 'Collapse' : 'Expand'}" 
                            on:click={() => {  
                                expandCompact = !expandCompact; 
                                scrollToTop(postContainer)
                            }}
                        >
                            {#if post.post.thumbnail_url || isImage(post.post.url)}
                                <img
                                    src="{
                                        post.post.url?.endsWith('.gif')
                                            ? imageProxyURL(post.post.url)
                                            : post.post.embed_video_url?.endsWith('.gif')
                                                ? imageProxyURL(post.post.embed_video_url)
                                                : imageProxyURL(post.post.thumbnail_url ?? post.post.url, 256, 'webp')
                                    }"
                                    loading="lazy"
                                    alt={post.post.name}
                                    class="object-cover bg-slate-100 rounded-md w-[128px] h-[128px]  border border-slate-200 dark:border-zinc-700 mx-auto shadow-lg"
                                    class:blur-lg={(post.post.nsfw && $userSettings.nsfwBlur)}
                                />
                            {:else if post.post.url && isVideo(post.post.url)}
                                <video class="object-cover bg-slate-100 rounded-md w-[128px] h-[128px]  border border-slate-200 dark:border-zinc-700 mx-auto shadow-lg" 
                                    class:blur-2xl={(post.post.nsfw && $userSettings.nsfwBlur && displayType=='feed')}    
                                    playsinline muted={true} autoplay={false}
                                    preload="metadata"
                                >
                                    <source src="{post.post.url}" type="{
                                        new URL(post.post.url).pathname.endsWith('mp4') || new URL(post.post.url).pathname.endsWith('m4v')
                                            ? 'video/mp4' 
                                            : new URL(post.post.url).pathname.endsWith('webm') 
                                                ? "video/webm" 
                                                : new URL(post.post.url).pathname.endsWith('mov') 
                                                    ? "video/mp4"
                                                    : ''
                                    }" />
                                </video>
                            {/if}
                        </button>
                    </div>
                    
                {/if}
            </div>
        
        <!---Link posts with embed description, etc--->
        {:else}

            <PostMeta bind:post showTitle={true} {collapseBadges}/>                
                    
            <PostLink bind:post bind:displayType compact={true}
                on:clickThumbnail={() => {
                    expandCompact = !expandCompact
                }}
            />

            {#if (displayType == 'feed' && $userSettings.uiState.postBodyPreviewLength >= 0) || displayType=='post'}
                <PostBody bind:post bind:postContainer {displayType} bind:expandPreviewText 
                    class="mt-2 mb-1 {!expandPreviewText && displayType=='feed' ? 'pointer-events-none' : ''}"
                    inline={false}
                />
            {/if}
            

        {/if}
    {/if}




        
        

    <!--- Crossposts --->
    <Crossposts bind:post size="xs" class="mb-1 !pl-0"/>
    
    
    <!--- Post Action Bar--->
    <div class="flex flex-row w-full">
        {#if actions}
            <div class="w-full h-full grid items-end">
                <PostActions  bind:post  bind:expandCompact bind:postContainer {displayType}
                    on:reply
                    on:edit={(e) => {
                        toast({
                            title: 'Confirmation',
                            content: 'The post was edited successfully.',
                            type: 'success',
                        })
                    }}
                />
            </div>
        {/if}
    </div>
</Card>
