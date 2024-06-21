<script lang="ts">
    import { page } from '$app/stores'
    import { searchParam } from '$lib/util.js'
    

    import Application from './Application.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte';
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'


    import { ClipboardDocumentCheck, Icon } from 'svelte-hero-icons'

    export let data
</script>



<h1 class="flex flex-row items-center font-bold text-xl gap-2">
    <Icon src={ClipboardDocumentCheck} mini width={36}/>
    Applications
</h1>


<FeedContainer>
    {#if data.applications && data.applications.length > 0}
        <div class="flex flex-col gap-4">
            {#each data.applications as application (application.registration_application.id)}
                <Application {application} />
            {/each}
        </div>

        {#if data.applications.length >= 40}
            <div class="mt-auto">
                <Pageination page={data.page} on:change={(p) => searchParam($page.url, 'page', p.detail.toString())} />
            </div>
        {/if}

    {:else}
        <div class="my-auto">
            <Placeholder icon={ClipboardDocumentCheck} title="No new applications" description="Applications to join your instance will appear here." />
        </div>
    {/if}
</FeedContainer>

