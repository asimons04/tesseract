<script lang="ts">
    import { isAdmin } from '$lib/components/lemmy/moderation/moderation'
    import { profile } from '$lib/auth'
    import { site } from '$lib/lemmy'

    import Button from '$lib/components/input/Button.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'

    import {
        Icon,
        Newspaper,
        PencilSquare,
        Plus
    } from 'svelte-hero-icons'

    export let size:number = 28
</script>

{#if $profile?.jwt}
<Menu alignment="bottom-right">
    <Button
        color="tertiary"
        slot="button"
        aria-label="Create"
        title="Create"
        let:toggleOpen
        on:click={toggleOpen}
        class="max-md:w-9 max-md:h-8 max-md:!p-0"
    >
        <Icon src={Plus} width={size} mini slot="icon" />
    </Button>

    <li class="text-xs font-bold opacity-80 text-left mx-4 my-1 py-1 w-48">Create</li>
    <MenuButton
        link
        href="/create/post"
        disabled={$profile?.jwt == undefined}
    >
        <Icon src={PencilSquare} mini width={16} />
        Post
    </MenuButton>

    <MenuButton
        link
        href="/create/community"
        disabled={
            !$profile?.jwt ||
            !$profile?.user ||
            ($site?.site_view.local_site.community_creation_admin_only && !isAdmin($profile.user))
        }
    >
        <Icon src={Newspaper} mini width={16} />
        Community
    </MenuButton>
</Menu>
{/if}