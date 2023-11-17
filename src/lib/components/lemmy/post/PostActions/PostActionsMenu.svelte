<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    
    import { amMod, isAdmin, report} from '$lib/components/lemmy/moderation/moderation.js'
    import { blockUser, isBlocked } from '$lib/lemmy/user'

    import { createEventDispatcher } from 'svelte'
    import { crossPost } from '$lib/components/lemmy/post/helpers'
    import { deleteItem, markAsRead, save } from '$lib/lemmy/contentview.js'
    import { goto } from '$app/navigation'
    import { profile } from '$lib/auth'
    import { setSessionStorage } from '$lib/session.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'


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
    
    
    export let post:PostView
    export let menuIconSize:number  = 16
    export let alignment:string = 'top-right'
    export let icon:IconSource = EllipsisHorizontal;
    
    // Allow importing this component just for the edit post modal
    export let suppressModal:boolean = false;

    const dispatcher = createEventDispatcher<{ edit: PostView }>()
    let editing:boolean = false;
    
    
</script>
<PostEditorModal bind:open={editing} bind:post />

<Menu {alignment} containerClass="overflow-auto">
    <Button
        slot="button"
        aria-label="Post actions"
        let:toggleOpen
        on:click={toggleOpen}
        class="hover:text-inherit !border-none"
        size="square-md"
        title="Post actions"
        color="ghost"
    >
        <Icon slot="icon" src={icon} width={menuIconSize} mini />
    </Button>

    <!---Post Actions --->
    <li class="flex flex-row gap-1 items-center ml-2 text-xs opacity-80 text-left font-bold my-1 py-1">
        <Icon slot="icon" src={Window} width={16} mini />
        Post
    </li>
    

    <!---Edit if owned by self--->
    {#if $profile?.user && $profile?.jwt && $profile.user.local_user_view.person.id == post.creator.id}
        <MenuButton  title="Edit Post"
            on:click={() => {
                if (!suppressModal) editing = true
                else {
                    dispatcher('openPostEditor', post);
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
        {#if $profile.user?.local_user_view.person.id != post.creator.id}
            
            <!---Report Post--->
            <MenuButton on:click={() => report(post)} color="dangerSecondary" title="Report Post">
                <Icon src={Flag} width={16} mini />
                Report Post
            </MenuButton>

            <!---Block User--->
            <MenuButton on:click={() => blockUser(post.creator.id)} color="dangerSecondary" title="{isBlocked($profile?.user, post.creator.id) ? 'Unblock User' : 'Block User'}">
                <Icon src={NoSymbol} width={16} mini />
                {isBlocked($profile?.user, post.creator.id) 
                    ? `Unblock ${post.creator.display_name || post.creator.name}@${new URL(post.creator.actor_id).hostname}`
                    : `Block ${post.creator.display_name || post.creator.name}@${new URL(post.creator.actor_id).hostname}`}
            </MenuButton>
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
                color="dangerSecondary"
                title="{post.post.deleted ? 'Restore' : 'Delete'} Post"
            >
                <Icon src={Trash} width={16} mini />
                {post.post.deleted ? 'Restore' : 'Delete'}
            </MenuButton>
        {/if}

        
    {/if}
</Menu>
