<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import type { PostType, PostDisplayType } from './helpers.js'
    
    import { getFediseerInfo, fediseerLookup } from '$lib/fediseer/client.js'
    
    import { amMod, isAdmin, report} from '$lib/components/lemmy/moderation/moderation.js'
    import { createEventDispatcher } from 'svelte'
    import { deleteItem, markAsRead, save } from '$lib/lemmy/contentview.js'
    import { getInstance } from '$lib/lemmy.js'
    import { goto } from '$app/navigation'
    import { profile } from '$lib/auth.js'
    import { scrollToTop } from './helpers.js'
    import { setSessionStorage } from '$lib/session.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings.js'

    import Button from '$lib/components/input/Button.svelte'
    import Fediseer from '$lib/fediseer/Fediseer.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import ModerationMenu from '$lib/components/lemmy/moderation/ModerationMenu.svelte'
    import PostVote from './PostVote.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'

    import {
        ArrowTopRightOnSquare,
        ArrowsPointingIn,
        ArrowsPointingOut,
        ArrowUturnLeft,
        Bookmark,
        BookmarkSlash,
        BugAnt,
        ChatBubbleOvalLeftEllipsis,
        EllipsisHorizontal,
        Eye,
        EyeSlash,
        Flag,
        GlobeAlt,
        Icon,
        Newspaper,
        PencilSquare,
        Tv,
        Share,
        Trash,
        UserCircle,
        UserGroup
    } from 'svelte-hero-icons'
    
    export let post: PostView
    export let postType: PostType
    export let displayType: PostDisplayType
    export let expandCompact: boolean
    export let debug: boolean = false
    export let showCommentForm:boolean = false;

    let theaterMode = false;
    let editing = false
    
    let fediseer = {
        loading: false,
        loading2: false,
        modal: false,
        data: undefined
    }
    
    

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


<Fediseer bind:open={fediseer.modal} data={fediseer.data} />

<div class="flex flex-row gap-2 items-center h-8">
    <!--- Post Vote Buttons--->
    <PostVote
        post={post.post}
        bind:vote={post.my_vote}
        bind:score={post.counts.score}
    />

    <!--- Comment Count and Link to Post--->
    <Button
        size="sm"
        href={`/post/${getInstance()}/${post.post.id}`}
        class="!text-inherit h-8 px-3 border-none"
        title="Comments"
        color="ghost"
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

    <!--- Post Reply / Leave Comment Button--->
    {#if displayType == 'post'}
        <Button
            size="sm"
            color="tertiary"
            on:click={() => {
                showCommentForm = !showCommentForm;
                // Interval to deal with animiation delay
                setInterval(() => {
                    let commentForm = document.getElementById(`commentForm-${post.post.id}`);
                    commentForm?.focus()
                }, 250);

            }}
            disabled={post.post.locked}
        >
            <Icon src={ArrowUturnLeft} width={14} height={14} mini />
            <span class="text-sm">Reply</span>
        </Button>

    {/if}
  
    <!--- Spacer --->
    <div class="ml-auto" />

    <!---Debug Button--->
    {#if $userSettings.debugInfo}
        {#if debug}
            {#await import('$lib/components/util/debug/DebugObject.svelte') then { default: DebugObject }}
                <DebugObject object={post} bind:open={debug} />
            {/await}
        {/if}

        <Button on:click={() => (debug = true)} size="square-md" title="Debug Info" color="ghost">
            <Icon src={BugAnt} mini size="16" slot="icon" />
        </Button>
    {/if}
  

    
    <!--- Expand Compact Post to Card--->
    <!--- Hide in theater mode since it's confusing and often closes the card--->
    {#if displayType == 'feed' && $userSettings.showCompactPosts && !theaterMode}
        <Button 
            color="ghost"
            title="{expandCompact ? 'Collapse' : 'Expand'}" 
            on:click={() => {  
                expandCompact = !expandCompact; 
                const element = document.getElementById(post.post.id);
                if (element) scrollToTop(element);
                

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
        <span class="hidden md:block">
            <Button 
                title="{theaterMode ? 'Exit' : ''} Theater Mode"
                color="ghost"
                size="square-md"
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
        </span>
    {/if}
    
    <!--- Moderation Menu--->
    {#if $profile?.user && (amMod($profile.user, post.community) || isAdmin($profile.user))}
        <ModerationMenu bind:item={post} community={post.community} color="ghost"/>
    {/if}
    
    <!--- Post Actions Menu --->
    <Menu
        alignment="side-left"
        containerClass="overflow-auto"
    >
        <Button
            slot="button"
            aria-label="Post actions"
            let:toggleOpen
            on:click={toggleOpen}
            class="hover:text-inherit"
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
            <MenuButton
                title="Mark as {post.read ? 'Unread' : 'Read'}"
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

        <!--- Community Link Button--->
        <MenuButton
            link
            href="/c/{post.community.name}@{new URL(post.community.actor_id).hostname}"
            title="Go to {post.community.name}@{new URL(post.community.actor_id).hostname}"
        >
            <Icon src={UserGroup} width={16} mini />
            <span>{post.community.title}@{new URL(post.community.actor_id).hostname}</span>
        </MenuButton>


        {#if $profile?.jwt}
            <!--- Save/Unsave Post --->
            <MenuButton
            title="{post.saved ? 'Unsave' : 'Save'} Post"
                on:click={async () => {
                    if ($profile?.jwt)
                        post.saved = await save(post, !post.saved, $profile.jwt)
                }}
            >
                <Icon src={post.saved ? BookmarkSlash : Bookmark} width={16} mini />
                {post.saved ? 'Unsave' : 'Save'}
            </MenuButton>
      
            <!---Crosspost--->
            <MenuButton
                title="Crosspost"
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

        <!--- Creator Profile Button--->
        <hr class="w-[90%] mx-auto opacity-100 dark:opacity-10 my-2" />
        <li class="mx-4 text-xs opacity-80 text-left my-1 py-1">{post.creator.display_name ?? post.creator.name}@{new URL(post.creator.actor_id).hostname} </li>
        <MenuButton
            link
            href="/u/{post.creator.name}@{new URL(post.creator.actor_id).hostname}"
            title="View profile for {post.creator.display_name ?? post.creator.name}@{new URL(post.creator.actor_id).hostname}"
        >
            <Icon src={UserCircle} width={16} mini />
            <span>Profile</span>
        </MenuButton>

        
        
        <!--- User Modlog--->
        <MenuButton link
            href="/modlog?other_person_id={post.creator.id}"
            title="Modlog for {post.creator.display_name ?? post.creator.name}@{new URL(post.creator.actor_id).hostname}"
        >
            <Icon src={Newspaper} mini size="16" />
            User Modlog
        </MenuButton>


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

            <MenuButton loading={fediseer.loading2} disabled={fediseer.loading2}>
                <span 
                    class="flex flex-row gap-2 items-center w-full text-sm"
                    title="Get Fediseer info for  {new URL(post.creator.actor_id).hostname}"
                    on:click={async (e) => {
                        e.stopPropagation();
                        fediseer.loading2 = true;
                        fediseer.data = await fediseerLookup(new URL(post.creator.actor_id).hostname);
                        fediseer.loading2 = false;
                        fediseer.modal = true;
                        //@ts-ignore -- Once loaded, pass click event to body to close menu
                        document.querySelector('body').dispatchEvent(e);
                    }}
                >
                    <span class:hidden={fediseer.loading2}>
                        <Icon src={Eye} width={16} mini />
                    </span>
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

        <MenuButton loading={fediseer.loading} disabled={fediseer.loading}>
            <span 
                class="flex flex-row gap-2 items-center w-full text-sm"
                title="Get Fediseer info for  {new URL(post.community.actor_id).hostname}"
                on:click={async (e) => {
                    e.stopPropagation();
                    fediseer.loading = true;
                    fediseer.data = await fediseerLookup(new URL(post.community.actor_id).hostname);
                    fediseer.loading = false;
                    fediseer.modal = true;
                    //@ts-ignore -- Once loaded, pass click event to body to close menu
                    document.querySelector('body').dispatchEvent(e);
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
