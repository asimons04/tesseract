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

    let selectedClass = '!text-sky-700 dark:!text-sky-500 font-bold'
</script>

{#if $profile?.jwt}
<Menu alignment="bottom-right">
    <Button
        color="tertiary"
        slot="button"
        aria-label="Create"
        title="Create"
        let:toggleOpen
        let:open
        on:click={toggleOpen}
        class="max-md:w-9 max-md:h-8 max-md:!p-0"
    >
        <Icon src={Plus} width={size} mini slot="icon" class="{open ? selectedClass : ''}" />
    </Button>

    <li class="flex flex-row items-center text-xs font-bold opacity-100 text-left px-4 py-1 min-w-48">
        Create
        <span class="ml-auto"/>
        <Icon src={Plus} width={16} mini />
    </li>
    <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />

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