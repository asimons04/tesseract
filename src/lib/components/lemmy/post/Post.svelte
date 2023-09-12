<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostDisplayType } from './helpers.js'
    
    import {isImage, postType} from './helpers.js'
    //import { isImage, postType } from '$lib/ui/image.js'
    
    
    import Card from '$lib/components/ui/Card.svelte'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    
    import { getInstance } from '$lib/lemmy.js'
    import PostActions from '$lib/components/lemmy/post/PostActions.svelte'
    import { userSettings } from '$lib/settings.js'
    
    import PostLink from '$lib/components/lemmy/post/PostLink.svelte'
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'
    import PostVideo from '$lib/components/lemmy/post/PostVideo.svelte'
    import PostYouTube from '$lib/components/lemmy/post/PostYouTube.svelte'
    import PostSpotify from '$lib/components/lemmy/post/PostSpotify.svelte'
    import PostSoundCloud from '$lib/components/lemmy/post/PostSoundCloud.svelte'
    
    import PostMeta from '$lib/components/lemmy/post/PostMeta.svelte'
    
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'


    export let post: PostView
    export let actions: boolean = true
    export let hideCommunity = false
    
    let pType:string = postType(post)
    let pDisplayType: PostDisplayType = "feed"

</script>

<Card class="bg-white flex flex-col w-full p-5 gap-2.5" id={post.post.id}>
    <div class="flex flex-row w-full gap-2.5">
        <div class="flex flex-col gap-1.5 grow">
            <PostMeta
                community={hideCommunity ? undefined : post.community}
                user={post.creator}
                published={new Date(post.post.published + 'Z')}
                upvotes={post.counts.upvotes}
                downvotes={post.counts.downvotes}
                deleted={post.post.deleted}
                removed={post.post.removed}
                locked={post.post.locked}
                featured={post.post.featured_local || post.post.featured_community}
                nsfw={post.post.nsfw}
                saved={post.saved}
            />

            <a
                href="/post/{getInstance()}/{post.post.id}"
                class="font-medium max-w-full w-full break-words"
                style="word-break: break-word;"
                class:text-slate-500={post.read && $userSettings.markReadPosts}
                class:dark:text-zinc-400={post.read && $userSettings.markReadPosts}
            >
                {post.post.name}
            </a>
        </div>
    
        <!--- Show Compact Posts --->
        {#if $userSettings.showCompactPosts && (post.post.thumbnail_url || isImage(post.post.url))}
        <div class="flex-none w-32 h-32">
            <a href="/post/{getInstance()}/{post.post.id}">
                <!--- Evaluate if these are redundant/pointless --->
                {#if post.post.thumbnail_url}
                    <img
                        src="{post.post.thumbnail_url}?thumbnail=256&format=webp"
                        loading="lazy"
                        class="object-cover bg-slate-100 rounded-md h-32 w-32 border border-slate-200 dark:border-zinc-700"
                    />
                {:else}
                    <img
                        src="{post.post.url}?thumbnail=256&format=webp"
                        loading="lazy"
                        class="object-cover bg-slate-100 rounded-md h-32 w-32 border border-slate-200 dark:border-zinc-700"
                    />
                {/if}
            </a>
        </div>
        {/if}
    </div>
  
    {#if !$userSettings.showCompactPosts}
        <!--- Link-style post without thumbnail URL--->
        {#if pType == "link"}
        <a
            href={post.post.url}
            target="{$userSettings.openInNewTab.postLinks
                ? '_blank'
                : '_self'
            }"
            class="max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-sky-400 hover:underline text-xs"
            title={post.post.name}
        >
            {post.post.url}
        </a>
        {/if}

        <!--- Direct Image Post --->
        {#if pType == "image"}
        <PostImage
            instance = {getInstance()}
            name = {post.post.name}
            url = {post.post.url}
            id = {post.post.id}
            nsfw = {post.post.nsfw}
            nsfwBlur = {$userSettings.nsfwBlur}
            displayType={pDisplayType}
        />
        {/if}
        
        <!--- Direct Video Post --->
        {#if pType == "video"}
        <PostVideo
            url = {post.post.url}
        />
        {/if}

        <!--- YouTube Video Post (or other supported embed: YT, Invidious, Spotify --->
        {#if pType == "youtube"}
        <PostYouTube
            post = {post}
            displayType={pDisplayType}
        />
        {/if}

        <!--- Spotify Embed --->
        {#if pType == "spotify"}
        <PostSpotify
            post = {post}
            displayType={pDisplayType}
        />
        {/if}

        <!--- Soundcloud Embed --->
        {#if pType == "soundcloud"}
        <PostSoundCloud
            post = {post}
            displayType={pDisplayType}
        />
        {/if}

        <!--- Link-style post that is not Youtube --->
        {#if pType == "thumbLink" }
        <PostLink
            url={post.post.url}
            thumbnail_url="{post.post.thumbnail_url}?format=webp&thumbnail=768"
            nsfw={post.post.nsfw}
            title={post.post.name}
            displayType={pDisplayType}
        />
        {/if}
        
        <!--- Show first 350 characters of post body as a preview --->
        {#if post.post.body && !post.post.nsfw}
        <div
            class="text-sm bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md p-2"
        >
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

