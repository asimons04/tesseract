<script lang="ts">
    import type { Tokens } from 'marked'
    import {
        MarkdownToken,
        type MarkdownOptions,
        type Renderers,
    } from '@magidoc/plugin-svelte-marked'
    
    export let token: Tokens.HTML
    export const options: MarkdownOptions | undefined = undefined
    export const renderers: Renderers | undefined = undefined
    </script>
    
    {token.text}