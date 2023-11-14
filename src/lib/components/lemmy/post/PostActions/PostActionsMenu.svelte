<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    
    import { amMod, isAdmin, report} from '$lib/components/lemmy/moderation/moderation.js'
    import { createEventDispatcher } from 'svelte'
    import { crossPost } from '$lib/components/lemmy/post/helpers'
    import { deleteItem, markAsRead, save } from '$lib/lemmy/contentview.js'
    import { goto } from '$app/navigation'
    import { profile } from '$lib/auth'
    import { setSessionStorage } from '$lib/session.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'


    import Button from '$lib/components/input/Button.svelte'
    import Fediseer from '$lib/fediseer/Fediseer.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'

    import {
        Icon,
        ArrowTopRightOnSquare,
        Bookmark,
        BookmarkSlash,
        EllipsisHorizontal,
        Eye,
        EyeSlash,
        Flag,
        GlobeAlt,
        PencilSquare,
        Share,
        Trash,

    } from 'svelte-hero-icons'
    export let post:PostView

    const dispatcher = createEventDispatcher<{ edit: PostView }>()
    
    let editing:boolean = false;
    
    let fediseer = {
        instance: '',
        modal: false
    }
    function openFediseerModal(instance:string):void {
        fediseer.instance = instance;
        fediseer.modal = true;
    }
</script>

<!--- Open a Modal containing the PostForm component pre-loaded with the post details--->
{#if editing}
    <Modal bind:open={editing} fullHeight={false} icon={PencilSquare} title="Editing {post.post.name}">
        
        {#await import('$lib/components/lemmy/post/PostForm.svelte')}
            <div class="mx-auto flex justify-center items-center">
                <Spinner width={32} />
            </div>
        {:then { default: PostForm }}
            <PostForm
                edit
                editingPost={post}
                on:submit={(e) => {
                    editing = false
                    post = e.detail
                    dispatcher('edit', e.detail)
                }}
            >

            <svelte:fragment slot="formtitle">
                <!-- Have the title not exist at all -->
                {''}
            </svelte:fragment>
            </PostForm>
        {/await}
    </Modal>
{/if}

<!---Note: Needs to be inside if block so it is mounted/destroyed on each invocation--->
{#if fediseer.modal}
    <Fediseer bind:open={fediseer.modal} instance={fediseer.instance} />
{/if}


<Menu alignment="side-left" containerClass="overflow-auto">
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
        <Icon slot="icon" src={EllipsisHorizontal} width={16} mini />
    </Button>

    <!---Post Actions --->
    <li class="mx-4 text-xs opacity-80 text-left my-1 py-1">Actions</li>

    <!---Edit if owned by self--->
    {#if $profile?.user && $profile?.jwt && $profile.user.local_user_view.person.id == post.creator.id}
        <MenuButton on:click={() => (editing = true)} title="Edit Post">
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

        


        <!--- Report Button -- Hide for self--->
        {#if $profile.user?.local_user_view.person.id != post.creator.id}
            <MenuButton on:click={() => report(post)} color="dangerSecondary" title="Report Post">
                <Icon src={Flag} width={16} mini />
                Report Post
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



    <!---Browse communities / fediseer of the post creator if different from community's home instance-->
    {#if new URL(post.creator.actor_id).hostname != new URL(post.community.actor_id).hostname}
        
        <hr class="w-[90%] mx-auto opacity-100 dark:opacity-10 my-2" />
        <li class="mx-4 text-xs opacity-80 text-left my-1 py-1">{(new URL(post.creator.actor_id).hostname)}</li>    
        <MenuButton
            link
            href="/communities/{new URL(post.creator.actor_id).hostname}"
            title="Browse communities at {new URL(post.creator.actor_id).hostname}"
        >
            <Icon src={GlobeAlt} width={16} mini />
            <span>Browse Communities</span>
        </MenuButton>

        <MenuButton>
            <span 
                class="flex flex-row gap-2 items-center w-full text-sm"
                title="Get Fediseer info for  {new URL(post.creator.actor_id).hostname}"
                on:click={async (e) => openFediseerModal(new URL(post.creator.actor_id).hostname)}
            >
                <Icon src={Eye} width={16} mini />
                <span>Fediseer</span>
            </span>
        </MenuButton>
    {/if}



    <!---Actions for the instance the post was submitted to--->
    <hr class="w-[90%] mx-auto opacity-100 dark:opacity-10 my-2" />
    <li class="mx-4 text-xs opacity-80 text-left my-1 py-1">{new URL(post.community.actor_id).hostname}</li>
    <MenuButton
        link
        href="/communities/{new URL(post.community.actor_id).hostname}"
        title="Browse communities at {new URL(post.community.actor_id).hostname}"
    >
        <Icon src={GlobeAlt} width={16} mini />
        <span>Browse Communities</span>
    </MenuButton>

    
    <MenuButton>
        <span 
            class="flex flex-row gap-2 items-center w-full text-sm"
            title="Get Fediseer info for  {new URL(post.community.actor_id).hostname}"
            on:click={async (e) => openFediseerModal(new URL(post.community.actor_id).hostname) }
        >
            <Icon src={Eye} width={16} mini />
            <span>Fediseer</span>
        </span>
    </MenuButton>
    

</Menu>