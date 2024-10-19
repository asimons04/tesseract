<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostType, PostDisplayType } from './helpers.js'
    
    
    import { imageProxyURL } from '$lib/image-proxy'
    import {isImage, postType as identifyPostType} from './helpers.js'
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
    import PostTitle from '$lib/components/lemmy/post/PostTitle.svelte'
    import PostBody from '$lib/components/lemmy/post/PostBody.svelte'
    

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


<Card class="flex flex-col w-full p-2 gap-0 " >

    

    <!--- Post Link, Body, and Thumbnail  --->
    <div class="flex flex-row w-full gap-2 {disablePostLinks ? 'pointer-events-none list-none' : ''}">
        
        
        
        <!---Post body and link--->
        <div class="flex flex-col gap-0 {!$userSettings.uiState.hideCompactThumbnails && (post.post.thumbnail_url || isImage(post.post.url)) ? 'w-[80%] md:w-[85%] xl:w-[90%]' : 'w-full'}">
            
            <PostMeta bind:post={post} showTitle={false} {collapseBadges}/>        
            
            <!---Post title--->
            <PostTitle bind:post />
            
            
            <!---Alt source selector, link, MBFC for desktop compact view--->
            {#if post.post.url && !isImage(post.post.url)}
                <span class="hidden md:flex flex-row flex-wrap my-auto w-full gap-2 mb-1">
                    
                    <!---Show archive link if not a media post--->
                    {#if postType == "link" || postType == "thumbLink" || postType == 'youtube'}
                        <ArchiveLinkSelector url={post.post?.url} {postType}/>
                    {/if}
                    
                    <Link class="text-xs" href={post.post?.url} newtab={$userSettings.openInNewTab.links} title={post.post?.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap/>
                    <MBFC post={post} rightJustify={true}/>
                </span>
            {/if}
        </div>

        <!--- Thumbnail --->
        {#if !post.post.nsfw && !$userSettings.uiState.hideCompactThumbnails && (post.post.thumbnail_url || isImage(post.post.url))}
            <div class="flex-none w-fit h-fit mx-auto mt-2 overflow-hidden">
                <!--- Expand the post in place when clicking thumbnail--->
                <button class="cursor-pointer" title="{expandCompact ? 'Collapse' : 'Expand'}" 
                    on:click={() => {  
                        expandCompact = !expandCompact; 
                        scrollToTop(postContainer)
                    }}
                >
                    <img
                        src="{imageProxyURL(post.post.thumbnail_url ?? post.post.url, 256, 'webp')}"
                        loading="lazy"
                        alt={post.post.name}
                        class="object-cover bg-slate-100 rounded-md h-32 w-32 border border-slate-200 dark:border-zinc-700 mx-auto"
                        class:blur-lg={(post.post.nsfw && $userSettings.nsfwBlur)}
                    />
                </button>
            </div>
        {/if}
    </div>
    
    {#if post.post.nsfw}
        <div class="flex flex-col relative w-full gap-1 min-h-[75px]">
            <NSFWOverlay bind:nsfw={post.post.nsfw} displayType={displayType} />    
        </div>
    {:else}
        <!---Alt source selector, link, MBFC for mobile view--->
        {#if post.post.url && !isImage(post.post.url)}
        <span class="flex md:hidden flex-row flex-wrap my-auto w-full gap-2 mb-1">
            
            <!---Show archive link if not a media post--->
            {#if postType == "link" || postType == "thumbLink" || postType == 'youtube'}
                <ArchiveLinkSelector url={post.post?.url} {postType}/>
            {/if}
            
            <Link class="text-xs max-w-[250px]" href={post.post?.url} newtab={$userSettings.openInNewTab.links} title={post.post?.url} domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap/>
            <MBFC post={post} rightJustify={true}/>
        </span>
        {/if}


        {#if (displayType == 'feed' && $userSettings.uiState.postBodyPreviewLength >= 0) || displayType=='post'}
            <PostBody bind:post bind:postContainer {displayType} bind:expandPreviewText 
                class="my-1"
                inline={
                    ( (post?.post?.body?.length ?? 0) > $userSettings.uiState.postBodyPreviewLength ||
                        (!post.post.body && (post?.post?.embed_description?.length ?? 0) > $userSettings.uiState.postBodyPreviewLength)
                    ) && !expandPreviewText &&  displayType=='feed'
                }
            />
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
