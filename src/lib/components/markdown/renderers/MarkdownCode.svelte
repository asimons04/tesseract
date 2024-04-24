<script lang="ts">
    import type { Tokens } from 'marked'
    
    import hljs from 'highlight.js'
    export let token: Tokens.Code

    $: rendered = hljs.highlight(token.text, {language: token.lang ?? 'plaintext'}).value
</script>
  
<pre><code class="language-{token.lang}">{@html rendered}</code></pre>
