<script lang="ts">
    import type { PostView } from 'lemmy-js-client';

    import { getInstance } from '$lib/lemmy.js'
    import { userSettings } from '$lib/settings'

    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'

    import {
        Icon,
        ArrowUp,
        ArrowDown,
        ChatBubbleOvalLeftEllipsis,
        Pencil
    } from 'svelte-hero-icons'

    export let crosspost:PostView;
    export let textSize:string = "text-xs"
    export let iconSize:number = 18
    
    const getTextSize = () => `text-xs md:${textSize}`

</script>


<a class="
        hover:dark:bg-zinc-800 hover:bg-slate-200
        py-2.5 px-4 flex flex-row gap-4 items-center
        {getTextSize()}
    " 
    id="{crosspost.post.id.toString()}"
    href="/post/{getInstance()}/{crosspost.post.id}" title="{crosspost.post.name}"
>
    
    <span class="flex flex-col">
        <CommunityLink community={crosspost.community} avatar avatarSize={iconSize} href="/post/{getInstance()}/{crosspost.post.id}"/>
    </span>
    
    <span class="ml-auto"/>
    
    <span class="hidden md:flex flex-row gap-1 items-center text-slate-600 dark:text-zinc-400">
        <RelativeDate date={crosspost.post.published} />
        {#if crosspost.post.updated}
            <span class="flex flex-row items-center gap-1 ml-1">•
                <Icon src={Pencil} solid size="12" title="Edited" />
                <RelativeDate date={crosspost.post.updated}/>
            </span>
        {/if}
    </span>

    {#if $userSettings.uiState.showScores}
    <span class="flex flex-row gap-2 font-normal items-center">
        <Icon src={crosspost.counts.score > 0 ? ArrowUp : ArrowDown} mini width={iconSize} height={iconSize}/>
        <FormattedNumber number={crosspost.counts.score} />
    </span>
    {/if}

    
    <span class="flex flex-row gap-2 font-normal items-center" >
        <Icon src={ChatBubbleOvalLeftEllipsis} mini width={iconSize} height={iconSize}/>
        <FormattedNumber number={crosspost.counts.comments} />
    </span>
</a>