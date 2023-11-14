<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import { goto } from '$app/navigation'

    import Button from '$lib/components/input/Button.svelte'
    import Fediseer from '$lib/fediseer/Fediseer.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'

    import {
        Icon,
        GlobeAlt,
        Map,
        Eye
    } from 'svelte-hero-icons'


    export let post:PostView
    
    let fediseer = {
        instance: '',
        modal: false
    }
    function openFediseerModal(instance:string):void {
        fediseer.instance = instance;
        fediseer.modal = true;
    }
</script>

<!---Note: Needs to be inside if block so it is mounted/destroyed on each invocation--->
{#if fediseer.modal}
    <Fediseer bind:open={fediseer.modal} instance={fediseer.instance} />
{/if}

<!---Explore Menu--->
<Menu alignment="top-right" containerClass="overflow-auto">
    <Button
        slot="button"
        aria-label="Explore"
        let:toggleOpen
        on:click={toggleOpen}
        class="hover:text-inherit !border-none"
        size="square-md"
        title="Explore"
        color="ghost"
    >
        <Icon slot="icon" src={Map} width={16} mini />
    </Button>
        
    <li class="flex flex-row gap-1 w-full items-center ml-2 text-xs opacity-80 text-left font-bold my-1 py-1">
        <Icon slot="icon" src={Map} width={16} mini />
        Explore
    </li>
    
    <!---Actions for the instance the post was submitted to--->
    <li class="mx-4 text-xs opacity-80 text-left my-1 py-1">{new URL(post.community.actor_id).hostname}</li>
    <MenuButton
        link
        href="/communities/{new URL(post.community.actor_id).hostname}"
        title="Browse communities at {new URL(post.community.actor_id).hostname}"
    >
        <Icon src={GlobeAlt} width={16} mini />
        <span>Communities @ {new URL(post.community.actor_id).hostname}</span>
    </MenuButton>

    
    <MenuButton>
        <span 
            class="flex flex-row gap-2 items-center w-full text-sm"
            title="Get Fediseer info for  {new URL(post.community.actor_id).hostname}"
            on:click={async (e) => openFediseerModal(new URL(post.community.actor_id).hostname) }
        >
            <Icon src={Eye} width={16} mini />
            <span>Fediseer</span>
        </span>
    </MenuButton>

    <!---Browse communities / fediseer of the post creator if different from community's home instance-->
    {#if new URL(post.creator.actor_id).hostname != new URL(post.community.actor_id).hostname}
        
        <hr class="w-[90%] mx-auto opacity-100 dark:opacity-10 my-2" />
        <li class="mx-4 text-xs opacity-80 text-left my-1 py-1">{(new URL(post.creator.actor_id).hostname)}</li>    
        <MenuButton
            link
            href="/communities/{new URL(post.creator.actor_id).hostname}"
            title="Browse communities at {new URL(post.creator.actor_id).hostname}"
        >
            <Icon src={GlobeAlt} width={16} mini />
            <span>Communities @ {new URL(post.creator.actor_id).hostname}</span>
        </MenuButton>

        <MenuButton>
            <span 
                class="flex flex-row gap-2 items-center w-full text-sm"
                title="Get Fediseer info for  {new URL(post.creator.actor_id).hostname}"
                on:click={async (e) => openFediseerModal(new URL(post.creator.actor_id).hostname)}
            >
                <Icon src={Eye} width={16} mini />
                <span>Fediseer</span>
            </span>
        </MenuButton>
    {/if}

</Menu>