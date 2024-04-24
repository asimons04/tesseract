<script lang="ts">
    import {
        MarkdownTokens,
        type MarkdownOptions,
        type Renderers,
    } from '@magidoc/plugin-svelte-marked'
    
    import type { Tokens, Token } from 'marked'
  
    export let token: Tokens.Generic & {
      type: 'spoiler'
      raw: string
      title: any
      tokens: Token[]
    }
    export let renderers: Renderers
    export let options: MarkdownOptions

    // Marked uses a key=value option setup for the params, so we need to disregard that and extract the spoiler title manually from the raw string
    function extractTitle(text:string) {
        const rule = /^:::spoiler (?<title>.*)\n?/i
        const match = rule.exec(text)
        if (match && match.groups?.title) {
            return match.groups.title
        }
        return 'Spoiler'
    }

    $: title = extractTitle(token.raw)
    
</script>
  
<details>
    <summary>{title}</summary>
        <MarkdownTokens tokens={token.tokens} {renderers} {options} />
</details>
