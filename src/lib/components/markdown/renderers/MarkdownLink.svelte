<script lang="ts">
    /*
        Look for user setting to preview links
        if off, just show a regular link

        if on:
            - Check if "internal" link.  Just make that a regular link
            - If YouTube or something we can build an embed URL from, open a modal with the generated embed URL. Use getSiteMetaData() to async fill in the title/description
            - Otherwise, open a modal and call the getSiteMetadata() endpiont for the URL
            - Add a toggle switch to change the link preview behavior
            - Add a link to continue to the resource

    */
    
    import type { Tokens } from 'marked'
    
    import IFrame from '$lib/components/lemmy/post/utils/IFrame.svelte';
    import Link from '$lib/components/input/Link.svelte';
    
    import { 
        type PostType,
        isYoutubeLikeVideo, 
        buildYouTubeEmbedLink 
    } from '$lib/components/lemmy/post/helpers'
    
    import { photonify } from '../markdown';
    import { userSettings } from '$lib/settings';

    export let token: Tokens.Link
    //export let linkPreviews:boolean = true

    let postType:PostType
    let embedURL: URL | undefined
    
    let internalLink = photonify(token.href)

    // Make the links relative to this instance
    if (internalLink) {
        token.href = photonify(token.href)!
    }

    if (token.href && isYoutubeLikeVideo(token.href)) {
        postType = 'youtube';
        embedURL = buildYouTubeEmbedLink(token.href)
    }



    

    


    
</script>
<Link highlight href={token.href} title={token.title} newtab={$userSettings.openInNewTab.links}>
    <slot/>
</Link>

<!---
{#if postType=='youtube' && embedURL}
    <IFrame embedURL={embedURL} />
{:else}

{/if}
--->