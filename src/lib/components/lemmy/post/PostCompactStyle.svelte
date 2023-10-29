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

</script>


<Card class="bg-white flex flex-col w-full p-2 gap-2.5 " id={post.post.id}>

    <!--- Post Metadata, Title, and Thumbnail  --->
    <div class="flex flex-row w-full">
        <div class="flex flex-col gap-2.5
            { (post.post.thumbnail_url || isImage(post.post.url))
                ? 'w-[80%]'
                : 'w-full'
            }
        ">
            <PostMeta bind:post={post} displayType={displayType} showTitle={true}/>
            
            {#if post.post.url && !isImage(post.post.url)}
                <Link
                    href={post.post.url}
                    title={post.post.url}
                    newtab={$userSettings.openInNewTab.postLinks}
                    highlight
                >
                    <span class="text-sm">{new URL(post.post.url).host}</span>
                </Link>
            {/if}

            <PostBody post={post} displayType={displayType} previewLength={0} bind:expandPreviewText/>

            <!--- Crossposts --->
            <Crossposts post={post} size="xs" class="!pl-0"/>

        </div>
        
        <!--- Thumbnail --->
        {#if post.post.thumbnail_url || isImage(post.post.url)}
        <div class="flex-none w-[20%] h-auto ml-4 mt-auto mb-auto">
            <div class="grid justify-items-center">
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
    </div>

    <!--- Post Action Bar--->
    <div class="flex flex-row w-full">
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