<script lang="ts">
    import type { Tokens } from 'marked'
    
    import hljs from 'highlight.js'
    export let token: Tokens.Code
    let rendered: string

    $: try {
        rendered = token.lang
            ? hljs.highlight(token.text, {language: token.lang}).value
            : hljs.highlight(token.text, {language:'plaintext'}).value
        
    }
    catch (err){
        rendered = hljs.highlight(token.text, {language:'plaintext'}).value
    }
</script>
  
<pre><code class="language-{token.lang}">{@html rendered}</code></pre>
