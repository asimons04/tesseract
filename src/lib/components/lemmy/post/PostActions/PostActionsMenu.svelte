<script lang="ts">
    import type { Alignment } from '$lib/components/ui/menu/menu.js'
    import type { PostView } from 'lemmy-js-client'
    
    import { report} from '$lib/components/lemmy/moderation/moderation.js'
    import { blockUser, isBlocked } from '$lib/lemmy/user'
    import { createEventDispatcher } from 'svelte'
    import { crossPost } from '$lib/components/lemmy/post/helpers'
    import { deleteItem, markAsRead, save } from '$lib/lemmy/contentview.js'
    import { goto } from '$app/navigation';
    import { instance } from '$lib/instance'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings'

    import Button from '$lib/components/input/Button.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import PostEditorModal from './PostEditorModal.svelte'
    

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
        Home,
        NoSymbol,
        PencilSquare,
        Share,
        Trash,
        User,
        Window,
    } from 'svelte-hero-icons'
    
    
    
    export let post:PostView
    export let menuIconSize:number  = 16
    export let alignment:Alignment = $userSettings.uiState.reverseActionBar ? 'top-left' :  'top-right'
    export let icon:IconSource = EllipsisHorizontal;
    
    // Allow importing this component just for the edit post modal
    export let suppressModal:boolean = false;

    const dispatcher = createEventDispatcher<{ edit: PostView }>()
    let editing = false;

    $: onHomeInstance = ($page.params.instance ?? $instance)  == $instance
    $: alignment = $userSettings.uiState.reverseActionBar ? 'top-left' :  'top-right'
</script>
<PostEditorModal bind:open={editing} bind:post />

<Menu bind:alignment containerClass="overflow-auto">
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
        <MenuButton  title="Edit Post" color="info"
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

    <!--- Share/Copy Post Link to Clipboard --->
    <MenuButton title="Share" color="success"
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

    <!--- View Post on Home Instance--->
    {#if $instance != new URL(post.post.ap_id).hostname}
    <MenuButton title="View Post on Home Instance" color="info"
        on:click={() => {
            const postURL = new URL(post.post.ap_id)
            const homeInstance = postURL.hostname
            const path = postURL.pathname.split('/')
            const homePostID = path[2]
            goto(`/post/${homeInstance}/${homePostID}`)
        }}
    >
        <Icon src={Home} width={16} mini />
            View Post on Home Instance
    </MenuButton>
    {/if}

    {#if onHomeInstance}
        <!---Posts In This Community by This Creator--->
        <MenuButton link href="/search?type=All&q=%20&community_id={post.community.id}&person_id={post.creator.id}" title="Submissions in this community by this creator" color="info">
            <Icon src={User} mini size="16" />
            More from {post.creator.display_name ? post.creator.display_name : post.creator.name}@{new URL(post.creator.actor_id).hostname}
        </MenuButton>
    {/if}

    <!--- Mark as Read/Unread --->
    {#if $profile?.jwt }
        
        {#if onHomeInstance}
        <MenuButton title="Mark as {post.read ? 'Unread' : 'Read'}" color="info"
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
    
        <!---Crosspost--->
        <MenuButton title="Crosspost" color="info" on:click={() => crossPost(post)} >
            <Icon src={ArrowTopRightOnSquare} width={16} mini />
            Crosspost
        </MenuButton>    

        <!--- Save/Unsave Post --->
        {#if onHomeInstance}
        <MenuButton title="{post.saved ? 'Unsave' : 'Save'} Post" color="warning"
            on:click={async () => {
                if ($profile?.jwt) post.saved = await save(post, !post.saved)
            }}
        >
            <Icon src={post.saved ? BookmarkSlash : Bookmark} width={16} mini />
            {post.saved ? 'Unsave' : 'Save'}
        </MenuButton>
        {/if}

        

        


        <!--- Hide for Self and/or if not on home instance--->
        {#if onHomeInstance && $profile?.user && $profile.user?.local_user_view.person.id != post.creator.id}
            
            <!---Report Post--->
            <MenuButton on:click={() => report(post)} title="Report Post" color="dangerSecondary">
                <Icon src={Flag} width={16} mini />
                Report Post
            </MenuButton>
        {/if}

        


        <!---Delete Post--->
        {#if $profile.user && post.creator.id == $profile.user.local_user_view.person.id}
            <MenuButton title="{post.post.deleted ? 'Restore' : 'Delete'} Post" color="{post.post.deleted ? 'success' : 'dangerSecondary'}"
                on:click={async () => {
                    if ($profile?.jwt) {
                        post.post.deleted = await deleteItem(
                            post,
                            !post.post.deleted,
                        )
                        post=post
                    }
                }}
            >
                <Icon src={Trash} width={16} mini />
                {post.post.deleted ? 'Restore' : 'Delete'}
            </MenuButton>
        {/if}

        
    {/if}
</Menu>
