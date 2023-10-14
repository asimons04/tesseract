<script lang="ts">
    import { getClient } from '$lib/lemmy'
    import type {
        CommentView,
        Community,
        CommunityView,
        PostView,
    } from 'lemmy-js-client'
    
    import { amMod, ban, isAdmin, remove } from './moderation'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import { Fire, Icon, ShieldExclamation, Trash } from 'svelte-hero-icons'
    import { Color } from '$lib/ui/colors.js'
    import { isCommentView } from '$lib/lemmy/item.js'
    import { profile } from '$lib/auth.js'
    import ShieldIcon from '$lib/components/lemmy/moderation/ShieldIcon.svelte'

    export let item: PostView | CommentView
  </script>

<Menu alignment="top-right" class="top-0 h-[26px] w-[26px] ">
    <Button
        class="w-[26px] h-[26px] hover:!text-green-500 dark:text-zinc-400 text-slate-600"
        size="square-md"
        on:click={toggleOpen}
        slot="button"
        color="tertiary"
        let:toggleOpen
        {...$$restProps}
    >
        <ShieldIcon filled width={14} />
    </Button>

    {#if ($profile?.user && amMod($profile.user, item.community)) || ($profile?.user && isAdmin($profile.user))}
        <li class="px-4 py-1 my-1 text-xs text-slate-600 dark:text-zinc-400">
            Moderation
        </li>
        
        <!---Remove/Restore Post--->
        <MenuButton color={item.comment.removed ? 'success' : 'dangerSecondary'} on:click={() => remove(item)}>
            <Icon src={Trash} size="16" mini />
            {#if isCommentView(item)}
                {item.comment.removed ? 'Restore Comment' : 'Remove Comment'}
            {:else}
                {item.post.removed ? 'Restore Comment' : 'Remove Comment'}
            {/if}
        </MenuButton>
    
        <!--- Ban User--->
        {#if $profile?.user && $profile.user?.local_user_view.person.id != item.creator.id}
            <MenuButton
                color={item.creator_banned_from_community ? 'success' : 'dangerSecondary'}
                on:click={() =>
                    ban(item.creator_banned_from_community, item.creator, item.community)
                }
            >
                <Icon src={ShieldExclamation} size="16" mini />
                {item.creator_banned_from_community
                    ? 'Unban from Community'
                    : 'Ban from Community'
                }
            </MenuButton>
        {/if}
    {/if}

    {#if $profile?.user && isAdmin($profile.user)}
        <MenuButton color="dangerSecondary" on:click={() => remove(item, true)}>
            <Icon src={Fire} size="16" mini slot="icon" />
            Purge Comment
        </MenuButton>

        <!--Hide ban button if viewing own profile--->
        {#if item.creator.id != $profile.user.local_user_view.person.id}
            <MenuButton
                color={item.creator.banned ? 'success' : 'dangerSecondary'}
                on:click={() =>
                    ban(item.creator.banned, item.creator)
                }
            >
                <Icon slot="icon" mini size="16" src={ShieldExclamation} />
                {item.creator.banned ? 'Unban from Instance' : 'Ban from Instance'}
            </MenuButton>
    {   /if}
    {/if}
</Menu>
