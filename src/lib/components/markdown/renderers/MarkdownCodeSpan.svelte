<script lang="ts">
    import type { Tokens } from 'marked'
        
    export let token: Tokens.Codespan
    </script>
    
    <code class="text-black dark:text-white">{token.raw.slice(1, token.raw.length - 1)}</code>