<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostType, PostDisplayType } from './helpers.js'
    import {isImage, postType} from './helpers.js'
    import { getInstance } from '$lib/lemmy.js'
    import { userSettings } from '$lib/settings.js'

    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import { toast } from '$lib/components/ui/toasts/toasts.js'


    
    import PostActions from '$lib/components/lemmy/post/PostActions.svelte'
    import PostBandcamp from '$lib/components/lemmy/post/PostBandcamp.svelte'
    import PostLink from '$lib/components/lemmy/post/PostLink.svelte'
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'
    import PostVideo from '$lib/components/lemmy/post/PostVideo.svelte'
    import PostYouTube from '$lib/components/lemmy/post/PostYouTube.svelte'
    import PostSpotify from '$lib/components/lemmy/post/PostSpotify.svelte'
    import PostSoundCloud from '$lib/components/lemmy/post/PostSoundCloud.svelte'
    
    import PostMeta from '$lib/components/lemmy/post/PostMeta.svelte'
    
    


    export let post: PostView
    export let actions: boolean = true
    export let hideCommunity = false
    
    export let pDisplayType: PostDisplayType = "feed"
    
    
    // Determe post type based on its attributes
    let pType:PostType  = postType(post)
    let instance        = getInstance();
</script>

<Card class="bg-white flex flex-col w-full p-5 gap-2.5" id={post.post.id}>
    <div class="flex flex-row w-full gap-2.5">
        
        <PostMeta post={post} />
    
        <!--- Show Compact Posts --->
        {#if $userSettings.showCompactPosts && (post.post.thumbnail_url || isImage(post.post.url))}
        
            <div class="flex-none w-32 h-32">
                <a href="/post/{getInstance()}/{post.post.id}">

                    {#if post.post.thumbnail_url}
                        <img
                            src="{post.post.thumbnail_url}?thumbnail=256&format=webp"
                            loading="lazy"
                            class="object-cover bg-slate-100 rounded-md h-32 w-32 border border-slate-200 dark:border-zinc-700"
                            class:blur-lg={(post.post.nsfw && $userSettings.nsfwBlur)}
                        />
                    {:else}
                        <img
                            src="{post.post.url}?thumbnail=256&format=webp"
                            loading="lazy"
                            class="object-cover bg-slate-100 rounded-md h-32 w-32 border border-slate-200 dark:border-zinc-700"
                            class:blur-lg={(post.post.nsfw && $userSettings.nsfwBlur)}
                        />
                    {/if}
                </a>
            </div>
        {/if}
    </div>
  
    {#if !$userSettings.showCompactPosts}
        <!--- Link-style post without thumbnail URL--->
        {#if pType == "link" || pType == "thumbLink"}
            <PostLink post={post} displayType={pDisplayType} />
        {/if}

        <!--- Direct Image Post --->
        {#if pType == "image"}
            <PostImage post={post} displayType={pDisplayType}/>
        {/if}
        
        <!--- Direct Video Post --->
        {#if pType == "video"}
            <PostVideo post={post} />
        {/if}

        <!--- Bandcamp Embed --->
        {#if pType == "bandcamp"}
            <PostBandcamp post={post} displayType={pDisplayType}/>
        {/if}

        <!--- YouTube Video Post (or other supported embed: YT, Invidious, Spotify --->
        {#if pType == "youtube"}
            <PostYouTube post={post} displayType={pDisplayType} />
        {/if}

        <!--- Spotify Embed --->
        {#if pType == "spotify"}
            <PostSpotify post={post} displayType={pDisplayType} />
        {/if}

        <!--- Soundcloud Embed --->
        {#if pType == "soundcloud"}
            <PostSoundCloud post={post} displayType={pDisplayType} />
        {/if}

        
        <!--- Show first 350 characters of post body as a preview --->
        {#if post.post.body && !post.post.nsfw}
        <div class="text-sm bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md p-2">
            <!---inline--->
            <Markdown
                source={post.post.body.length > 350
                    ? `${post.post.body.slice(0, 350)}...`
                    : post.post.body
                }
            />
        </div>
        {/if}
    {/if}

    {#if actions}
        <PostActions
            bind:post
            on:edit={(e) => {
                toast({
                    content: 'The post was edited successfully.',
                    type: 'success',
                })
            }}
        />
    {/if}
</Card>

