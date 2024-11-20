<script lang="ts">
    import type { PostView as LemmyPostView } from 'lemmy-js-client'
    
    interface PostView extends LemmyPostView {
        cross_posts?: PostView[]
    }
    
    import {userSettings} from '$lib/settings'

    import CrosspostItem from '$lib/components/lemmy/post/CrosspostItem.svelte'
    import CollapseButton from '$lib/components/ui/CollapseButton.svelte';

    import { RocketLaunch } from 'svelte-hero-icons';

    export let post:PostView
    export let size:string = "xs"
    
    let textSize:string
    let iconSize:number

    switch(size) {
        case 'xs':
            textSize = "text-xs";
            iconSize = 24;
            break;
        case 'sm':
            textSize = "text-sm";
            iconSize = 24;
            break;
        case 'base':
            textSize = "text-base";
            iconSize = 24
            break;
        default:
            textSize = "text-xs";
            iconSize = 24;
    }
</script>

{#if post?.cross_posts && post.cross_posts.length > 0}
<CollapseButton 
    expanded={$userSettings.uiState.expandCrossPosts && post.cross_posts?.length <= 3} 
    icon={RocketLaunch} 
    iconSize={16}
    title="Crossposts ({post.cross_posts.length})" 
    class="{$$props.class}"
>
    <div class="divide-y divide-slate-200 dark:divide-zinc-800 flex flex-col">
        {#each post.cross_posts as crosspost}
            <CrosspostItem crosspost={crosspost} textSize={textSize} iconSize={iconSize} />
        {/each}
    </div>
</CollapseButton>
{/if}