<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostType, PostDisplayType } from './helpers.js'
    
    import { fixLemmyEncodings } from '$lib/components/lemmy/post/helpers'
    import { getInstance } from '$lib/lemmy.js'
    import { imageProxyURL } from '$lib/image-proxy'
    import {isImage, postType} from './helpers.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings.js'
    
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import PostActions from '$lib/components/lemmy/post/PostActions.svelte'
    import PostMeta from '$lib/components/lemmy/post/PostMeta.svelte'
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
    <div class="w-full">
        <PostMeta post={post} displayType={displayType} showTitle={false}/>
    </div>

    <div class="flex flex-row w-full">
        <!--- Post Header and Title --->
        <div class="flex flex-col w-[80%] gap-2.5">
            <a
                href="/post/{getInstance()}/{post.post.id}"
                class="font-medium max-w-full w-full break-words"
                style="word-break: break-word;"
                class:text-slate-500={post.read && $userSettings.markReadPosts}
                class:dark:text-zinc-400={post.read && $userSettings.markReadPosts}
                title="{post.post.name}"
            >
                <h1 class="text-lg">{fixLemmyEncodings(post.post.name)}</h1>    
            
            </a>
            
            {#if post.post.url && !isImage(post.post.url)}
                <Link
                    href={post.post.url}
                    title={post.post.url}
                    newtab={$userSettings.openInNewTab.postLinks}
                    highlight
                >
                    {new URL(post.post.url).host}
                </Link>
            {/if}

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
        
        <!--- Thumbnail --->
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
                        if (element) {
                            element.scrollIntoView({
                                behavior: 'smooth',
                                block: "start"
                            });
                        }

                    }}
                >
                    
                    {#if post.post.thumbnail_url || isImage(post.post.url)}
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
                    <!--- Placeholder Image--->
                    {:else}
                        <img
                            src="/img/placeholder.png"
                            loading="lazy"
                            class="object-cover bg-slate-100 dark:bg-zinc-600 rounded-md h-32 w-32 border border-slate-200 dark:border-zinc-700"
                        />
                    
                    {/if}
                </div>
            </div>
        </div>
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
        {#if post.post.body && !post.post.nsfw && displayType=='feed'}
            <div class="text-sm bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md p-2">
                
                <Markdown source={
                        ( !expandPreviewText && post.post.body.length > 250)
                            ? `${post.post.body.slice(0, 250)}...`
                            : post.post.body
                    }
                />
                
                {#if post.post.body.length > 250}
                <Button
                    color="secondary"
                    class="w-full"
                    title="{expandPreviewText ? 'Collapse' : 'Expand'}"
                    on:click={async () => {
                        expandPreviewText = !expandPreviewText
                        
                        await delay(10);
                        const element = document.getElementById(post.post.id);
                        if (element) {
                            element.scrollIntoView({
                                behavior: 'smooth',
                                block: "start"
                            });
                        }
                    }}
                >
                    <Icon src={expandPreviewText ? ChevronUp : ChevronDown} mini size="16" slot="icon" />
                    {expandPreviewText ? 'Collapse' : 'Expand'}
                    <Icon src={expandPreviewText ? ChevronUp : ChevronDown} mini size="16"  />
                </Button>
                {/if}
                


            </div>
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





