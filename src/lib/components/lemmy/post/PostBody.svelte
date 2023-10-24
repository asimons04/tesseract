<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import  { 
        type PostDisplayType,
        scrollToTop
    } from './helpers.js'
    
    import Button from '$lib/components/input/Button.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'


    import { 
        Icon, 
        ChevronDown,
        ChevronUp
    } from 'svelte-hero-icons'


    export let post:PostView;
    export let displayType:PostDisplayType = 'post'
    export let expandPreviewText:boolean = false
</script>

{#if (post.post.body || post.post.embed_description)}
    <!--<div class="text-sm bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md p-2" class:hidden={displayType=='feed' && post.post.nsfw}>-->
    <div class="text-sm rounded-md p-2" class:hidden={displayType=='feed' && post.post.nsfw}>    
        {#if displayType == 'post' }
            {#if post.post.body}                
                <Markdown source={post.post.body} />
            {:else if post.post.embed_description}
                <Markdown source={post.post.embed_description} />
            {/if}
            
            <slot />
        {/if}


        <!--- Show expandable preview in feed--->
        {#if displayType=='feed' && !post.post.nsfw}
            {#if post.post.body}    
                <Markdown source={
                        ( !expandPreviewText && post.post.body.length > 250)
                            ? `${post.post.body.slice(0, 250)}...`
                            : post.post.body
                    }
                />
                {#if post.post.body.length > 250}
                    <Button
                        color="tertiary"
                        class="w-full !py-1"
                        title="{expandPreviewText ? 'Collapse' : 'Expand'}"
                        on:click={() => {
                            expandPreviewText = !expandPreviewText
                            const element = document.getElementById(post.post.id);
                            if (element) scrollToTop(element);
                        }}
                    >
                        <Icon src={expandPreviewText ? ChevronUp : ChevronDown} mini size="16" slot="icon" />
                        {expandPreviewText ? 'Collapse' : 'Expand'}
                        <Icon src={expandPreviewText ? ChevronUp : ChevronDown} mini size="16"  />
                    </Button>
                {/if}
        
            <!--- If no post body but there's an embed description avaialble, display that--->
            {:else if post.post.embed_description }
                <Markdown source={
                    ( !expandPreviewText && post.post.embed_description.length > 250)
                        ? `${post.post.embed_description.slice(0, 250)}...`
                        : post.post.embed_description
                    }
                />
                {#if post.post.embed_description.length > 250}
                    <Button
                        color="secondary"
                        class="w-full !py-1"
                        title="{expandPreviewText ? 'Collapse' : 'Expand'}"
                        on:click={() => {
                            expandPreviewText = !expandPreviewText
                            const element = document.getElementById(post.post.id);
                            if (element) scrollToTop(element);
                        }}
                    >
                        <Icon src={expandPreviewText ? ChevronUp : ChevronDown} mini size="16" slot="icon" />
                        {expandPreviewText ? 'Collapse' : 'Expand'}
                        <Icon src={expandPreviewText ? ChevronUp : ChevronDown} mini size="16"  />
                    </Button>
                {/if}
            {/if}
        {/if}
    </div>
{/if}