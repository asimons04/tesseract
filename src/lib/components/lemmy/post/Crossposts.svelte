<script lang="ts">
    import type { PostView as LemmyPostView } from 'lemmy-js-client'
    
    interface PostView extends LemmyPostView {
        cross_posts?: PostView[]
    }
    
    import {userSettings} from '$lib/settings'
    import CrosspostItem from '$lib/components/lemmy/post/CrosspostItem.svelte'
    import SectionTitle from '$lib/components/ui/SectionTitle.svelte'

    export let post:PostView
    export let size:string = "xs"
    
    let textSize:string
    let iconSize:number

    switch(size) {
        case 'xs':
            textSize = "text-xs";
            iconSize = 18;
            break;
        case 'sm':
            textSize = "text-sm";
            iconSize = 22;
            break;
        case 'base':
            textSize = "text-base";
            iconSize = 24
            break;
        default:
            textSize = "text-xs";
            iconSize = 18;
    }
</script>

{#if post?.cross_posts && post.cross_posts.length > 0}
    <details class="{textSize} font-bold w-full cursor-pointer pb-2 {$$props.class}" open={$userSettings.uiState.expandCrossPosts && post.cross_posts?.length <= 3}>
        <summary class="inline-block w-full">
            <SectionTitle class="{textSize} text-inherit dark:text-inherit">
                Crossposts 
                <span class="text-slate-600 dark:text-zinc-400 text-xs ml-1">
                    {post.cross_posts.length}
                </span>
            </SectionTitle>
        </summary>
            
        <div class="divide-y divide-slate-200 dark:divide-zinc-800 flex flex-col">
            {#each post.cross_posts as crosspost}
                <CrosspostItem crosspost={crosspost} textSize={textSize} iconSize={iconSize}/>
            {/each}
        </div>
    </details>
{/if}