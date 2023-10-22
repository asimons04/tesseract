<script lang="ts">
    import { createEventDispatcher } from 'svelte'
    export let divider:boolean = true;
    type T = $$Generic
    const dispatcher = createEventDispatcher<{ action: any }>()

    function action(detail: any) {
        dispatcher('action', detail)
    }
</script>

<ul class="{divider ? 'divide-y divide-slate-200 dark:divide-zinc-900' : ''}  flex flex-col">
    <slot {action} />
</ul>
