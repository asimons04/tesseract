<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostType, PostDisplayType } from './helpers.js'

    import PostVote from './PostVote.svelte'
    import { getInstance } from '$lib/lemmy.js'
    import {
        ArrowTopRightOnSquare,
        ArrowsPointingIn,
        ArrowsPointingOut,
        Bookmark,
        BookmarkSlash,
        BugAnt,
        ChatBubbleOvalLeftEllipsis,
        EllipsisHorizontal,
        Eye,
        EyeSlash,
        Flag,
        Icon,
        Newspaper,
        PencilSquare,
        Tv,
        Share,
        Trash,
        UserCircle,
    } from 'svelte-hero-icons'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import { createEventDispatcher } from 'svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import {
        amMod,
        isAdmin,
        report,
    } from '$lib/components/lemmy/moderation/moderation.js'
    import ModerationMenu from '$lib/components/lemmy/moderation/ModerationMenu.svelte'
    import { profile } from '$lib/auth.js'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    import { deleteItem, markAsRead, save } from '$lib/lemmy/contentview.js'
    import { setSessionStorage } from '$lib/session.js'
    import { goto } from '$app/navigation'
    import { userSettings } from '$lib/settings.js'

    export let post: PostView
    export let postType: PostType
    export let displayType: PostDisplayType
    export let expandCompact: boolean
    export let debug: boolean = false
    
    let theaterMode = false;
    let editing = false
    
    const dispatcher = createEventDispatcher<{ edit: PostView }>()

    function delay(millisec:number) {
        return new Promise(resolve => {
            setTimeout(() => { resolve('') }, millisec);
        })
    }
</script>

<!--- Open a Modal containing the PostForm component pre-loaded with the post details--->
{#if editing}
    <Modal bind:open={editing} fullHeight={true}>
        <h1 slot="title" class="text-2xl font-bold">Editing post</h1>
        {#await import('./PostForm.svelte')}
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

<div class="flex flex-row mt-4 gap-2 items-center h-8">
    <PostVote
        post={post.post}
        bind:vote={post.my_vote}
        bind:score={post.counts.score}
    />

    <Button
        size="sm"
        href="/post/{getInstance()}/{post.post.id}"
        class="!text-inherit h-8 px-3 border-none"
        title="Comments"
    >
        <Icon
            slot="icon"
            src={ChatBubbleOvalLeftEllipsis}
            mini
            width={16}
            height={16}
        />
        <FormattedNumber number={post.counts.comments} />
    </Button>
  
    <div class="ml-auto" />

    {#if $userSettings.debugInfo}
        {#if debug}
            {#await import('$lib/components/util/debug/DebugObject.svelte') then { default: DebugObject }}
                <DebugObject object={post} bind:open={debug} />
            {/await}
        {/if}

        <Button on:click={() => (debug = true)} size="square-md" title="Debug Info">
            <Icon src={BugAnt} mini size="16" slot="icon" />
        </Button>
    {/if}
  

    
    <!--- Expand Compact Post to Card--->
    <!--- Hide in theater mode since it's confusing and often closes the card--->
    {#if displayType == 'feed' && $userSettings.showCompactPosts && !theaterMode}
        <Button 
            title="{expandCompact ? 'Collapse' : 'Expand'}" 
            on:click={() => {  
                expandCompact = !expandCompact; 
                const element = document.getElementById(post.post.id);
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: "start"
                    });
                }

            }}
        >
            <Icon src={expandCompact ? ArrowsPointingIn : ArrowsPointingOut} mini size="16" slot="icon" />
            
        </Button>
    {/if}

    <!--Theater Mode Button for YouTube/Vimeo Videos--->
    {#if
        (postType == "youtube" || postType=="vimeo" || postType=="video") && ( 
            ($userSettings.embeddedMedia.post && displayType == 'post') ||
            ($userSettings.embeddedMedia.feed && displayType == 'feed') 
        )
    }
        <Button 
            title="{theaterMode ? 'Exit' : ''} Theater Mode"
            on:click={
                async () => {
                    if (!theaterMode) {
                        $userSettings.uiState.expandCommunitySidebar=false;
                        $userSettings.uiState.expandSidebar = false;
                        theaterMode=true;
                    }
                    else {
                        $userSettings.uiState.expandCommunitySidebar=true;
                        $userSettings.uiState.expandSidebar = true;
                        theaterMode=false;
                    }
                    await delay(10);
                    const element = document.getElementById("video-" + post.post.id);
                    if (element) {
                        element.scrollIntoView({
                            behavior: 'smooth',
                            block: "center"
                        });
                    }
                }
            }
        >
            <Icon src={Tv} mini size="16" slot="icon" />
        </Button>
    {/if}
    
    <!--- Moderation Menu--->
    {#if $profile?.user && (amMod($profile.user, post.community) || isAdmin($profile.user))}
        <ModerationMenu bind:item={post} community={post.community} />
    {/if}
    
    <!--- Post Actions Menu --->
    <Menu
        alignment="side-left"
        containerClass="overflow-auto max-h-[400px]"
    >
        <Button
            slot="button"
            aria-label="Post actions"
            let:toggleOpen
            on:click={toggleOpen}
            class="hover:text-inherit"
            size="square-md"
            title="Post actions"
        >
            <Icon slot="icon" src={EllipsisHorizontal} width={16} mini />
        </Button>

        <li class="mx-4 text-xs opacity-80 text-left my-1 py-1">Creator</li>
        <MenuButton
            link
            href="/u/{post.creator.name}@{new URL(post.creator.actor_id).hostname}"
        >
            <Icon src={UserCircle} width={16} mini />
            <span>{post.creator.name}</span>
        </MenuButton>

        <MenuButton
            link
            href="/c/{post.community.name}@{new URL(post.community.actor_id).hostname}"
        >
            <Icon src={Newspaper} width={16} mini />
            <span>{post.community.title}</span>
        </MenuButton>
    
        <hr class="w-[90%] mx-auto opacity-100 dark:opacity-10 my-2" />
        <li class="mx-4 text-xs opacity-80 text-left my-1 py-1">Actions</li>
        {#if $profile?.user && $profile?.jwt && $profile.user.local_user_view.person.id == post.creator.id}
            <MenuButton on:click={() => (editing = true)}>
                <Icon src={PencilSquare} width={16} mini />
                Edit
            </MenuButton>
        {/if}

        {#if $profile?.jwt}
            <MenuButton
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

        <MenuButton
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
            <MenuButton
                on:click={async () => {
                    if ($profile?.jwt)
                        post.saved = await save(post, !post.saved, $profile.jwt)
                }}
            >
                <Icon src={post.saved ? BookmarkSlash : Bookmark} width={16} mini />
                {post.saved ? 'Unsave' : 'Save'}
            </MenuButton>
      
            <MenuButton
                on:click={() => {
                    setSessionStorage('postDraft', {
                        body: `cross-posted from: ${post.post.ap_id}\n\n${
                            post.post.body
                        }`,
                        url: post.post.url,
                        name: post.post.name,
                        loading: false,
                        nsfw: post.post.nsfw,
                        community: null,
                        image: null,
                    })
                    goto('/create/post?crosspost=true')
                }}
            >
                <Icon src={ArrowTopRightOnSquare} width={16} mini />
                Crosspost
            </MenuButton>
      
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
                >
                    <Icon src={Trash} width={16} mini />
                    {post.post.deleted ? 'Restore' : 'Delete'}
                </MenuButton>
            {/if}

            {#if $profile.user?.local_user_view.person.id != post.creator.id}
                <MenuButton on:click={() => report(post)} color="dangerSecondary">
                    <Icon src={Flag} width={16} mini />
                    Report
                </MenuButton>
            {/if}
        {/if}
    </Menu>
</div>
