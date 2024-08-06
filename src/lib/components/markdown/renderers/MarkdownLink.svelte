<script lang="ts">
   
    import type { Tokens } from 'marked'
    
    import Link from '$lib/components/input/Link.svelte';
    
    import { photonify } from '../markdown';
    import { userSettings } from '$lib/settings';

    export let token: Tokens.Link
    
    let internalLink = photonify(token.href)

    // Make the links relative to this instance
    if (internalLink) {
        token.href = photonify(token.href)!
    }
</script>

<Link highlight 
    href={token.href} 
    title={token.title ?? token.href} 
    preview={
        !(token.href.startsWith('/')) && 
        $userSettings.uiState.linkPreviews
    } 
    newtab={$userSettings.openInNewTab.links}
>
    <slot/>
</Link>
