<script lang="ts">
    
    import type { PostType, PostDisplayType } from './helpers.js'
    import type { CommunityModeratorView, PostView } from 'lemmy-js-client'
    
    import { postType as identifyPostType } from './helpers.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings.js'
    
    import Card from '$lib/components/ui/Card.svelte'
    import Crossposts from '$lib/components/lemmy/post/Crossposts.svelte'
    import PostActions from '$lib/components/lemmy/post/PostActions.svelte'
    import PostMeta from '$lib/components/lemmy/post/PostMeta.svelte'
    import PostBody from '$lib/components/lemmy/post/PostBody.svelte'

    
    import PostBandcamp from '$lib/components/lemmy/post/PostBandcamp.svelte'
    import PostLink from '$lib/components/lemmy/post/PostLink.svelte'
    import PostImage from '$lib/components/lemmy/post/PostImage.svelte'
    import PostOdysee from '$lib/components/lemmy/post/PostOdysee.svelte'
    import PostPeerTube from '$lib/components/lemmy/post/PostPeerTube.svelte'
    import PostSongLink from '$lib/components/lemmy/post/PostSongLink.svelte'
    import PostSpotify from '$lib/components/lemmy/post/PostSpotify.svelte'
    import PostSoundCloud from '$lib/components/lemmy/post/PostSoundCloud.svelte'
    import PostVideo from '$lib/components/lemmy/post/PostVideo.svelte'
    import PostVimeo from '$lib/components/lemmy/post/PostVimeo.svelte'
    import PostYouTube from '$lib/components/lemmy/post/PostYouTube.svelte'
    
    export let actions: boolean = true
    export let autoplay:boolean|undefined = undefined;
    export let loop:boolean | undefined = undefined
    export let displayType: PostDisplayType = "feed"
    export let expandCompact: boolean = false;
    export let post: PostView
    export let moderators: Array<CommunityModeratorView> = [];
    export let showCommentForm:boolean = false;
    export let expandPreviewText:boolean = false
    export let collapseBadges:boolean = false;

    // Determe post type based on its attributes
    let postType:PostType  = identifyPostType(post)

</script>

<Card class="flex flex-col w-full p-3 gap-1 {displayType == 'post' ? 'min-h-[230px]' : ''}" id={post.post.id}>
    <div class="flex flex-row w-full gap-2.5">
        <PostMeta bind:post={post} moderators={moderators} {collapseBadges}/>
    </div>

    <!--- Link-style post without thumbnail URL--->
    {#if postType == "link" || postType == "thumbLink"}
        <PostLink bind:post={post} displayType={displayType} />
    {/if}

    <!--- Direct Image Post --->
    {#if postType == "image"}
        <PostImage bind:post={post} displayType={displayType}/>
    {/if}
        
    <!--- Direct Video Post --->
    {#if postType == "video"}
        <PostVideo bind:post={post} displayType={displayType} autoplay={autoplay} loop={loop}/>
    {/if}

    <!--- Bandcamp Embed --->
    {#if postType == "bandcamp"}
        <PostBandcamp bind:post={post} displayType={displayType}/>
    {/if}

    <!--- YouTube Video Post (or other supported embed: YT, Invidious, Spotify --->
    {#if postType == "youtube"}
        <PostYouTube bind:post={post} displayType={displayType} autoplay={autoplay}/>
    {/if}

    <!--- Spotify Embed --->
    {#if postType == "spotify"}
        <PostSpotify bind:post={post} displayType={displayType} />
    {/if}

    <!--- Soundcloud Embed --->
    {#if postType == "soundcloud"}
        <PostSoundCloud bind:post={post} displayType={displayType} />
    {/if}

    <!--- Vimeo Embed --->
    {#if postType == "vimeo"}
        <PostVimeo bind:post={post} displayType={displayType} />
    {/if}

    <!--- Odysee Embed --->
    {#if postType == "odysee"}
        <PostOdysee bind:post={post} displayType={displayType} />
    {/if}

    <!--- SongLink Embed --->
    {#if postType == "songlink"}
        <PostSongLink bind:post={post} displayType={displayType} />
    {/if}

    <!---Peertube Embed--->
    {#if postType == 'peertube'}
        <PostPeerTube bind:post={post} displayType={displayType} />
    {/if}

    <PostBody bind:post={post} displayType={displayType} bind:expandPreviewText/>

    <!--- Crossposts --->
    <Crossposts post={post} size={displayType=='feed' ? 'xs' : 'sm'}/>

    {#if actions}
        <PostActions  bind:post bind:expandCompact displayType={displayType} bind:showCommentForm
            on:edit={(e) => {
                toast({
                    title: 'Confirmation',
                    content: 'The post was edited successfully.',
                    type: 'success',
                })
            }}
        />
    {/if}
</Card>