<script lang="ts">
    
    import type {
        CommentView,
        Community,
        CommunityView,
        PostView,
    } from 'lemmy-js-client'
    import { amMod, ban, isAdmin, remove } from './moderation'
    import { Color } from '$lib/ui/colors.js'
    import { getClient } from '$lib/lemmy'
    import { isCommentView } from '$lib/lemmy/item.js'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import ShieldIcon from '$lib/components/lemmy/moderation/ShieldIcon.svelte'

    import { 
        Fire, 
        Icon, 
        Newspaper,
        ShieldExclamation, 
        Sparkles, 
        Trash 
    } from 'svelte-hero-icons'

    export let item: CommentView


    const distinguish = async function(comment:CommentView) {
        let distinguished: boolean = comment.comment.distinguished;
        if (!$profile?.jwt) return

        try {
            await getClient(undefined, fetch).distinguishComment({
                auth: $profile?.jwt,
                comment_id: comment.comment.id,
                distinguished: !distinguished
            });
            
            item.comment.distinguished = !distinguished;
            toast({
                    type: 'success',
                    content: `${item.comment.distinguished ? 'Distinguished' : 'Un-distinguished'} this comment.`,
                })
        }
        catch (err:any){
            toast({
                    type: 'error',
                    content: `Unable to distinguish comment: ${JSON.stringify(err)}`,
                })
        }
    }
  </script>

<Menu alignment="top-right" >
    <Button
        on:click={toggleOpen}
        slot="button"
        color="tertiary-border"
        size="square-sm"
        let:toggleOpen
        {...$$restProps}
    >
        <ShieldIcon filled width={14} />
    </Button>

    {#if ($profile?.user && amMod($profile.user, item.community)) || ($profile?.user && isAdmin($profile.user))}
        <li class="flex flex-row items-center text-xs font-bold opacity-100 text-left mx-4 my-1 py-1 min-w-48">
            Moderation
            <span class="ml-auto" />
            <ShieldIcon filled width={14} />
        </li>
        <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />
        
        <!--- Distinguish Comment --->
        <MenuButton  on:click={async () => distinguish(item)}>
            <Icon src={Sparkles} size="16" mini />
            {#if isCommentView(item)}
                {item.comment.distinguished ? 'Un-Distinguish' : 'Distinguish'}
            {/if}
        </MenuButton>

        <!--- User Modlog--->
        <MenuButton link
            href="/modlog?other_person_id={item.creator.id}"
            title="Modlog for {item.creator.display_name ?? item.creator.name}@{new URL(item.creator.actor_id).hostname}"
        >
            <Icon src={Newspaper} mini size="16" />
            User Modlog
        </MenuButton>

        <!---Remove/Restore Comment--->
        <MenuButton color={item.comment.removed ? 'success' : 'dangerSecondary'} on:click={() => remove(item)}>
            <Icon src={Trash} size="16" mini />
                {item.comment.removed ? 'Restore Comment' : 'Remove Comment'}
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
