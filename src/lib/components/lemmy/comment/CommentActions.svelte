<script lang="ts">
    import type { CommentView } from 'lemmy-js-client'
    
    import {
        amMod,
        debugModal,
        federationStateModal, 
        fediseerModal,
        isAdmin,
        postModerationModal,
        report,
    } from '$lib/components/lemmy/moderation/moderation.js'

    import { blockUser, isBlocked } from '$lib/lemmy/user'
    import { createEventDispatcher } from 'svelte'
    import { deleteItem, save } from '$lib/lemmy/contentview.js'
    import { goto } from '$app/navigation'
    import { instance } from '$lib/instance'
    import { isCommentMutable } from '$lib/components/lemmy/post/helpers.js'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings.js'
    
    import Button from '$lib/components/input/Button.svelte'
    import CommentVote from '$lib/components/lemmy/comment/CommentVote.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'

    import {
        ArrowUturnLeft,
        Bookmark,
        BookmarkSlash,
        BugAnt,
        ChatBubbleOvalLeft,
        EllipsisHorizontal,
        Eye,
        Flag,
        GlobeAlt,
        Home,
        Icon,
        MagnifyingGlass,
        NoSymbol,
        PencilSquare,
        Server,
        ShieldCheck,
        Square2Stack,
        Trash,
    } from 'svelte-hero-icons'
    

    export let comment: CommentView
    export let replying: boolean = false
    export let actions: boolean = true

    let onHomeInstance: boolean = true
    $: onHomeInstance = ($page.params.instance ?? $instance)  == $instance

    const dispatcher = createEventDispatcher<{ edit: CommentView }>()

</script>

      
<div class="flex {$userSettings.uiState.reverseActionBar ? 'flex-row-reverse' : 'flex-row'} gap-2 items-center mt-1 h-8 w-full">
    <!---Comment Vote Buttons--->
    <CommentVote bind:comment />
    
    <!---Comment Reply Button--->
    {#if actions}
        <Button size="sm" color="tertiary-border"
            disabled={comment.post.locked || comment.post.removed || comment.post.deleted || !$profile?.user || !onHomeInstance} hidden={comment.post.locked || !$profile?.user}
            on:click={() => (replying = !replying)}
        >
            <Icon src={ArrowUturnLeft} width={14} height={14} mini />
            <span class="text-xs">Reply</span>
        </Button>
        
        <!---Spacer to put the rest of the buttons at the right --->
        <div class="ml-auto" />
        
       

        <!--- Comment Moderation Menu--->
        {#if onHomeInstance && $profile?.user && (amMod($profile?.user, comment.community) || isAdmin($profile.user))}
            <Button color="tertiary" size="square-md" title="Moderation" icon={ShieldCheck} iconSize={14} on:click={() => postModerationModal(comment) } />    
        {/if}
  
        <!---Comment Action Menu --->
        <Menu  alignment="{$userSettings.uiState.reverseActionBar ? 'top-left' :  'top-right'}">
            <Button
                slot="button"
                on:click={toggleOpen}
                aria-label="Comment actions"
                color="tertiary"
                size="square-md"
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
            
            <!---Actions for Self-Owned Comments--->
            {#if onHomeInstance && comment.creator.id == $profile?.user?.local_user_view.person.id}
                <!--- Edit Comment--->
                <MenuButton color="info" on:click={() => dispatcher('edit', comment)}>
                    <Icon src={PencilSquare} mini size="16" />
                    <span>Edit</span>
                </MenuButton>

                <!---Delete Comment--->
                <MenuButton color="dangerSecondary"
                    on:click={async () => {
                        if ($profile?.jwt)
                        comment.comment.deleted = await deleteItem(
                            comment,
                            !comment.comment.deleted,
                        )
                    }}
                >
                    <Icon src={Trash} mini size="16" />
                    <span>{comment.comment.deleted ? 'Restore' : 'Delete'}</span>
                </MenuButton>
            {/if}
            
            <!--- Share Comment / Copy URL to Clipboard--->
            <MenuButton color="success"
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

            <!--- Fetch Comment on Home Instance--->
            {#if $instance != new URL(comment.comment.ap_id).hostname}
            <MenuButton title="Fetch Comment on Home Instance" color="info"
                on:click={() => {
                    const commentURL = new URL(comment.comment.ap_id)
                    const homeInstance = commentURL.hostname
                    const path = commentURL.pathname.split('/')
                    const homeCommentID = path[2]
                    goto(`/comment/${homeInstance}/${homeCommentID}`)
                }}
            >
                <Icon src={Home} width={16} mini />
                    Fetch Comment on Home Instance
            </MenuButton>
            {/if}


            {#if onHomeInstance && $profile?.jwt}
            
                <!--- Save Comment--->
                <MenuButton color="warning"
                    on:click={async () => {
                        if ($profile?.jwt) {
                            comment.saved = await save(comment, !comment.saved)
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
           
                
                {#if $profile?.user?.local_user_view.person.id != comment.creator.id}
                    <!---Report Comment--->    
                    <MenuButton on:click={() => report(comment)} color="dangerSecondary" disabled={comment.comment.removed}>
                        <Icon src={Flag} mini size="16" />
                        <span>Report</span>
                    </MenuButton>

                    <!---Block User--->
                    <MenuButton on:click={() => blockUser(comment.creator.id)} color="dangerSecondary" title="{isBlocked($profile?.user, comment.creator.id) ? 'Unblock' : 'Block'} {comment.creator.display_name || comment.creator.name}">
                        <Icon src={NoSymbol} width={16} mini />
                        {isBlocked($profile?.user, comment.creator.id) 
                            ? `Unblock ${comment.creator.display_name || comment.creator.name}`
                            : `Block ${comment.creator.display_name || comment.creator.name}`
                        }
                    </MenuButton>
                {/if}

                <!---Debug Info Button--->
                {#if $userSettings.debugInfo}
                    <MenuButton color="info" title="Debug Info" on:click={() => debugModal(comment) } >
                        <Icon src={BugAnt} mini  width={16} />
                        Debug Info...
                    </MenuButton>
                {/if}
            {/if}
            
            <!---Actions for the commentor's Instance if it is different from the current profile's--->
            {#if new URL(comment.creator.actor_id).hostname != $profile?.instance}
                <hr class="w-[90%] mx-auto opacity-100 dark:opacity-10 my-2" />
                <li class="mx-4 text-xs opacity-80 text-left my-1 py-1">{new URL(comment.creator.actor_id).hostname}</li>
                
                <!---Browse Communities--->
                <MenuButton
                    link color="success"
                    href="/communities/{new URL(comment.creator.actor_id).hostname}/?type=Local"
                    title="Browse communities at {new URL(comment.creator.actor_id).hostname}"
                >
                    <Icon src={GlobeAlt} width={16} mini />
                    <span>Browse Communities</span>
                </MenuButton>

                <!---Fediseer--->
                <MenuButton color="info" title="Get Fediseer info for {new URL(comment.creator.actor_id).hostname}"
                    on:click={async (e) => {fediseerModal(new URL(comment.creator.actor_id).hostname)}}
                >
                    <Icon src={Eye} width={16} mini />
                    <span>Fediseer</span>
                </MenuButton>
                
                <!--Federation Stats --->
                <MenuButton color="info" title="Federation Stats for {new URL(comment.creator.actor_id).hostname}"
                    on:click={async (e) => {federationStateModal(new URL(comment.creator.actor_id).hostname)}}
                >
                    <Icon src={Server} width={16} mini />
                    <span>Federation Stats</span>
                </MenuButton>
            {/if}

            
        </Menu>
    {/if}
</div>
