<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    
    import { amMod, debugModal, isAdmin, postModerationModal, report} from '$lib/components/lemmy/moderation/moderation.js'
    import { crossPost } from '$lib/components/lemmy/post/helpers'
    import { deleteItem, hide, markAsRead, save } from '$lib/lemmy/contentview.js'
    import { goto } from '$app/navigation';
    import { instance } from '$lib/instance'
    import { profile } from '$lib/auth'
    import { minAPIVersion } from '$lib/lemmy'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    
    import Button           from '$lib/components/input/Button.svelte'
    import Menu             from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton       from '$lib/components/ui/menu/MenuButton.svelte'
    import PostEditorModal  from './PostEditorModal.svelte'

    import {
        type IconSource,
        Icon,
        ArrowTopRightOnSquare,
        Bookmark,
        BookmarkSlash,
        EllipsisVertical,
        Eye,
        EyeSlash,
        Flag,
        Home,
        PencilSquare,
        Share,
        Trash,
        User,
        ShieldCheck,
        BugAnt,
    } from 'svelte-hero-icons'
    
   
    
    export let post:PostView 
    export let menuIconSize:number  = 16
    export let icon:IconSource = EllipsisVertical;
    export let onHomeInstance: boolean = false

    let editing = false;

</script>

{#if $profile?.user?.local_user_view.person.id == post.creator.id && editing}
    <PostEditorModal bind:open={editing} {post}/>
{/if}

<Menu containerClass="overflow-auto" alignment="bottom-right">
    <Button slot="button" aria-label="Post actions" let:toggleOpen on:click={toggleOpen} size="square-md" title="Post actions" color="tertiary" >
        <Icon slot="icon" src={icon} width={menuIconSize} mini />
    </Button>

    <!---Edit if owned by self--->
    {#if $profile?.user?.local_user_view.person.id == post.creator.id}
        <MenuButton  title="Edit Post" color="info"
            on:click={() => { editing = true }}
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
            More from {post.creator.display_name ? post.creator.display_name : post.creator.name}
        </MenuButton>
    {/if}

    <!--- Mark as Read/Unread --->
    {#if $profile?.jwt }
        
        {#if onHomeInstance}
        <MenuButton title="Mark as {post.read ? 'Unread' : 'Read'}" color="info"
            on:click={async () => {
                if ($profile?.jwt)
                post.read = (await markAsRead(post.post, !post.read, $profile.jwt) ) ? !post.read : post.read
                post = post
                toast({
                    type: 'success',
                    content: `Post marked as ${post.read ? 'unread' : 'read'}`,
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
                //if ($profile?.jwt) post.saved = await save(post, !post.saved)
                if ($profile?.jwt) save(post, !post.saved)
            }}
        >
            <Icon src={post.saved ? BookmarkSlash : Bookmark} width={16} mini />
            {post.saved ? 'Unsave' : 'Save'}
        </MenuButton>
        {/if}

    
        <!---Hide Post (requires at least 0.19.4)--->
        {#if onHomeInstance && $profile?.user && minAPIVersion('0.19.4')}
            <MenuButton title="{post.hidden ? 'Unhide' : 'Hide'} Post" color="warning"
                on:click={async () => {
                    post.hidden = await hide(post)
                    post = post
                }}

            >
                <Icon src={post.hidden ? Eye : EyeSlash} width={16} mini />
                {post.hidden ? 'Unhide' : 'Hide'} Post
            </MenuButton>
        {/if}

        


        <!--- Hide for Self and/or if not on home instance--->
        {#if onHomeInstance && $profile?.user && $profile.user?.local_user_view.person.id != post.creator.id}
            
            


            <!---Report Post--->
            <MenuButton on:click={() => report(post)} title="Report Post" color="dangerSecondary" disabled={post.post.removed}>
                <Icon src={Flag} width={16} mini />
                Report Post...
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

        {#if onHomeInstance && $profile?.user && (amMod($profile.user, post.community) || isAdmin($profile.user))}
            <MenuButton title="Moderation" color="dangerSecondary" on:click={() => postModerationModal(post) }>
                <Icon src={ShieldCheck} width={16} mini />
                Moderation...
            </MenuButton>
        {/if}

        <MenuButton title="Debug Info" color="info" on:click={() => debugModal(post) }>
            <Icon src={BugAnt} width={16} mini />
            Debug Info...
        </MenuButton>

    {/if}

</Menu>
