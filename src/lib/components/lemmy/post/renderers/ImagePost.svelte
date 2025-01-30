<script lang="ts">
    import { getOptimalThumbnailURL, type PostDisplayType, type PostType } from '$lib/components/lemmy/post/helpers.js'
    import type { PostView } from 'lemmy-js-client'
    
    import { userSettings } from '$lib/settings.js'

    import ArchiveLinkSelector  from '$lib/components/lemmy/post/utils/ArchiveLinkSelector.svelte'
    import CompactPostThumbnail from '$lib/components/lemmy/post/components/CompactPostThumbnail.svelte'
    import Crossposts           from '$lib/components/lemmy/post/components/Crossposts.svelte'
    import Image                from '$lib/components/lemmy/post/components/Image.svelte'
    import Link                 from '$lib/components/input/Link.svelte'
    import PostActions          from '$lib/components/lemmy/post/components/PostActions.svelte'
    import PostBody             from '$lib/components/lemmy/post/components/PostBody.svelte'
    import PostEmbedDescription from '$lib/components/lemmy/post/components/PostEmbedDescription.svelte'
    import PostMeta             from '$lib/components/lemmy/post/components/PostMeta.svelte'
    import PostTitle            from '$lib/components/lemmy/post/components/PostTitle.svelte'
    
        

    // Standard for all post types
    export let post:PostView
    export let actions: boolean             = true
    export let inCommunity                  = false
    export let inProfile                    = false
    export let displayType: PostDisplayType = 'feed'
    export let postType: PostType           = 'image'
    export let compact: boolean             = true
    export let inModal: boolean             = false
    export let onHomeInstance: boolean      = false

    //Component-specific
    export let zoomable:boolean = true
    
    let thumbnail_url:string
    let expandPreviewText: boolean 

    // Finesse the url and thumbnail URL to accommodate GIFs (and not thumbnail webms ugh) or when the thumbnanil is a static image but the embed URL is a GIF (Imgur)
    $:  post.post.url, post.post.embed_video_url, post.post.thumbnail_url, thumbnail_url = getOptimalThumbnailURL({post:post}) ?? '/img/placeholder.png'

   
    $: showEmbedDescription = (post.post.embed_title && post.post.embed_description)
</script>




{#if compact}

    <!---If there is no or a very short body text with the image, display it more compactly since the text won't have to flow around it--->
    {#if !post?.post.body || post.post.body.length < 250}

        <PostMeta bind:post showTitle={false} {postType} {actions} {inCommunity} {inProfile} {inModal} {onHomeInstance} {compact} on:toggleCompact={() => compact = !compact} />    

        <div class="flex {$userSettings.uiState.reverseActionBar ? 'flex-row-reverse' : 'flex-row'} gap-2">
            <div class="flex flex-col gap-1 {showEmbedDescription ? 'w-full' : 'w-[calc(100%-68px)] sm:w-[calc(100%-100px)]  md:w-[calc(100%-132px)]'} ">
                
                <PostTitle bind:post {postType} {onHomeInstance}/>
                
                <!---Mostly used if Posting a Link to Another Lemmy Post--->
                {#if showEmbedDescription}
                    
                    <PostEmbedDescription title={post.post.embed_title} on:clickThumbnail={() => compact = false}
                        description={post.post.embed_description} 
                        url={post.post.url}
                        showThumbnail = {($userSettings.uiState.hideCompactThumbnails && displayType=='feed') ? false : true} 
                        thumbnail_urls={[post.post.thumbnail_url, post.post.embed_video_url, post.post.url]}
                        nsfw={post.post.nsfw}
                        {compact}
                    > 
                        <ArchiveLinkSelector url={post.post?.url} {postType} />    
                        <Link href={post.post.url} title={post.post.url} newtab={true}   domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap  class="text-xs"/>

                    </PostEmbedDescription>
                {/if}
                
                <PostBody bind:post bind:expandPreviewText {displayType}  />
                <Crossposts bind:post size="xs" class="mb-1 !pl-0"/>
                <PostActions bind:post {inModal} {displayType} {onHomeInstance} on:reply class="mt-2" />
            </div>
            
            <!---If the Embed Description is Shown, the thumbnail will go there--->
            {#if !showEmbedDescription}
                <CompactPostThumbnail {post} {displayType}
                    showThumbnail = {($userSettings.uiState.hideCompactThumbnails && displayType=='feed') ? false : true} 
                    on:toggleCompact={() => compact = !compact}
                />
            {/if}
        </div>
    
    <!---Separate out the components and let the post body flow around the thumbnail image--->
    {:else}
        <PostMeta bind:post showTitle={false} {postType} {actions} {inCommunity} {inProfile} {inModal} {onHomeInstance} {compact} on:toggleCompact={() => compact = !compact} />    
        
        <div class="flex {$userSettings.uiState.reverseActionBar ? 'flex-row-reverse' : 'flex-row'} gap-2">
            <div class="flex flex-col w-full gap-1">
                <PostTitle bind:post {postType} {onHomeInstance}/>

                <PostBody bind:post bind:expandPreviewText {displayType} class="my-1" >
                    <CompactPostThumbnail {post} {displayType} float slot="thumbnail" 
                        showThumbnail = {($userSettings.uiState.hideCompactThumbnails && displayType=='feed') ? false : true}
                        on:toggleCompact={() => compact = !compact}
                    />
                </PostBody>

                <Crossposts bind:post size="xs" class="mb-1 !pl-0"/>
                
                <div class="mt-2" />
                <PostActions bind:post {inModal} {displayType} {onHomeInstance} on:reply />
            </div>
        </div>
    {/if}

<!---Card View--->
{:else}
    <PostMeta bind:post showTitle={true} {postType} {actions} {inCommunity} {inProfile} {inModal} {onHomeInstance} {compact} on:toggleCompact={() => compact = !compact} />

    <PostEmbedDescription title={post.post.embed_title} description={post.post.embed_description}  url={post.post.url} {compact} > 
        <ArchiveLinkSelector url={post.post?.url} {postType} />    
        <Link  href={post.post.url} title={post.post.url} newtab={true}   domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap  class="text-xs"/>
    </PostEmbedDescription>

    <Image url={thumbnail_url} {displayType} nsfw={post.post.nsfw} alt_text={post.post.alt_text ?? post.post.name} {zoomable} on:click/>

    <PostBody bind:post bind:expandPreviewText {displayType}  />
    <Crossposts bind:post size="xs" class="mb-1 !pl-0"/>
    <PostActions bind:post {inModal} {displayType} {onHomeInstance} on:reply class="mt-2"/>

{/if}












