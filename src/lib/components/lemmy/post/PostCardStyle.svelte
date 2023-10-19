<script lang="ts">
    
    import type { PostType, PostDisplayType } from './helpers.js'
    import type { PostView } from 'lemmy-js-client'
    
    import {postType as identifyPostType, scrollToTop} from './helpers.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    
    import Card from '$lib/components/ui/Card.svelte'
    import Crossposts from '$lib/components/lemmy/post/Crossposts.svelte'
    import PostActions from '$lib/components/lemmy/post/PostActions.svelte'
    import PostMeta from '$lib/components/lemmy/post/PostMeta.svelte'
    import PostBody from '$lib/components/lemmy/post/PostBody.svelte'
    
    // Post Media Types
    import PostBandcamp from '$lib/components/lemmy/post/PostBandcamp.svelte'
    import PostLink from '$lib/components/lemmy/post/PostLink.svelte'
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'
    import PostOdysee from '$lib/components/lemmy/post/PostOdysee.svelte'
    import PostSongLink from '$lib/components/lemmy/post/PostSongLink.svelte'
    import PostSoundCloud from '$lib/components/lemmy/post/PostSoundCloud.svelte'
    import PostSpotify from '$lib/components/lemmy/post/PostSpotify.svelte'
    import PostVideo from '$lib/components/lemmy/post/PostVideo.svelte'
    import PostVimeo from '$lib/components/lemmy/post/PostVimeo.svelte'
    import PostYouTube from '$lib/components/lemmy/post/PostYouTube.svelte'
    
    export let actions: boolean = true
    export let autoplay:boolean|undefined = undefined;
    export let displayType: PostDisplayType = "feed"
    export let expandCompact: boolean;
    export let post: PostView
    
    // Determe post type based on its attributes
    let postType:PostType  = identifyPostType(post)

</script>

<Card class="flex flex-col w-full p-5 gap-2.5" id={post.post.id}>
    <div class="flex flex-row w-full gap-2.5">
        <PostMeta post={post} />
    </div>

    <!--- Link-style post without thumbnail URL--->
    {#if postType == "link" || postType == "thumbLink"}
        <PostLink post={post} displayType={displayType} />
    {/if}

    <!--- Direct Image Post --->
    {#if postType == "image"}
        <PostImage post={post} displayType={displayType}/>
    {/if}
        
    <!--- Direct Video Post --->
    {#if postType == "video"}
        <PostVideo post={post} autoplay={autoplay}/>
    {/if}

    <!--- Bandcamp Embed --->
    {#if postType == "bandcamp"}
        <PostBandcamp post={post} displayType={displayType}/>
    {/if}

    <!--- YouTube Video Post (or other supported embed: YT, Invidious, Spotify --->
    {#if postType == "youtube"}
        <PostYouTube post={post} displayType={displayType} autoplay={autoplay}/>
    {/if}

    <!--- Spotify Embed --->
    {#if postType == "spotify"}
        <PostSpotify post={post} displayType={displayType} />
    {/if}

    <!--- Soundcloud Embed --->
    {#if postType == "soundcloud"}
        <PostSoundCloud post={post} displayType={displayType} />
    {/if}

    <!--- Vimeo Embed --->
    {#if postType == "vimeo"}
        <PostVimeo post={post} displayType={displayType} />
    {/if}

    <!--- Odysee Embed --->
    {#if postType == "odysee"}
        <PostOdysee post={post} displayType={displayType} />
    {/if}

    <!--- SongLink Embed --->
    {#if postType == "songlink"}
        <PostSongLink post={post} displayType={displayType} />
    {/if}

    <PostBody post={post} displayType={displayType} />

    <!--- Crossposts --->
    <Crossposts post={post} size={displayType=='feed' ? 'xs' : 'sm'}/>

    {#if actions}
        <PostActions  bind:post bind:expandCompact displayType={displayType} postType={postType}
            on:edit={(e) => {
                toast({
                    content: 'The post was edited successfully.',
                    type: 'success',
                })
            }}
        />
    {/if}
</Card>