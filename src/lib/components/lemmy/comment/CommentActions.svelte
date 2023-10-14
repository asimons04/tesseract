<script lang="ts">
    import type { CommentView } from 'lemmy-js-client'
    
    import {
        amMod,
        isAdmin,
        report,
    } from '$lib/components/lemmy/moderation/moderation.js'
    
    import { createEventDispatcher } from 'svelte'
    import { getFediseerInfo } from '$lib/fediseer/client.js'
    import { deleteItem, save } from '$lib/lemmy/contentview.js'
    import { isCommentMutable } from '$lib/components/lemmy/post/helpers.js'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings.js'

    //import { Color } from '$lib/ui/colors.js'
    //import { getClient, getInstance } from '$lib/lemmy.js'
    //import { page } from '$app/stores'
    //import { userSettings } from '$lib/settings.js'
    
    
    import Button from '$lib/components/input/Button.svelte'
    import CommentVote from '$lib/components/lemmy/comment/CommentVote.svelte'
    import Fediseer from '$lib/fediseer/Fediseer.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    //import ModerationMenu from '$lib/components/lemmy/moderation/ModerationMenu.svelte'
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
        PencilSquare,
        Square2Stack,
        Trash,
    } from 'svelte-hero-icons'

    export let comment: CommentView
    export let replying: boolean = false
    export let debug: boolean = false

    const dispatcher = createEventDispatcher<{ edit: CommentView }>()

    let fediseer = {
        loading: false,
        modal: false,
        data: undefined
    }
</script>

<Fediseer bind:open={fediseer.modal} data={fediseer.data} />
        
<div class="flex flex-row gap-2 items-center mt-1 h-7 w-full">
    <!---Comment Vote Buttons--->
    <CommentVote
        bind:score={comment.counts.score}
        bind:vote={comment.my_vote}
        commentId={comment.comment.id}
    />
    
    <!---Comment Reply Button--->
    <Button
        size="sm"
        color="tertiary"
        on:click={() => (replying = !replying)}
        disabled={comment.post.locked}
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

        <Button on:click={() => (debug = true)} size="sm" color="tertiary" title="Debug Info">
            <Icon src={BugAnt} mini  width={14} height={14} slot="icon" />
        </Button>
    {/if}

    <!--- Comment Moderation Menu--->
    {#if $profile?.user && (amMod($profile?.user, comment.community) || isAdmin($profile.user))}
        <CommentModerationMenu bind:item={comment} />
    {/if}
  
    <!---Comment Action Menu --->
    <Menu class="top-0 leading-3" alignment="top-right">
        <Button
            slot="button"
            on:click={toggleOpen}
            class="!p-1"
            aria-label="Comment actions"
            color="tertiary"
            let:toggleOpen
        >
            <Icon src={EllipsisHorizontal} width={16} height={16} mini slot="icon" />
        </Button>
        
        <span class="text-xs opacity-80 py-1 my-1 px-4">Comment actions</span>
        <MenuButton
            on:click={() => {
                navigator.share?.({
                    url: comment.comment.ap_id,
                }) ?? navigator.clipboard.writeText(comment.comment.ap_id)
                toast({
                    type: 'success',
                    content: `Copied comment URL to clipboard!`,
                })
            }}
        >
            <Icon src={Square2Stack} mini size="16" />
            <span>Copy Link</span>
        </MenuButton>

        {#if $profile?.jwt}
            {#if comment.creator.id == $profile.user?.local_user_view.person.id}
            <MenuButton on:click={() => dispatcher('edit', comment)}>
                <Icon src={PencilSquare} mini size="16" />
                <span>Edit</span>
            </MenuButton>
            {/if}
        
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
        
            {#if $profile.jwt && $profile.user?.local_user_view.person.id != comment.creator.id}
            <MenuButton on:click={() => report(comment)} color="dangerSecondary">
                <Icon src={Flag} mini size="16" />
                <span>Report</span>
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


        <MenuButton loading={fediseer.loading} disabled={fediseer.loading}>
            <span 
                class="flex flex-row gap-2 items-center w-full text-sm"
                title="Get Fediseer info for  {new URL(comment.creator.actor_id).hostname}"
                on:click={async (e) => {
                    e.stopPropagation();
                    fediseer.loading = true;
                    fediseer.data = await getFediseerInfo(new URL(comment.creator.actor_id).hostname);
                    fediseer.loading = false;
                    fediseer.modal = true;
                    //@ts-ignore -- Once loaded, pass click event to menu button to close it.
                    e.target?.parentElement?.dispatchEvent(e);
                }}
            >
                <span class:hidden={fediseer.loading}>    
                    <Icon src={Eye} width={16} mini />
                </span>
                <span>Fediseer</span>
            </span>
        </MenuButton>
    </Menu>
</div>
