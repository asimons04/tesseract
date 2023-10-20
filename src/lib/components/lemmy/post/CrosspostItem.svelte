<script lang="ts">
    import type { PostView } from 'lemmy-js-client';

    import { getInstance } from '$lib/lemmy.js'

    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'

    import {
        Icon,
        ArrowUp,
        ArrowDown,
        ChatBubbleOvalLeftEllipsis
    } from 'svelte-hero-icons'

    export let crosspost:PostView;
    export let textSize:string = "text-xs"
    export let iconSize:number = 18
    

</script>


<a class="
        hover:dark:bg-zinc-800 hover:bg-slate-200
        py-2.5 px-4 flex flex-row gap-4 items-center
    " 
    id="{crosspost.post.id}"
    href="/post/{getInstance()}/{crosspost.post.id}" title="{crosspost.post.name}">
    <span class="{textSize} flex flex-col">
        <CommunityLink
            community={crosspost.community}
            avatarSize={iconSize}
            avatar={true}
            href="/post/{getInstance()}/{crosspost.post.id}"
        />
    </span>
    
    <span class="ml-auto"/>
    
    <span class="flex flex-row gap-2 font-normal {textSize} items-center">
        <Icon
            src={crosspost.counts.score > 0 ? ArrowUp : ArrowDown}
            mini
            width={iconSize}
            height={iconSize}
        />
        <FormattedNumber number={crosspost.counts.score} />
    </span>

    
    <span class="flex flex-row gap-2 font-normal {textSize} items-center" >
        <Icon
            src={ChatBubbleOvalLeftEllipsis}
            mini
            width={iconSize}
            height={iconSize}
        />
        <FormattedNumber number={crosspost.counts.comments} />
    </span>
</a>