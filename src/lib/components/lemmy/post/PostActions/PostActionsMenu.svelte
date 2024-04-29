<script lang="ts">
    import type { Alignment } from '$lib/components/ui/menu/menu.js'
    import type { PostView } from 'lemmy-js-client'
    
    import { amMod, isAdmin, report} from '$lib/components/lemmy/moderation/moderation.js'
    import { blockUser, isBlocked } from '$lib/lemmy/user'
    import { blockInstance, site } from '$lib/lemmy'
    import { createEventDispatcher } from 'svelte'
    import { crossPost } from '$lib/components/lemmy/post/helpers'
    import { deleteItem, markAsRead, save } from '$lib/lemmy/contentview.js'
    import { profile } from '$lib/auth'
    import { removeToast, toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings'

    import Button from '$lib/components/input/Button.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import PostEditorModal from './PostEditorModal.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'

    import {
        type IconSource,
        Icon,
        ArrowTopRightOnSquare,
        Bookmark,
        BookmarkSlash,
        EllipsisHorizontal,
        Eye,
        EyeSlash,
        Flag,
        GlobeAlt,
        NoSymbol,
        PencilSquare,
        Share,
        Trash,
        Window

    } from 'svelte-hero-icons'
    import { remove } from 'nprogress';
    
    
    export let post:PostView
    export let menuIconSize:number  = 16
    export let alignment:Alignment = $userSettings.uiState.reverseActionBar ? 'top-left' :  'top-right'
    export let icon:IconSource = EllipsisHorizontal;
    
    // Allow importing this component just for the edit post modal
    export let suppressModal:boolean = false;

    const dispatcher = createEventDispatcher<{ edit: PostView }>()
    let editing = false;
    let blockingInstance = false;
    
    async function doBlockInstance(instance_id:number, hostname:string):Promise<void> {
        blockingInstance = true
        let pleaseWaitToast = toast({
            type: 'warning',
            title: 'Please wait...',
            content: `Please wait while ${hostname} is added to your blocklist.`
        })
        await blockInstance(instance_id, true)
        blockingInstance = false
        
        // Hack to remove the post from the DOM since there's no instance block / hide option available
        post.creator_blocked = true

        removeToast(pleaseWaitToast)
        toast({
            type: 'success',
            title: "Success",
            content: `Successfully blocked ${hostname}`
        })
    }
</script>
<PostEditorModal bind:open={editing} bind:post />

<Menu {alignment} containerClass="overflow-auto">
    <Button slot="button" aria-label="Post actions" let:toggleOpen on:click={toggleOpen} size="square-md" title="Post actions" color="tertiary-border" >
        <Icon slot="icon" src={icon} width={menuIconSize} mini />
    </Button>

    <!---Post Actions --->
    <li class="flex flex-row items-center text-xs font-bold opacity-100 text-left mx-4 my-1 py-1">
        Post
        <span class="ml-auto"/>
        <Icon slot="icon" src={Window} width={16} mini />
    </li>
    <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />
    

    <!---Edit if owned by self--->
    {#if $profile?.user && $profile?.jwt && $profile.user.local_user_view.person.id == post.creator.id}
        <MenuButton  title="Edit Post"
            on:click={() => {
                if (!suppressModal) editing = true
                else {
                    dispatcher('edit', post);
                }
            }}
        >
            <Icon src={PencilSquare} width={16} mini />
            Edit
        </MenuButton>
    {/if}

    <!--- Mark as Read/Unread --->
    {#if $profile?.jwt}
        <MenuButton title="Mark as {post.read ? 'Unread' : 'Read'}"
            on:click={async () => {
                if ($profile?.jwt)
                post.read = await markAsRead(post.post, !post.read, $profile.jwt)
                toast({
                    type: 'success',
                    content: `Post marked as ${post.read ? 'read' : 'unread'}`,
                })
            }}
        >
            <Icon src={post.read ? EyeSlash : Eye} width={16} mini />
            Mark as {post.read ? 'Unread' : 'Read'}
        </MenuButton>
    {/if}

    <!--- Share/Copy Post Link to Clipboard --->
    <MenuButton
        title="Share"
        on:click={() => {
            navigator.share?.({
                url: post.post.ap_id,
            }) ?? navigator.clipboard.writeText(post.post.ap_id)
            toast({
                type: 'success',
                content: `Copied post URL to clipboard!`,
            })
            
        }}
    >
        <Icon src={Share} width={16} mini />
        Share
    </MenuButton>



    {#if $profile?.jwt}
        <!--- Save/Unsave Post --->
        <MenuButton
            title="{post.saved ? 'Unsave' : 'Save'} Post"
            on:click={async () => {
                if ($profile?.jwt) post.saved = await save(post, !post.saved, $profile.jwt)
            }}
        >
            <Icon src={post.saved ? BookmarkSlash : Bookmark} width={16} mini />
            {post.saved ? 'Unsave' : 'Save'}
        </MenuButton>

        <!---Crosspost--->
        <MenuButton title="Crosspost" on:click={() => crossPost(post)} >
            <Icon src={ArrowTopRightOnSquare} width={16} mini />
            Crosspost
        </MenuButton>

        


        <!--- Hide for Self--->
        {#if $profile?.user && $profile.user?.local_user_view.person.id != post.creator.id}
            
            <!---Report Post--->
            <MenuButton on:click={() => report(post)}  title="Report Post">
                <Icon src={Flag} width={16} mini />
                Report Post
            </MenuButton>

            <!---Block User--->
            <MenuButton on:click={async () => {
                    blockUser(post.creator.id, true)
                    post.creator_blocked = !post.creator_blocked
                }}
                title="{isBlocked($profile?.user, post.creator.id) ? 'Unblock User' : 'Block User'}"
            >
                <Icon src={NoSymbol} width={16} mini />
                {isBlocked($profile?.user, post.creator.id) 
                    ? `Unblock ${post.creator.display_name || post.creator.name}@${new URL(post.creator.actor_id).hostname}`
                    : `Block ${post.creator.display_name || post.creator.name}@${new URL(post.creator.actor_id).hostname}`}
            </MenuButton>
        {/if}

        <!---Block Instance (for 0.19+ and if not home instance)--->
        {#if $site?.version.startsWith('0.19') }
            
            <!--- Block Instance of Post's Community--->
            {#if new URL(post.community.actor_id).hostname != $profile?.instance}
                <MenuButton loading={blockingInstance} disabled={blockingInstance}
                    on:click={async () => {doBlockInstance(post.community.instance_id, new URL(post.community.actor_id).hostname) }}
                >
                    <Icon src={NoSymbol} width={16} mini />
                    Block Instance ({new URL(post.community.actor_id).hostname})
                </MenuButton>
            {/if}

            <!--- Block Instance of Post's Creator--->
            {#if new URL(post.creator.actor_id).hostname != $profile?.instance && post.community.instance_id != post.creator.instance_id}
                <MenuButton loading={blockingInstance} disabled={blockingInstance}
                    on:click={async () => { doBlockInstance(post.creator.instance_id, new URL(post.creator.actor_id).hostname) }}
                >
                    <Icon src={NoSymbol} width={16} mini />
                    Block Instance ({new URL(post.creator.actor_id).hostname})
                </MenuButton>
            {/if}
        {/if}


        <!---Delete Post--->
        {#if $profile.user && post.creator.id == $profile.user.local_user_view.person.id}
            <MenuButton
                on:click={async () => {
                    if ($profile?.jwt) {
                        post.post.deleted = await deleteItem(
                            post,
                            !post.post.deleted,
                            $profile.jwt
                        )
                        post=post
                    }
                }}
                title="{post.post.deleted ? 'Restore' : 'Delete'} Post"
            >
                <Icon src={Trash} width={16} mini />
                {post.post.deleted ? 'Restore' : 'Delete'}
            </MenuButton>
        {/if}

        
    {/if}
</Menu>
