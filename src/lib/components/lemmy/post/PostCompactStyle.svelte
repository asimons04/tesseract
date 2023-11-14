<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostType, PostDisplayType } from './helpers.js'
    
    import { imageProxyURL } from '$lib/image-proxy'
    import {isImage, postType as identifyPostType} from './helpers.js'
    import { scrollToTop } from './helpers.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings.js'


    import Card from '$lib/components/ui/Card.svelte'
    import Crossposts from '$lib/components/lemmy/post/Crossposts.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import PostActions from '$lib/components/lemmy/post/PostActions.svelte'
    import PostMeta from '$lib/components/lemmy/post/PostMeta.svelte'
    import PostBody from '$lib/components/lemmy/post/PostBody.svelte'

    export let post: PostView
    export let actions: boolean = true
    export let autoplay:boolean|undefined = undefined;
    export let displayType: PostDisplayType = "feed"
    export let forceCompact:boolean = false;
    export let expandCompact: boolean;
    export let expandPreviewText:boolean 
    export let disablePostLinks:boolean = false
    export let collapseBadges:boolean = false;

</script>


<Card class="bg-white flex flex-col w-full p-2 gap-0 " id={post.post.id}>

    <PostMeta bind:post={post} displayType={displayType} showTitle={true} {collapseBadges}/>



    <!--- Post Link, Body, and Thumbnail  --->
    <div class="flex flex-row w-full {disablePostLinks ? 'pointer-events-none list-none' : ''}">
        <!--- Thumbnail --->
        {#if post.post.thumbnail_url || isImage(post.post.url)}
            <div class="flex-none w-[20%] md:w-[15%] h-auto mr-2 mt-2">
                <div class="grid justify-items-start">
                    <!--- Expand the post in place when clicking thumbnail--->
                    <div 
                        role="button"
                        title="{expandCompact ? 'Collapse' : 'Expand'}" 
                        class="cursor-pointer"
                        on:click={() => {  
                            expandCompact = !expandCompact; 
                            const element = document.getElementById(post.post.id);
                            if (element) scrollToTop(element);

                        }}
                    >
                        <!--- Thumbnail for Link Post--->
                        {#if post.post.thumbnail_url}
                            <img
                                src="{imageProxyURL(post.post.thumbnail_url, 256, 'webp')}"
                                loading="lazy"
                                class="object-cover bg-slate-100 rounded-md h-32 w-32 border border-slate-200 dark:border-zinc-700"
                                class:blur-lg={(post.post.nsfw && $userSettings.nsfwBlur)}
                            />
                        <!---Thumbnail for Image Post--->
                        {:else}
                            <img
                                src="{imageProxyURL(post.post.url, 256, 'webp')}"
                                loading="lazy"
                                class="object-cover bg-slate-100 rounded-md h-32 w-32 border border-slate-200 dark:border-zinc-700"
                                class:blur-lg={(post.post.nsfw && $userSettings.nsfwBlur)}
                            />
                        {/if}
                
                    
                    </div>
                </div>
            </div>
        {/if}
        
        
        <!---Post body and link--->
        <div class="flex flex-col gap-0 {post.post.thumbnail_url || isImage(post.post.url) ? 'w-[80%]' : 'w-full'}">
            {#if post.post.url && !isImage(post.post.url)}
                <Link
                    href={post.post.url}
                    title={post.post.url}
                    newtab={$userSettings.openInNewTab.links}
                    highlight
                >
                    <span class="text-xs">{new URL(post.post.url).host}</span>
                </Link>
            {/if}
            
            <div class="mt-1"/>
            <PostBody post={post} displayType={displayType} previewLength={240} bind:expandPreviewText inline={!expandPreviewText}/>

            <!--- Crossposts --->
            <Crossposts post={post} size="xs" class="!pl-0"/>

        </div>
        
        
    </div>
    
    <div class="mt-1"/>
    
    <!--- Post Action Bar--->
    <div class="flex flex-row w-full mt-1">
        {#if actions}
            <div class="w-full h-full grid items-end">
                <PostActions 
                    bind:post 
                    bind:expandCompact
                    displayType={displayType}
                    on:edit={(e) => {
                        toast({
                            content: 'The post was edited successfully.',
                            type: 'success',
                        })
                    }}
                />
            </div>
        {/if}
    </div>
</Card>
