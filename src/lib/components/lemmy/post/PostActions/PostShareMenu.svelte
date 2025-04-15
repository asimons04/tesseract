<script lang="ts">
 import type { PostView } from 'lemmy-js-client'
    
    import { dispatchWindowEvent } from '$lib/ui/events'
    import { federationStateModal, fediseerModal } from '$lib/components/lemmy/moderation/moderation'
    import { getClient } from '$lib/lemmy'
    
    import { removeToast, toast } from '$lib/components/ui/toasts/toasts'
    import { instance } from '$lib/instance'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth'
    import { refreshProfile } from '$lib/lemmy/user'

    import Button from '$lib/components/input/Button.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'

    import {
        CubeTransparent,
        Link as LinkIcon,
        Share,
    } from 'svelte-hero-icons'

    export let post:PostView
    export let onHomeInstance: boolean  = false
</script>


<!---Explore Menu--->
<Menu alignment="bottom-right" containerClass="overflow-auto">
    
    <Button slot="button" aria-label="Share Post Link Menu" let:toggleOpen on:click={toggleOpen} 
        size="square-md" title="Share Post Link" color="tertiary" icon={Share} iconSize={16}
    />
    
    <li class="flex flex-row items-center text-xs font-bold opacity-100 text-left mx-4 my-1 py-1 max-w-[25ch]">
        Copy Post Link
    </li>
    <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />
    
    <!---Canonical Post URL--->
    <MenuButton title="Canonical URL" color="info" icon={LinkIcon} iconSize={16} 
        on:click={() => {
            navigator.clipboard.writeText(post.post.ap_id)
                        
            toast({
                type: 'success',
                content: `Copied canonical post URL to clipboard.`,
                title: 'Copied'
            })
        }}
    >
        <span>Canonical URL</span>
    </MenuButton>

    <!---Local URL--->
    {#if onHomeInstance}
    <MenuButton title="Local Instance URL" color="info" icon={LinkIcon} iconSize={16} 
        on:click={() => {
            navigator.clipboard.writeText(`https://${$instance}/post/${post.post.id}`)
                        
            toast({
                type: 'success',
                content: `Copied local post URL to clipboard.`,
                title: 'Copied'
            })
        }}
    >
        <span>Local URL</span>
    </MenuButton>
    {/if}

    <!---Tesseract URL--->
    {#if onHomeInstance}
    <MenuButton title="Tessseract URL" color="info" icon={CubeTransparent} iconSize={16} 
        on:click={() => {
            navigator.clipboard.writeText(`${$page.url.origin}/post/${$instance}/${post.post.id}`)
                        
            toast({
                type: 'success',
                content: `Copied Tesseract post URL to clipboard.`,
                title: 'Copied'
            })
        }}
    >
        <span>Tesseract URL</span>
    </MenuButton>
    {/if}

    <!---Lemmyverse URL--->
    <MenuButton title="Lemmyverse URL" color="info" icon={LinkIcon} iconSize={16} 
        on:click={() => {
            navigator.clipboard.writeText(`https://lemmyverse.link/${new URL(post.post.ap_id).hostname}/post/${post.post.ap_id.split('/post/')[1]}`)
                        
            toast({
                type: 'success',
                content: `Copied Lemmyverse post URL to clipboard.`,
                title: 'Copied'
            })
        }}
    >
        <span>Lemmyverse URL</span>
    </MenuButton>

    <!---Threadiverse URL--->
    <MenuButton title="Threadiverse URL" color="info" icon={LinkIcon} iconSize={16} 
        on:click={() => {
            navigator.clipboard.writeText(`https://threadiverse.link/${new URL(post.post.ap_id).hostname}/post/${post.post.ap_id.split('/post/')[1]}`)
                        
            toast({
                type: 'success',
                content: `Copied Threadiverse post URL to clipboard.`,
                title: 'Copied'
            })
        }}
    >
        <span>Threadiverse URL</span>
    </MenuButton>

    <!---LemShare URL--->
    <MenuButton title="LemShare URL" color="info" icon={LinkIcon} iconSize={16} 
        on:click={() => {
            // https://lemsha.re/lemmy.world/post/28259962
            navigator.clipboard.writeText(`https://lemsha.re/${new URL(post.post.ap_id).hostname}/post/${post.post.ap_id.split('/post/')[1]}`)
                        
            toast({
                type: 'success',
                content: `Copied LemShare post URL to clipboard.`,
                title: 'Copied'
            })
        }}
    >
        <span>LemShare URL</span>
    </MenuButton>

    


    
</Menu>