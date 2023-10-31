<script lang="ts">
    import { fly } from 'svelte/transition'
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import { searchParam } from '$lib/util.js'
    import { userSettings } from '$lib/settings.js'
    
    
    import Badge from '$lib/components/ui/Badge.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import Report from './Report.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    import { 
        Icon,
        Check,
        EnvelopeOpen, 
        ExclamationTriangle,
        Inbox, 
        Newspaper 
    } from 'svelte-hero-icons'

    export let data
</script>

<svelte:head>
    <title>Reports</title>
</svelte:head>

<div class="p-2 mb-4 flex flex-col gap-4">
    <h1 class="font-bold text-2xl">Reports</h1>
    
    <div class="flex flex-row flex-wrap justify-between">
        <div>
            <MultiSelect
                selected={data.type}
                options={['all', 'unread']}
                optionNames={['All', 'Unread']}
                on:select={(e) => searchParam($page.url, 'type', e.detail, 'page')}
                headless={true}
            />
        </div>

        <div />
            
        <div class="flex flex-col">
            <Button href="/modlog" class="h-max ml-auto">
                <Icon src={Newspaper} size="16" mini />
                Modlog
            </Button>
        </div>
    </div>
</div>

{#if data?.items?.length > 0}
    <div class="flex flex-col gap-8 sm:max-w-full md:max-w-[80%] lg:max-w-[70%] xl:max-w-[60%] mx-auto">
        {#each data.items as item}
            <div in:fly={{ y: -6, opacity: 0, duration: 500 }}>
                <Report bind:item={item} />
            </div>
        {/each}
    </div>
{:else}
    <Placeholder
        icon={Inbox}
        title="No new reports"
        description="When submissions are reported, you can act on them here."
    />
{/if}
