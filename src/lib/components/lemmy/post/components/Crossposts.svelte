<script lang="ts">
    import type { PostView as LemmyPostView } from 'lemmy-js-client'
    
    interface PostView extends LemmyPostView {
        cross_posts?: PostView[]
    }
    
    import {userSettings} from '$lib/settings'

    import CrosspostItem from './CrosspostItem.svelte'
    import CollapseButton from '$lib/components/ui/CollapseButton.svelte';

    import { ArrowsRightLeft } from 'svelte-hero-icons'

    export let post:PostView
    export let onHomeInstance: boolean= false
    
    let textSize:string
    let iconSize:number = 20

</script>

{#if post?.cross_posts && post.cross_posts.length > 0}
<CollapseButton 
    expanded={$userSettings.uiState.expandCrossPosts} 
    icon={ArrowsRightLeft} 
    iconSize={16}
    title="{post.cross_posts.length} {post.cross_posts.length == 1 ? 'Crosspost' : 'Crossposts'}"
    class="!my-0 {$$props.class}"
    innerClass="!pl-0"
>
    <div class="divide-y gap-2 divide-slate-300 dark:divide-zinc-700 flex flex-col max-h-[10rem] overflow-y-scroll">
        {#each post.cross_posts as crosspost}
            <CrosspostItem bind:crosspost {textSize} {iconSize} {onHomeInstance}/>
        {/each}
    </div>
</CollapseButton>
{/if}