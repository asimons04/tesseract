<script lang="ts">
    import { page } from '$app/stores'
    import { sortOptions, sortOptionNames } from '$lib/lemmy'
    import { searchParam } from '$lib/util.js'
    import MultiSelect from '../input/MultiSelect.svelte'

    export let selected: string
    export let navigate: boolean = true
    export let headless:boolean = false
    export let items:number = 3
    export let fullWidth: boolean = false

    

</script>

<MultiSelect
    items={items}
    fullWidth={fullWidth}
    options={sortOptions}
    optionNames={sortOptionNames}
    bind:selected
    on:select={(e) => {
        if (navigate) searchParam($page.url, 'sort', e.detail, 'page')
    }}
    class="w-full"
    headless={headless}
>
  <slot name="icon" slot="icon"/>
  <slot name="label" slot="label"/>
</MultiSelect>
