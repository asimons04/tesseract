<script lang="ts">
    import type { CommentView } from 'lemmy-js-client'
    
    import {
        amMod,
        isAdmin,
        report,
    } from '$lib/components/lemmy/moderation/moderation.js'
    
    import { blockUser, isBlocked } from '$lib/lemmy/user'
    import { createEventDispatcher } from 'svelte'
    import { getFediseerInfo } from '$lib/fediseer/client.js'
    import { deleteItem, save } from '$lib/lemmy/contentview.js'
    import { instance } from '$lib/instance'
    import { isCommentMutable } from '$lib/components/lemmy/post/helpers.js'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings.js'

    
    
    import Button from '$lib/components/input/Button.svelte'
    import CommentVote from '$lib/components/lemmy/comment/CommentVote.svelte'
    import Fediseer from '$lib/fediseer/Fediseer.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import CommentModerationMenu from '$lib/components/lemmy/moderation/CommentModerationMenu.svelte'

    import {
        ArrowLeftCircle,
        ArrowUturnLeft,
        Bookmark,
        BookmarkSlash,
        BugAnt,
        ChatBubbleOvalLeft,
        EllipsisHorizontal,
        Eye,
        Flag,
        GlobeAlt,
        Icon,
        NoSymbol,
        PencilSquare,
        Square2Stack,
        Trash,
    } from 'svelte-hero-icons'

    export let comment: CommentView
    export let replying: boolean = false
    export let debug: boolean = false

    let onHomeInstance: boolean = true
    $: onHomeInstance = ($page.params.instance ?? $instance)  == $instance

    const dispatcher = createEventDispatcher<{ edit: CommentView }>()

    let fediseer = {
        instance: '',
        modal: false,
    }
    
    function openFediseerModal(instance:string):void {
        fediseer.instance = instance;
        fediseer.modal = true;
    }
</script>

{#if fediseer.modal}
    <Fediseer bind:open={fediseer.modal} instance={fediseer.instance} />
{/if}
      
<div class="flex {$userSettings.uiState.reverseActionBar ? 'flex-row-reverse' : 'flex-row'} gap-2 items-center mt-1 h-8 w-full">
    <!---Comment Vote Buttons--->
    <CommentVote bind:comment />
    
    <!---Comment Reply Button--->
    <Button size="sm" color="tertiary-border"
        disabled={comment.post.locked || !$profile?.user || !onHomeInstance} hidden={comment.post.locked || !$profile?.user}
        on:click={() => (replying = !replying)}
    >
        <Icon src={ArrowUturnLeft} width={14} height={14} mini />
        <span class="text-xs">Reply</span>
    </Button>
    
    <!---Spacer to put the rest of the buttons at the right --->
    <div class="ml-auto" />
    
    <!---Debug Info Button--->
    {#if $userSettings.debugInfo}
        {#if debug}
            {#await import('$lib/components/util/debug/DebugObject.svelte') then { default: DebugObject }}
                <DebugObject object={comment} bind:open={debug} />
            {/await}
        {/if}

        <Button on:click={() => (debug = true)} size="square-sm" color="tertiary-border" title="Debug Info">
            <Icon src={BugAnt} mini  width={14} height={14} slot="icon" />
        </Button>
    {/if}

    <!--- Comment Moderation Menu--->
    {#if $profile?.user && (amMod($profile?.user, comment.community) || isAdmin($profile.user))}
        <CommentModerationMenu bind:item={comment} />
    {/if}
  
    <!---Comment Action Menu --->
    <Menu  alignment="{$userSettings.uiState.reverseActionBar ? 'top-left' :  'top-right'}">
        <Button
            slot="button"
            on:click={toggleOpen}
            aria-label="Comment actions"
            color="tertiary-border"
            size="square-sm"
            let:toggleOpen
        >
            <Icon src={EllipsisHorizontal} width={16} height={16} mini slot="icon" />
        </Button>
        
        <li class="flex flex-row items-center text-xs font-bold opacity-100 text-left mx-4 my-1 py-1 min-w-48">
            Comment Actions
            <span class="ml-auto" />
            <Icon src={ChatBubbleOvalLeft} width={16} mini />
        </li>
        <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />
        
        
        <!--- Share Comment / Copy URL to Clipboard--->
        <MenuButton
            on:click={() => {
                navigator.share?.({
                    url: comment.comment.ap_id,
                }) ?? navigator.clipboard.writeText(comment.comment.ap_id)
                toast({
                    type: 'success',
                    title: "Success",
                    content: `Copied comment URL to clipboard!`,
                })
            }}
        >
            <Icon src={Square2Stack} mini size="16" />
            <span>Copy Link</span>
        </MenuButton>

        {#if $profile?.jwt}
            {#if comment.creator.id == $profile.user?.local_user_view.person.id}
            <!--- Edit Comment--->
            <MenuButton on:click={() => dispatcher('edit', comment)}>
                <Icon src={PencilSquare} mini size="16" />
                <span>Edit</span>
            </MenuButton>
            {/if}
        
            <!--- Save Comment--->
            <MenuButton
                on:click={async () => {
                    if ($profile?.jwt) {
                        comment.saved = await save(comment, !comment.saved, $profile.jwt)
                    }
                    toast({
                        type: 'success',
                        content: `${comment.saved ? 'Saved' : 'Unsaved'} Comment`,
                    })
                }}
            >
                <Icon src={comment.saved ? BookmarkSlash : Bookmark} mini size="16" />
                <span>{comment.saved ? 'Unsave' : 'Save'}</span>
            </MenuButton>

            

            {#if $profile?.user && $profile.jwt && isCommentMutable(comment, $profile.user.local_user_view)}
            <!---Delete Comment--->
            <MenuButton
                color="dangerSecondary"
                on:click={async () => {
                    if ($profile?.jwt)
                    comment.comment.deleted = await deleteItem(
                        comment,
                        !comment.comment.deleted,
                        $profile.jwt
                    )
                }}
            >
                <Icon src={Trash} mini size="16" />
                <span>{comment.comment.deleted ? 'Restore' : 'Delete'}</span>
            </MenuButton>
            {/if}
        
            {#if $profile.jwt && $profile?.user && $profile.user?.local_user_view.person.id != comment.creator.id}
            <MenuButton on:click={() => report(comment)} color="dangerSecondary">
                <Icon src={Flag} mini size="16" />
                <span>Report</span>
            </MenuButton>

            <!---Block User--->
            <MenuButton on:click={() => blockUser(comment.creator.id)} color="dangerSecondary" title="{isBlocked($profile?.user, comment.creator.id) ? 'Unblock' : 'Block'} {comment.creator.display_name || comment.creator.name}">
                <Icon src={NoSymbol} width={16} mini />
                {isBlocked($profile?.user, comment.creator.id) 
                    ? `Unblock ${comment.creator.display_name || comment.creator.name}@${new URL(comment.creator.actor_id).hostname}`
                    : `Block ${comment.creator.display_name || comment.creator.name}@${new URL(comment.creator.actor_id).hostname}`}
            </MenuButton>
            {/if}
        {/if}
        
        <hr class="w-[90%] mx-auto opacity-100 dark:opacity-10 my-2" />
        <li class="mx-4 text-xs opacity-80 text-left my-1 py-1">{new URL(comment.creator.actor_id).hostname}</li>
        <MenuButton
            link
            href="/communities/{new URL(comment.creator.actor_id).hostname}"
            title="Browse communities at {new URL(comment.creator.actor_id).hostname}"
        >
            <Icon src={GlobeAlt} width={16} mini />
            <span>Browse Communities</span>
        </MenuButton>


        <MenuButton>
            <button 
                class="flex flex-row gap-2 items-center w-full text-sm"
                title="Get Fediseer info for {new URL(comment.creator.actor_id).hostname}"
                on:click={async (e) => {openFediseerModal(new URL(comment.creator.actor_id).hostname)}}
            >
                <Icon src={Eye} width={16} mini />
                <span>Fediseer</span>
        </button>
        </MenuButton>
    </Menu>
</div>
