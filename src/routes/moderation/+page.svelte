<script lang="ts">
    import { fly } from 'svelte/transition'
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import { searchParam } from '$lib/util.js'
    import { userSettings } from '$lib/settings.js'
    import { 
        isCommentReport, 
        isPostReport, 
    } from '$lib/lemmy/item.js'
    
    import Button from '$lib/components/input/Button.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import Report from './Report.svelte'


    import { 
        Icon,
        Check,
        EnvelopeOpen, 
        ExclamationTriangle,
        Inbox, 
        Newspaper 
    } from 'svelte-hero-icons'

    export let data
    
    $: type = $page.url.searchParams.get('type')?.toLowerCase() 

</script>

<svelte:head>
    <title>Reports</title>
</svelte:head>

<div class="p-2 flex flex-col gap-4">
    
    
    <div class="flex flex-row flex-wrap justify-between">
        <h1 class="font-bold text-2xl">Reports</h1>

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
    <div class="flex flex-col gap-2 w-full max-h-full">
        {#each data.items as item}
            {#if 
                    (
                        (!type || type == 'unread') && 
                        (isCommentReport(item) && !item.comment_report.resolved) || (isPostReport(item) && !item.post_report.resolved)
                    ) || type == 'all'                
            }
                <div class="mt-[-0.25rem]" transition:fly={{delay: 300, duration:500, x: '50%'}}>    
                    <Report bind:item={item} />
                </div>
            {/if}
        {/each}
    </div>
    
{:else}
    <Placeholder
        icon={Inbox}
        title="No new reports"
        description="When submissions are reported, you can act on them here."
    />
{/if}
