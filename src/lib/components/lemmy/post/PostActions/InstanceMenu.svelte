<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    
    import { blockInstance, site } from '$lib/lemmy'
    import { removeToast, toast } from '$lib/components/ui/toasts/toasts'
    import { profile } from '$lib/auth'
    import { userSettings } from '$lib/settings'

    import Button from '$lib/components/input/Button.svelte'
    import Fediseer from '$lib/fediseer/Fediseer.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'

    import {
        Icon,
        GlobeAlt,
        Server,
        NoSymbol,
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

    
    let blockingInstance = false;
    async function doBlockInstance(instance_id:number, hostname:string):Promise<void> {
        blockingInstance = true
        let pleaseWaitToast = toast({
            type: 'warning',
            title: 'Please wait...',
            content: `Please wait while ${hostname} is added to your blocklist.`
        })
        await blockInstance(instance_id, true)
        blockingInstance = false
        
        // Hack to remove the post from the DOM since there's no instance block / hide option available
        post.creator_blocked = true

        removeToast(pleaseWaitToast)
        toast({
            type: 'success',
            title: "Success",
            content: `Successfully blocked ${hostname}`
        })
    }
</script>

<!---Note: Needs to be inside if block so it is mounted/destroyed on each invocation--->
{#if fediseer.modal}
    <Fediseer bind:open={fediseer.modal} instance={fediseer.instance} />
{/if}

<!---Explore Menu--->
<Menu alignment="{$userSettings.uiState.reverseActionBar ? 'top-left' :  'top-right'}" containerClass="overflow-auto">
    <Button slot="button" aria-label="Explore" let:toggleOpen on:click={toggleOpen} size="square-md" title="Instances" color="tertiary-border">
        <Icon slot="icon" src={Server} width={16} mini />
    </Button>
        
    <li class="flex flex-row items-center text-xs font-bold opacity-100 text-left mx-4 my-1 py-1">
        Instances
        <span class="ml-auto" />
        <Icon slot="icon" src={Server} width={16} mini />
    </li>
    <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />
    
    <!---Actions for the instance the post was submitted to--->
    <li class="mx-4 text-xs opacity-80 text-left my-1 py-1">{new URL(post.community.actor_id).hostname}</li>
    
    <MenuButton title="Fediseer Info" on:click={async (e) => openFediseerModal(new URL(post.community.actor_id).hostname)} >
            <Icon src={Eye} width={16} mini />
            <span>Fediseer</span>
    </MenuButton>

    <MenuButton link href="/communities?instance={new URL(post.community.actor_id).hostname}" title="Browse communities at {new URL(post.community.actor_id).hostname}" >
        <Icon src={GlobeAlt} width={16} mini />
        <span>Communities @ {new URL(post.community.actor_id).hostname}</span>
    </MenuButton>

    <!--- Block Instance of Post's Community (0.19+)--->
    {#if $profile?.jwt && $site?.version.startsWith('0.19') && new URL(post.community.actor_id).hostname != $profile?.instance}
        <MenuButton loading={blockingInstance} disabled={blockingInstance}
            on:click={async () => {doBlockInstance(post.community.instance_id, new URL(post.community.actor_id).hostname) }}
        >
            <Icon src={NoSymbol} width={16} mini />
            Block Instance: {new URL(post.community.actor_id).hostname}
        </MenuButton>
    {/if}

    <!---Browse communities / fediseer of the post creator if different from community's home instance-->
    {#if new URL(post.creator.actor_id).hostname != new URL(post.community.actor_id).hostname}
        
        <hr class="w-[90%] mx-auto opacity-100 dark:opacity-10 my-2" />
        <li class="mx-4 text-xs opacity-80 text-left my-1 py-1">{(new URL(post.creator.actor_id).hostname)}</li>    
        
        <MenuButton title="Fediseer Info" on:click={async (e) => openFediseerModal(new URL(post.creator.actor_id).hostname)}>
                <Icon src={Eye} width={16} mini />
                <span>Fediseer</span>
        </MenuButton>

        <MenuButton link href="/communities?instance={new URL(post.creator.actor_id).hostname}" title="Browse communities at {new URL(post.creator.actor_id).hostname}">
            <Icon src={GlobeAlt} width={16} mini />
            <span>Communities @ {new URL(post.creator.actor_id).hostname}</span>
        </MenuButton>
    {/if}

    <!--- Block Instance of Post's Creator (0.19+ only)--->
    {#if $profile?.jwt && $site?.version.startsWith('0.19') && new URL(post.creator.actor_id).hostname != $profile?.instance && post.community.instance_id != post.creator.instance_id}
        <MenuButton loading={blockingInstance} disabled={blockingInstance}
            on:click={async () => { doBlockInstance(post.creator.instance_id, new URL(post.creator.actor_id).hostname) }}
        >
            <Icon src={NoSymbol} width={16} mini />
            Block Instance: {new URL(post.creator.actor_id).hostname}
        </MenuButton>
    {/if}
    
</Menu>