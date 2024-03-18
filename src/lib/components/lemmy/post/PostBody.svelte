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
    import { userSettings } from '../../../settings.js';


    export let post:PostView;
    export let displayType:PostDisplayType = 'post'
    export let expandPreviewText:boolean = false
    export let previewLength:number = 250
    export let inline:boolean = false

    
</script>

{#if (post.post.body || post.post.embed_description)}

    <div class="text-sm rounded-md">    
        {#if displayType == 'post' }
            {#if post.post.body}                
                <Markdown source={post.post.body} {inline}/>
            {:else if post.post.embed_description}
                <Markdown source={post.post.embed_description} {inline} />
            {/if}
            
            <slot />
        {/if}


        <!--- Show expandable preview in feed--->
        {#if displayType=='feed'}
            {#if post.post.body}    
                <Markdown 
                    class="{post.post.nsfw && $userSettings.nsfwBlur ? 'blur-sm' : ''}"
                    source={
                        !expandPreviewText && post.post.body.length > previewLength
                            ? post.post.body.slice(0, previewLength)
                            : post.post.body
                    }
                    {inline}
                />

                {#if (post.post.body.length > previewLength) || post.post.nsfw}
                    <Button
                        color="tertiary"
                        class="w-full !py-0"
                        title="{expandPreviewText ? 'Collapse' : 'Expand'} {post.post.nsfw && $userSettings.nsfwBlur? 'NSFW Text' : ''}"
                        on:click={() => {
                            expandPreviewText = !expandPreviewText
                            post.post.nsfw = false
                            // Scroll top of post to top on close
                            const element = document.getElementById(post.post.id.toString());
                            if (element && !expandPreviewText) scrollToTop(element);
                        }}
                    >
                        <Icon src={expandPreviewText ? ChevronUp : ChevronDown} mini size="16" slot="icon" />
                        {expandPreviewText ? 'Collapse' : 'Expand'} {post.post.nsfw && $userSettings.nsfwBlur? 'NSFW Text' : ''}
                        <Icon src={expandPreviewText ? ChevronUp : ChevronDown} mini size="16"  />
                    </Button>
                {/if}
        



            <!--- If no post body but there's an embed description avaialble, display that--->
            {:else if post.post.embed_description }
                <Markdown 
                    class="{post.post.nsfw && $userSettings.nsfwBlur ? 'blur-sm' : ''}"
                    source={
                        !expandPreviewText && post.post.embed_description.length > previewLength
                            ? post.post.embed_description.slice(0, previewLength)
                            : post.post.embed_description
                    }
                    {inline}
                />
                {#if post.post.embed_description.length > previewLength}
                    <Button
                        color="secondary"
                        class="w-full !py-0"
                        title="{expandPreviewText ? 'Collapse' : 'Expand'} {post.post.nsfw && $userSettings.nsfwBlur? 'NSFW Text' : ''}"
                        on:click={() => {
                            expandPreviewText = !expandPreviewText
                            post.post.nsfw = false
                            
                            // Scroll top of post to top on close
                            const element = document.getElementById(post.post.id.toString());
                            if (element && !expandPreviewText) scrollToTop(element);
                        }}
                    >
                        <Icon src={expandPreviewText ? ChevronUp : ChevronDown} mini size="16" slot="icon" />
                        {expandPreviewText ? 'Collapse' : 'Expand'} {post.post.nsfw && $userSettings.nsfwBlur? 'NSFW Text' : ''}
                        <Icon src={expandPreviewText ? ChevronUp : ChevronDown} mini size="16"  />
                    </Button>
                {/if}
            {/if}
        {/if}
    </div>
{/if}