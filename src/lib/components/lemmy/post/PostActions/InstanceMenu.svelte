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
        Icon,
        GlobeAlt,
        Server,
        NoSymbol,
        Eye
    } from 'svelte-hero-icons'

    export let post:PostView
    export let onHomeInstance: boolean  = false


    let blockingInstance = false;
    async function doBlockInstance(instance_id:number, hostname:string, confirm:boolean=false):Promise<void> {
        if (!confirm) {
            toast({
                type: 'warning',
                title: 'Confirm',
                content: `Are you sure you want to block ${hostname}?`,
                action: () => doBlockInstance(instance_id, hostname, true)
            })
            return
        }
        
        blockingInstance = true
        let pleaseWaitToast = toast({
            type: 'warning',
            title: 'Please wait...',
            content: `Please wait while ${hostname} is added to your blocklist.`
        })
        
        await getClient().blockInstance({
            instance_id: instance_id,
            block: true
        })
        await refreshProfile()
        blockingInstance = false
        
        
        // Dispatch window event which will hide the posts via PostFeed component
        post.creator_blocked = true
        dispatchWindowEvent('blockInstance', { 
            instance_id: instance_id,
            blocked: true
        })

        removeToast(pleaseWaitToast)
        toast({
            type: 'success',
            title: "Success",
            content: `Successfully blocked ${hostname}`
        })
    }
</script>



<!---Explore Menu--->
<Menu alignment="bottom-right" containerClass="overflow-auto">
    <Button slot="button" aria-label="Explore" let:toggleOpen on:click={toggleOpen} size="square-md" title="Instances" color="tertiary">
        <Icon slot="icon" src={Server} width={16} mini />
    </Button>
    
    <!---Actions for the instance the post was submitted to--->
    <li class="mx-4 text-xs opacity-80 text-left my-1 py-1">{new URL(post.community.actor_id).hostname}</li>
    
    <MenuButton title="Fediseer Info" color="info" on:click={async (e) => fediseerModal(new URL(post.community.actor_id).hostname)} >
            <Icon src={Eye} width={16} mini />
            <span>Fediseer</span>
    </MenuButton>

    {#if new URL(post.community.actor_id).hostname != $profile?.instance}
    <MenuButton title="Federation Stats for {new URL(post.community.actor_id).hostname}" color="info" 
        on:click={() => federationStateModal(new URL(post.community.actor_id).hostname) }
    >
        <Icon src={Server} width={16} mini />
        <span>Federatation Stats</span>
    </MenuButton>
    {/if}



    <MenuButton link href="/communities/{new URL(post.community.actor_id).hostname}/?type=Local" 
        title="Browse communities at {new URL(post.community.actor_id).hostname}" color="success"
    >
        <Icon src={GlobeAlt} width={16} mini />
        <span>Browse Communities</span>
    </MenuButton>

    <!--- Block Instance of Post's Community (0.19+)--->
    {#if onHomeInstance && $profile?.jwt && new URL(post.community.actor_id).hostname != $profile?.instance}
        <MenuButton color="dangerSecondary"loading={blockingInstance} disabled={blockingInstance}
            on:click={async () => {doBlockInstance(post.community.instance_id, new URL(post.community.actor_id).hostname) }}
        >
            <Icon src={NoSymbol} width={16} mini />
            Block Instance
        </MenuButton>
    {/if}

    <!---Browse communities / fediseer of the post creator if different from community's home instance-->
    {#if new URL(post.creator.actor_id).hostname != new URL(post.community.actor_id).hostname}
        
        <hr class="w-[90%] mx-auto opacity-100 dark:opacity-10 my-2" />
        <li class="mx-4 text-xs opacity-80 text-left my-1 py-1">{(new URL(post.creator.actor_id).hostname)}</li>    
        
        <MenuButton title="Fediseer Info" color="info"
            on:click={async (e) => fediseerModal(new URL(post.creator.actor_id).hostname)}
        >
                <Icon src={Eye} width={16} mini />
                <span>Fediseer</span>
        </MenuButton>

        {#if new URL(post.creator.actor_id).hostname != $profile?.instance}
        <MenuButton title="Federation Stats for {new URL(post.creator.actor_id).hostname}" color="info" 
            on:click={() => federationStateModal(new URL(post.creator.actor_id).hostname) }
        >
            <Icon src={Server} width={16} mini />
            <span>Federation Stats</span>
        </MenuButton>
        {/if}

        <MenuButton link href="/communities/{new URL(post.creator.actor_id).hostname}/?type=Local" 
            title="Browse communities at {new URL(post.creator.actor_id).hostname}" color="success"
        >
            <Icon src={GlobeAlt} width={16} mini />
            <span>Browse Communities</span>
        </MenuButton>
    {/if}

    <!--- Block Instance of Post's Creator (0.19+ only)--->
    {#if onHomeInstance && $profile?.jwt && new URL(post.creator.actor_id).hostname != $profile?.instance && post.community.instance_id != post.creator.instance_id}
        <MenuButton color="dangerSecondary" loading={blockingInstance} disabled={blockingInstance}
            on:click={async () => { doBlockInstance(post.creator.instance_id, new URL(post.creator.actor_id).hostname) }}
        >
            <Icon src={NoSymbol} width={16} mini />
            Block Instance
        </MenuButton>
    {/if}
    
</Menu>