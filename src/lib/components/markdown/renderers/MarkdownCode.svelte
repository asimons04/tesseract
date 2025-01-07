<script lang="ts">
    import type { Tokens } from 'marked'
    
    import { inDarkTheme } from '$lib/ui/colors'
    import { userSettings } from '$lib/settings'
    
    import hljs from 'highlight.js'

    // Dynamically import either Github or Github dark depending on current color theme.
    // Note:  Unfortunately, this is not reactive to changing the app theme without refreshing the page. 
    const codeTheme = inDarkTheme()
        ? import('highlight.js/styles/github-dark.css').then(({default: C}) => C)
        : import('highlight.js/styles/github.css').then(({default: C}) => C)

   
    export let token: Tokens.Code
    let rendered: string

    $: try {
        rendered = token.lang && $userSettings.highlightCode
            ? hljs.highlight(token.text, {language: token.lang}).value
            : hljs.highlight(token.text, {language:'plaintext'}).value
        
    }
    catch (err){
        try {
            rendered = hljs.highlight(token.text, {language:'plaintext'}).value
        }
        catch {
            rendered = token.text
        }
    }
</script>

{#await codeTheme}
    <span/>
{:then}
    <pre class="w-full"><code class="text-black dark:text-white language-{token.lang}">{@html rendered}</code></pre>
{/await}

