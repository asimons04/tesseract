<script lang="ts">
    import { amModOfAny,isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
    import { getGroupIndex, sortGroups } from '$lib/favorites'
    import { profile } from '$lib/auth'

    
    import Button from '$lib/components/input/Button.svelte'
    import CommunityList from '$lib/components/ui/sidebar/CommunityList.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    
    import {
        Icon,
        Star,
    } from 'svelte-hero-icons'

    export let size:number = 28

</script>

{#if $profile && $profile.user}
<Menu alignment="bottom-center" containerClass="!max-w-fit overflow-y-auto">
    <Button
        color="tertiary"
        slot="button"
        aria-label="Favorites"
        title="Favorites"
        let:toggleOpen
        on:click={toggleOpen}
        class="max-md:w-9 max-md:h-8 max-md:!p-0"
    >
        <Icon src={Star} width={size} mini slot="icon" />
    </Button>
    
    <li class="text-xs font-bold opacity-80 text-left mx-4 my-1 py-1 w-48">Favorites</li>
    
    {#if $profile?.groups}
        <div class="flex flex-col gap-1 h-full overflow-y-auto">
            {#if $profile?.groups[getGroupIndex('Favorites')]?.communities?.length > 0}
                <CommunityList 
                    expanded={true}  hidden={false} group='Favorites'
                    items={$profile?.groups[getGroupIndex('Favorites')]?.communities}
                    menu={false}
                />
            {:else}
                No favorites
            {/if}
        </div>
    {/if}

</Menu>
{/if}