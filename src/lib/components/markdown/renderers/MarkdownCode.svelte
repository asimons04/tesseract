<script lang="ts">
    import type { Tokens } from 'marked'
    import { userSettings } from '$lib/settings'
    import hljs from 'highlight.js'
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
  
<pre><code class="language-{token.lang}">{@html rendered}</code></pre>
