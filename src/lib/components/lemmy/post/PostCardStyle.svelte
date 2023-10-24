<script lang="ts">
    
    import type { PostType, PostDisplayType } from './helpers.js'
    import type { CommunityModeratorView, PostView } from 'lemmy-js-client'
    
    import { postType as identifyPostType } from './helpers.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    
    import Card from '$lib/components/ui/Card.svelte'
    import Crossposts from '$lib/components/lemmy/post/Crossposts.svelte'
    import PostActions from '$lib/components/lemmy/post/PostActions.svelte'
    import PostMeta from '$lib/components/lemmy/post/PostMeta.svelte'
    import PostBody from '$lib/components/lemmy/post/PostBody.svelte'


    
    export let actions: boolean = true
    export let autoplay:boolean|undefined = undefined;
    export let displayType: PostDisplayType = "feed"
    export let expandCompact: boolean;
    export let post: PostView
    export let moderators: Array<CommunityModeratorView> = [];
    export let showCommentForm:boolean = false;

    // Determe post type based on its attributes
    let postType:PostType  = identifyPostType(post)

</script>

<Card class="flex flex-col w-full p-5 gap-1" id={post.post.id}>
    <div class="flex flex-row w-full gap-2.5">
        <PostMeta post={post} moderators={moderators}/>
    </div>

    <!--- Link-style post without thumbnail URL--->
    {#if postType == "link" || postType == "thumbLink"}
        {#await import('$lib/components/lemmy/post/PostLink.svelte') then { default: PostLink }}        
            <PostLink post={post} displayType={displayType} />
        {/await}
    {/if}

    <!--- Direct Image Post --->
    {#if postType == "image"}
        {#await import('$lib/components/lemmy/post/PostImage.svelte') then { default: PostImage }}
            <PostImage post={post} displayType={displayType}/>
        {/await}
    {/if}
        
    <!--- Direct Video Post --->
    {#if postType == "video"}
        {#await import('$lib/components/lemmy/post/PostVideo.svelte') then { default: PostVideo }}
            <PostVideo post={post} autoplay={autoplay}/>
        {/await}
    {/if}

    <!--- Bandcamp Embed --->
    {#if postType == "bandcamp"}
        {#await import('$lib/components/lemmy/post/PostBandcamp.svelte') then {default: PostBandcamp }}
            <PostBandcamp post={post} displayType={displayType}/>
        {/await}
    {/if}

    <!--- YouTube Video Post (or other supported embed: YT, Invidious, Spotify --->
    {#if postType == "youtube"}
        {#await import('$lib/components/lemmy/post/PostYouTube.svelte') then { default: PostYouTube }}
            <PostYouTube post={post} displayType={displayType} autoplay={autoplay}/>
        {/await}
    {/if}

    <!--- Spotify Embed --->
    {#if postType == "spotify"}
        {#await import('$lib/components/lemmy/post/PostSpotify.svelte') then { default: PostSpotify }}
            <PostSpotify post={post} displayType={displayType} />
        {/await}
    {/if}

    <!--- Soundcloud Embed --->
    {#if postType == "soundcloud"}
        {#await import('$lib/components/lemmy/post/PostSoundCloud.svelte') then { default: PostSoundCloud }}
            <PostSoundCloud post={post} displayType={displayType} />
        {/await}
    {/if}

    <!--- Vimeo Embed --->
    {#if postType == "vimeo"}
        {#await import('$lib/components/lemmy/post/PostVimeo.svelte') then { default: PostVimeo }}
            <PostVimeo post={post} displayType={displayType} />
        {/await}
    {/if}

    <!--- Odysee Embed --->
    {#if postType == "odysee"}
        {#await import('$lib/components/lemmy/post/PostOdysee.svelte') then { default: PostOdysee }}
            <PostOdysee post={post} displayType={displayType} />
        {/await}
    {/if}

    <!--- SongLink Embed --->
    {#if postType == "songlink"}
        {#await import('$lib/components/lemmy/post/PostSongLink.svelte') then { default: PostSongLink }}
            <PostSongLink post={post} displayType={displayType} />
        {/await}
    {/if}

    <PostBody post={post} displayType={displayType} />

    <!--- Crossposts --->
    <Crossposts post={post} size={displayType=='feed' ? 'xs' : 'sm'}/>

    {#if actions}
        <PostActions  bind:post bind:expandCompact displayType={displayType} postType={postType} bind:showCommentForm
            on:edit={(e) => {
                toast({
                    content: 'The post was edited successfully.',
                    type: 'success',
                })
            }}
        />
    {/if}
</Card>