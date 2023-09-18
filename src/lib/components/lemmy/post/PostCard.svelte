<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    import Card from '$lib/components/ui/Card.svelte'
    
    export let post: PostView
</script>


<Card class="bg-white flex flex-col w-full p-5 gap-2.5" id={post.post.id}>
    <div class="flex flex-row w-full gap-2.5">
        <div class="flex flex-col gap-1.5 grow">


        </div>
    </div>

    <slot name="metadata"/>

    <slot name="body"/>
</Card>