<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostType, PostDisplayType } from './helpers.js'
    
    import { fixLemmyEncodings } from '$lib/components/lemmy/post/helpers'
    import { getInstance } from '$lib/lemmy.js'
    import { imageProxyURL } from '$lib/image-proxy'
    import {isImage, postType} from './helpers.js'
    import { scrollToTop } from './helpers.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings.js'
    
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import PostActions from '$lib/components/lemmy/post/PostActions.svelte'
    import PostMeta from '$lib/components/lemmy/post/PostMeta.svelte'
    import SectionTitle from '$lib/components/ui/SectionTitle.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'


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
    

    
    import { 
        Icon, 
        ChatBubbleOvalLeftEllipsis,
        Link as LinkIcon,
        ChevronDown,
        ChevronUp
    } from 'svelte-hero-icons'
    


    export let post: PostView
    export let actions: boolean = true
    export let autoplay:boolean|undefined = undefined;
    export let displayType: PostDisplayType = "feed"
    
    let expandCompact: boolean;
    let expandPreviewText:boolean = false;
    
    
    // Determe post type based on its attributes
    let pType:PostType  = postType(post)
    let instance        = getInstance();
    
    function delay(millisec:number) {
        return new Promise(resolve => {
            setTimeout(() => { resolve('') }, millisec);
        })
    }
    
</script>



<!--- Compact Posts --->
{#if  ($userSettings.showCompactPosts && !expandCompact && displayType=='feed') }
<Card class="bg-white flex flex-col w-full p-5 gap-2.5" id={post.post.id}>

    <!--- Post Metadata, Title, and Thumbnail  --->
    <div class="flex flex-row w-full">
        <div class="flex flex-col gap-2.5
            { (post.post.thumbnail_url || isImage(post.post.url))
                ? 'w-[80%]'
                : 'w-full'
            }
        ">
            <PostMeta post={post} displayType={displayType} showTitle={true}/>
            
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



<!--- Card Posts --->
<!---{#if (!$userSettings.showCompactPosts) || ($userSettings.showCompactPosts && expandCompact)  }--->
{:else}
    <Card class="bg-white flex flex-col w-full p-5 gap-2.5" id={post.post.id}>
        <div class="flex flex-row w-full gap-2.5">
            <PostMeta post={post} />
        </div>
    
        <!--- Link-style post without thumbnail URL--->
        {#if pType == "link" || pType == "thumbLink"}
            <PostLink post={post} displayType={displayType} />
        {/if}

        <!--- Direct Image Post --->
        {#if pType == "image"}
            <PostImage post={post} displayType={displayType}/>
        {/if}
            
        <!--- Direct Video Post --->
        {#if pType == "video"}
            <PostVideo post={post} />
        {/if}

        <!--- Bandcamp Embed --->
        {#if pType == "bandcamp"}
            <PostBandcamp post={post} displayType={displayType}/>
        {/if}

        <!--- YouTube Video Post (or other supported embed: YT, Invidious, Spotify --->
        {#if pType == "youtube"}
            <PostYouTube post={post} displayType={displayType} autoplay={autoplay}/>
        {/if}

        <!--- Spotify Embed --->
        {#if pType == "spotify"}
            <PostSpotify post={post} displayType={displayType} />
        {/if}

        <!--- Soundcloud Embed --->
        {#if pType == "soundcloud"}
            <PostSoundCloud post={post} displayType={displayType} />
        {/if}

        <!--- Vimeo Embed --->
        {#if pType == "vimeo"}
            <PostVimeo post={post} displayType={displayType} />
        {/if}

        <!--- Odysee Embed --->
        {#if pType == "odysee"}
            <PostOdysee post={post} displayType={displayType} />
        {/if}

        <!--- SongLink Embed --->
        {#if pType == "songlink"}
            <PostSongLink post={post} displayType={displayType} />
        {/if}

            
        <!--- Show first 250 characters of post body as a preview in the feed (if not NSFW)--->
        {#if (post.post.body || post.post.embed_description) && !post.post.nsfw && displayType=='feed'}
            <div class="text-sm bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md p-2">

                {#if post.post.body}    
                    <Markdown source={
                            ( !expandPreviewText && post.post.body.length > 250)
                                ? `${post.post.body.slice(0, 250)}...`
                                : post.post.body
                        }
                    />
                
                    {#if post.post.body.length > 250}
                    <Button
                        color="secondary"
                        class="w-full mt-4"
                        title="{expandPreviewText ? 'Collapse' : 'Expand'}"
                        on:click={() => {
                            expandPreviewText = !expandPreviewText
                            const element = document.getElementById(post.post.id);
                            if (element) scrollToTop(element);
                        }}
                    >
                        <Icon src={expandPreviewText ? ChevronUp : ChevronDown} mini size="16" slot="icon" />
                        {expandPreviewText ? 'Collapse' : 'Expand'}
                        <Icon src={expandPreviewText ? ChevronUp : ChevronDown} mini size="16"  />
                    </Button>
                    {/if}
                
                <!--- If no post body but there's an embed description avaialble, display that--->
                {:else if post.post.embed_description}
                    <Markdown source={
                        ( !expandPreviewText && post.post.embed_description.length > 250)
                            ? `${post.post.embed_description.slice(0, 250)}...`
                            : post.post.embed_description
                        }
                    />
                    
                    {#if post.post.embed_description.length > 250}
                    <Button
                        color="secondary"
                        class="w-full mt-4"
                        title="{expandPreviewText ? 'Collapse' : 'Expand'}"
                        on:click={() => {
                            expandPreviewText = !expandPreviewText
                            const element = document.getElementById(post.post.id);
                            if (element) scrollToTop(element);
                        }}
                    >
                        <Icon src={expandPreviewText ? ChevronUp : ChevronDown} mini size="16" slot="icon" />
                        {expandPreviewText ? 'Collapse' : 'Expand'}
                        <Icon src={expandPreviewText ? ChevronUp : ChevronDown} mini size="16"  />
                    </Button>
                    {/if}



                {/if}
            </div>
        {/if}

        <!--- Crossposts --->
        {#if post.cross_posts?.length > 0}
            <details open={post.cross_posts?.length <= 2} >
                <summary class="inline-block w-full">
                    <SectionTitle class="flex flex-row text-xs font-bold mt-2 cursor-pointer">
                        Crossposts 
                        <span class="text-slate-600 dark:text-zinc-400 text-xs ml-1">
                            {post.cross_posts.length}
                        </span>
                    </SectionTitle>
                </summary>
                    
                <div class="flex flex-col mt-1 pl-2">
                    {#each post.cross_posts as crosspost}
                        <div class="flex flex-row text-xs" >
                            <CommunityLink
                                community={crosspost.community}
                                avatarSize={18}
                                avatar={true}
                                href="/post/{getInstance()}/{crosspost.post.id}"
                            />
                            
                            <div class="ml-auto"/>

                            <a class="flex flex-row gap-2 text-xs items-center cursor-pointer" href="/post/{getInstance()}/{crosspost.post.id}">
                                <Icon
                                    src={ChatBubbleOvalLeftEllipsis}
                                    mini
                                    width={12}
                                    height={12}
                                />
                                <FormattedNumber number={crosspost.counts.comments} />
                            </a>
                        </div>
                    {/each}
                </div>
            </details>
        {/if}

        <!--- Show full pody body if displaying in post--->
        {#if post.post.body && displayType=='post'}
            <div class="text-sm bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md p-2">
                <Markdown source={post.post.body} />
            </div>
        {/if}
            
        {#if actions}
            <PostActions 
                bind:post
                bind:expandCompact
                bind:expandPreviewText
                displayType={displayType}
                postType={pType}
                on:edit={(e) => {
                    toast({
                        content: 'The post was edited successfully.',
                        type: 'success',
                    })
                }}
            />
        {/if}
    </Card>
{/if}





