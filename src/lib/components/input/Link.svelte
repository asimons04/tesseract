<script lang="ts">
    import { createEventDispatcher } from "svelte"
    import { goto } from "$app/navigation";
    import { linkPreviewModal } from "$lib/components/lemmy/moderation/moderation";

    export let href: string|undefined
    export let highlight: boolean = false
    export let nowrap: boolean = false
    export let newtab: boolean = false
    export let title: string | undefined | null= undefined
    export let id: string = ""
    export let domainOnly:boolean = false;
    export let text:string | undefined = undefined
    export let preview:boolean = false
    export let previewIframe: boolean = false
    export let preventDefault: boolean = false

    const dispatcher = createEventDispatcher()

</script>
{#if href}
    <a {href}
        id={id}
        class="break-words {highlight ? 'text-sky-700 dark:text-sky-500' : ''} text-left hover:underline max-w-full 
            {$$props.class}
            {nowrap ? 'truncate' : ''}
        "
        rel="nofollow noreferrer"
        target="{newtab
            ? '_blank'
            : '_self'
        }"
        on:click={ (
            //@ts-ignore
            e
        ) => {
            if (preventDefault) {
                e.preventDefault()
                e.stopPropagation()
                dispatcher('click')
                return
            }
            
            // If the link is configured as a preview link, 
            if (preview) {
                e.preventDefault()
                e.stopPropagation()
                linkPreviewModal(href, previewIframe)
            }
            
            // Treat internal links as goto to avoid unwanted app reloads
            else if (href.startsWith('/')) {
                e.preventDefault()
                e.stopPropagation()
                goto(href)
            }
        }}
        title = "{title ?? href}"
    >
        <slot name="icon" />
        <slot>
            
                {text ?? (domainOnly ? new URL(href).hostname : href)}
            
        </slot>
    
    </a>
{/if}
