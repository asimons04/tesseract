<script lang="ts">
    
    import type {
        CommentView,
    } from 'lemmy-js-client'
    import { amMod, isAdmin } from './moderation'
    import { getClient } from '$lib/lemmy'
    import { isCommentView } from '$lib/lemmy/item.js'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings'

    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import BanCommunityModal from '$lib/components/lemmy/moderation/BanCommunityModal.svelte'
    import BanInstanceModal from '$lib/components/lemmy/moderation/BanInstanceModal.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import RemoveModal from './RemoveModal.svelte'
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

    let removing = false
    let banningInstance = false
    let banningCommunity = false
    let purging = false

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

<RemoveModal bind:open={removing} bind:item bind:purge={purging} reason='' />
<BanInstanceModal bind:open={banningInstance} bind:banned={item.creator.banned} bind:user={item.creator} />
<BanCommunityModal bind:open={banningCommunity} bind:banned={item.creator_banned_from_community} bind:user={item.creator} bind:community={item.community}/>

<Menu alignment="{$userSettings.uiState.reverseActionBar ? 'top-left' :  'top-right'}" >
    <Button on:click={toggleOpen} slot="button" color="tertiary-border" size="square-sm" let:toggleOpen {...$$restProps}>
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
        <MenuButton color={item.comment.removed ? 'success' : 'dangerSecondary'} on:click={() => {
                purging = false
                removing=true
            }}
        >
            <Icon src={Trash} size="16" mini />
                {item.comment.removed ? 'Restore Comment' : 'Remove Comment'}
        </MenuButton>
    
        <!--- Ban User--->
        {#if $profile?.user && $profile.user?.local_user_view.person.id != item.creator.id}
            <MenuButton
                color={item.creator_banned_from_community ? 'success' : 'dangerSecondary'}
                on:click={() => { banningCommunity = true }}
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
        <MenuButton color="dangerSecondary" on:click={() => {
                purging = true
                removing = true
            }}
        >
            <Icon src={Fire} size="16" mini slot="icon" />
            Purge Comment
        </MenuButton>

        <!--Hide ban button if viewing own profile--->
        {#if item.creator.id != $profile.user.local_user_view.person.id}
            <MenuButton
                color={item.creator.banned ? 'success' : 'dangerSecondary'}
                on:click={() => { banningInstance = true }}
            >
                <Icon slot="icon" mini size="16" src={ShieldExclamation} />
                {item.creator.banned ? 'Unban from Instance' : 'Ban from Instance'}
            </MenuButton>
    {   /if}
    {/if}
</Menu>
