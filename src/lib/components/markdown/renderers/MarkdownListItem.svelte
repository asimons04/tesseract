<script lang="ts">
    

import type { Tokens } from 'marked'

export let token: Tokens.ListItem

$:  token.text = token.text.trim()

</script>
    
<li><slot /></li>