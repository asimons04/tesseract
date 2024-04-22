<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import { userSettings } from '$lib/settings'

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
<Menu alignment="{$userSettings.uiState.reverseActionBar ? 'top-left' :  'top-right'}" containerClass="overflow-auto">
    <Button
        slot="button"
        aria-label="Explore"
        let:toggleOpen
        on:click={toggleOpen}
        
        size="square-md"
        title="Explore"
        color="tertiary-border"
    >
        <Icon slot="icon" src={Map} width={16} mini />
    </Button>
        
    <li class="flex flex-row items-center text-xs font-bold opacity-100 text-left mx-4 my-1 py-1">
        Explore
        <span class="ml-auto" />
        <Icon slot="icon" src={Map} width={16} mini />
    </li>
    <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />
    
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
        <button  class="flex flex-row gap-2 items-center w-full text-sm"
            title="Get Fediseer info for  {new URL(post.community.actor_id).hostname}"
            on:click={async (e) => openFediseerModal(new URL(post.community.actor_id).hostname) }
        >
            <Icon src={Eye} width={16} mini />
            <span>Fediseer</span>
    </button>
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
            <button 
                class="flex flex-row gap-2 items-center w-full text-sm"
                title="Get Fediseer info for  {new URL(post.creator.actor_id).hostname}"
                on:click={async (e) => openFediseerModal(new URL(post.creator.actor_id).hostname)}
            >
                <Icon src={Eye} width={16} mini />
                <span>Fediseer</span>
        </button>
        </MenuButton>
    {/if}

</Menu>