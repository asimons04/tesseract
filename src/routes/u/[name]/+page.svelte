<script lang="ts">
    import { ban, isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
    import { getClient } from '$lib/lemmy.js'
    import { goto } from '$app/navigation'
    import { isBlocked } from '$lib/lemmy/user.js'
    import { isCommentView } from '$lib/lemmy/item.js'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { searchParam } from '$lib/util.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings.js'

    //import Avatar from '$lib/components/ui/Avatar.svelte'
    //import Button from '$lib/components/input/Button.svelte'
    //import Card from '$lib/components/ui/Card.svelte'
    import CommentItem from '$lib/components/lemmy/comment/CommentItem.svelte'
    //import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    //import Markdown from '$lib/components/markdown/Markdown.svelte'
    //import Menu from '$lib/components/ui/menu/Menu.svelte'
    //import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    //import Modal from '$lib/components/ui/modal/Modal.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import Post from '$lib/components/lemmy/post/Post.svelte'
    //import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    //import ShieldIcon from '$lib/components/lemmy/moderation/ShieldIcon.svelte'
    //import StickyCard from '$lib/components/ui/StickyCard.svelte'
    //import TextArea from '$lib/components/input/TextArea.svelte'
    import UserCard from '$lib/components/lemmy/user/UserCard.svelte'
    //import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    import {
        Bars3,
        ChartBar,
        Icon,
        PencilSquare,
        ShieldCheck,
        QueueList
    } from 'svelte-hero-icons'
    

    export let data
    export let userSideCard = true
</script>

<svelte:head>
  <title>{data.person_view.person.name}</title>
</svelte:head>


<div class="flex flex-col-reverse xl:flex-row gap-4 max-w-full w-full px-2">
    <div class="flex flex-col gap-4 max-w-full w-full min-w-0">



        {#if data.items.length == 0}
            <Placeholder
                icon={PencilSquare}
                title="No submissions"
                description="This user has no submissions that match this filter."
            />
        {:else}
            <div class="flex flex-row gap-4 justify-between flex-wrap">
                <MultiSelect
                    options={['New', 'TopAll', 'Old']}
                    optionNames={['New', 'Top', 'Old']}
                    selected={data.sort}
                    on:select={(e) => searchParam($page.url, 'sort', e.detail, 'page')}
                    headless={true}
                    fullWidth={true}
                    items={0}
                >
                    <Icon src={ChartBar} mini width={16} slot="icon"/>
                    <span slot="label">Sort Direction</span>
                </MultiSelect>
        
                <MultiSelect
                    options={['all', 'posts', 'comments']}
                    optionNames={['All', 'Posts', 'Comments']}
                    selected={data.type}
                    on:select={(e) => searchParam($page.url, 'type', e.detail, 'page')}
                    headless={true}
                    fullWidth={true}
                    items={0}
                >
                    <Icon src={Bars3} mini width={16} slot="icon"/>
                    <span slot="label">List Type</span>
                </MultiSelect>

                <MultiSelect
                        options={['Cards', 'Compact']}
                        selected={$userSettings.showCompactPosts
                            ? 'Compact'
                            : 'Cards'
                        }
                        on:select={(e) => {
                            $userSettings.showCompactPosts = !$userSettings.showCompactPosts
                        }}
                        headless={true}
                        fullWidth={true}
                        items={0}
                    >
                        <Icon src={QueueList} mini width={16} slot="icon"/>
                        <span slot="label">Display Type</span>    
                </MultiSelect>
            </div>
            <div class="w-full sm:w-full md:w-[80%] lg:w-[80%] xl:w-[80%] flex flex-col gap-5 ml-auto mr-auto">
                {#each data.items as item (item.counts.id)}
                    {#if isCommentView(item) && (data.type == 'all' || data.type == 'comments')}
                        <CommentItem comment={item} />
                    {:else if !isCommentView(item) && (data.type == 'all' || data.type == 'posts')}
                        <Post post={item} />
                    {/if}
                {/each}
            </div>
        {/if}
    
        <Pageination
            page={data.page}
            on:change={(p) => searchParam($page.url, 'page', p.detail.toString())}
        />
    </div>
    
    {#if userSideCard}
        <div>
            <UserCard person={data.person_view} />
        </div>
    {/if}
</div>
