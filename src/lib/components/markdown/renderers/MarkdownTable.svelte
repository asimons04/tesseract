<script lang="ts">
    import type { Tokens } from 'marked'
    import {
        MarkdownTokens,
        type MarkdownOptions,
        type Renderers,
    } from '@magidoc/plugin-svelte-marked'

    export let token: Tokens.Table
    export let options: MarkdownOptions
    export let renderers: Renderers
</script>

<div class="max-w-[90%] overflow-x-scroll">
    <table>
        <thead>
            <tr>
                {#each token.header as item}
                <th scope="col">
                    <MarkdownTokens tokens={item.tokens} {options} {renderers} />
                </th>
                {/each}
            </tr>
        </thead>
        
        <tbody>
        {#each token.rows as row}
            <tr>
            {#each row as col}
                <td>
                    <MarkdownTokens tokens={col.tokens} {options} {renderers} />
                </td>
            {/each}
            </tr>
        {/each}
        </tbody>
    </table>
</div>