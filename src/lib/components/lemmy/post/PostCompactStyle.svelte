<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostType, PostDisplayType } from './helpers.js'
    
    
    import {isAudio, isImage, isVideo, postEditConfirmation } from './helpers.js'
    import { userSettings } from '$lib/settings.js'

    import Card from '$lib/components/ui/Card.svelte'
    import Crossposts from '$lib/components/lemmy/post/Crossposts.svelte'
    import NSFWOverlay from './utils/NSFWOverlay.svelte'
    import PostActions from '$lib/components/lemmy/post/components/PostActions.svelte'
    import PostBody from '$lib/components/lemmy/post/PostBody.svelte'
    import PostMeta from '$lib/components/lemmy/post/PostMeta.svelte'
    import PostLink from './PostLink.svelte';
    import PostTitle from './PostTitle.svelte';
    import CompactPostThumbnail from './utils/CompactPostThumbnail.svelte';
    import PostEmbedDescription from './PostEmbedDescription.svelte';
    import ArchiveLinkSelector from './utils/ArchiveLinkSelector.svelte';
    import Link from '$lib/components/input/Link.svelte';
    

    export let post: PostView
    export let actions: boolean = true
    export let displayType: PostDisplayType = "feed"
    export let expandCompact: boolean;
    export let expandPreviewText:boolean 
    export let disablePostLinks:boolean = false
    export let collapseBadges:boolean = false;
    export let postType: PostType
    export let inCommunity:boolean = false
    export let inProfile: boolean = false

    $:  showThumbnail = (
        displayType=='post' || (
            !$userSettings.uiState.hideCompactThumbnails && 
            (post.post.thumbnail_url || isImage(post.post.url) || isVideo(post.post.url))
        )
    
    ) ? true : false

    $:  imageOnly = (
        ['image', 'video'].includes(postType) &&
        (!post.post.body || post.post.body?.trim() == '' || post.post.body.length < 250)
    )
</script>


<Card class="flex flex-col w-full p-2 gap-1 {disablePostLinks ? 'pointer-events-none list-none' : ''}" >
    
    <!--- If post is NSFW, only show the metadata + title and overlay the rest--->
    {#if post.post.nsfw && displayType=='feed' && $userSettings.nsfwBlur}
        <div class="flex flex-col gap-1 items-end w-full">
            <PostMeta bind:post bind:expandCompact {actions} showTitle={true} {collapseBadges} {inCommunity} {inProfile} on:edit={postEditConfirmation}/>
            <NSFWOverlay bind:nsfw={post.post.nsfw} displayType={displayType} text="[Reveal NSFW Post]"/>
            <PostActions  bind:post {displayType} on:reply />
        </div>
    {:else}
        
        <!---Image and Video Posts--->
        <!---These will have the thumbnail in the upper-right corner rather than in the metadata--->
        {#if  (['image', 'video'].includes(postType)) }
            
        
            <!---Posts that have only a direct video or image and a body less than 250 characters--->
            {#if imageOnly}
                
                <PostMeta bind:post bind:expandCompact showTitle={true} {collapseBadges} {actions} {inCommunity} {inProfile} on:edit={postEditConfirmation}/>
                <div class="flex {$userSettings.uiState.reverseActionBar ? 'flex-row-reverse' : 'flex-row'} gap-2">
                    <div class="flex flex-col w-[calc(100%-68px)] sm:w-[calc(100%-100px)]  md:w-[calc(100%-132px)] gap-1">
                        <!--<PostTitle bind:post />-->
                        <PostEmbedDescription title={post.post.embed_title} on:clickThumbnail
                            description={$userSettings.uiState.hideCompactThumbnails && displayType=='feed' ? undefined : post.post.embed_description} 
                            url={post.post.url}
                            card={true} 
                        > 
                            <span class="flex flex-row w-full gap-2 px-1">
                                <ArchiveLinkSelector url={post.post?.url} {postType} />    
                                <Link  href={post.post.url} title={post.post.url} newtab={true}   domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap  />
                            </span>
                        </PostEmbedDescription>
                        
                        <PostBody bind:post {displayType} bind:expandPreviewText />
                        <Crossposts bind:post size="xs" class="mb-1 !pl-0"/>

                        <div class="mt-2" />
                        <PostActions  bind:post {displayType} on:reply />
                    </div>
                    <CompactPostThumbnail bind:post bind:expandCompact bind:displayType/>
                </div>
                
            <!---Posts that have an image/video and a post body greater than 250 chars--->
            {:else}
                <PostMeta bind:post bind:expandCompact showTitle={false} {collapseBadges} {actions} {inCommunity} {inProfile} on:edit={postEditConfirmation}/>
                <div class="flex {$userSettings.uiState.reverseActionBar ? 'flex-row-reverse' : 'flex-row'} gap-2">
                    <div class="flex flex-col w-full gap-1">
                        <PostTitle bind:post />
                        {#if (displayType == 'feed' && $userSettings.uiState.postBodyPreviewLength >= 0) || displayType=='post'}
                            <PostEmbedDescription title={post.post.embed_title} on:clickThumbnail
                                description={$userSettings.uiState.hideCompactThumbnails && displayType=='feed' ? undefined : post.post.embed_description} 
                                url={post.post.url}
                                card={true} 
                            > 
                                <span class="flex flex-row w-full gap-2 px-1">
                                    <ArchiveLinkSelector url={post.post?.url} {postType} />    
                                    <Link  href={post.post.url} title={post.post.url} newtab={true}   domainOnly={!$userSettings.uiState.showFullURL} highlight nowrap  />
                                </span>
                            </PostEmbedDescription>

                            <PostBody bind:post {displayType} bind:expandPreviewText class="my-1" >
                                <CompactPostThumbnail bind:post bind:expandCompact bind:displayType {showThumbnail} float slot="thumbnail"/>
                            </PostBody>
                        {/if}
                        <Crossposts bind:post size="xs" class="mb-1 !pl-0"/>
                        
                        <div class="mt-2" />
                        <PostActions  bind:post {displayType} on:reply />
                    </div>
                </div>
            {/if}

        <!---Link posts with embed description, etc--->
        {:else}

            <PostMeta bind:post bind:expandCompact showTitle={true} {collapseBadges} {actions} {inCommunity} {inProfile} on:edit={postEditConfirmation}/>
            <PostLink bind:post bind:displayType compact={true} on:clickThumbnail={() => { expandCompact = !expandCompact }} />
            {#if (displayType == 'feed' && $userSettings.uiState.postBodyPreviewLength >= 0) || displayType=='post'}
                <PostBody bind:post {displayType} bind:expandPreviewText  class="my-1" />
            {/if}
            <Crossposts bind:post size="xs" class="mb-1 !pl-0"/>
            <div class="mt-2" />
            <PostActions  bind:post {displayType} on:reply />
        {/if}
    {/if}
</Card>
