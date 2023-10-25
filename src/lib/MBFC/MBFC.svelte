<script lang="ts">
    import {
        type MBFCReport,
    } from '$lib/fediseer/client.js'

    
    import Link from '$lib/components/input/Link.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'

    import { 
        Icon, 
        ClipboardDocumentCheck,
        HandThumbUp,
        HandThumbDown,
        HandRaised
    } from 'svelte-hero-icons'

    
    export let data: MBFCReport
    export let open:boolean = false;
</script>

<Modal bind:open={open}>
    <h1 class="font-bold text-3xl mt-[-50px] w-fit">Media Bias Fact Check</h1>
    
    {#if data}
        <h2 class="font-bold text-xl w-fit">Report for {data.name}</h2>
        {#if ['left', 'left-center', 'center', 'right-center', 'right', 'fake-news'].includes(data.biases.bias)}
            <div class="bg-slate-300 p-2 rounded-md">
                <img src="/img/MBFC/{data.biases.bias}.webp" alt="MBFC Gauge for {data.name} reporting as {data.biases.pretty}" class="mx-auto"/>
            </div>

        {/if}

        {#if ['satire', 'pro-science'].includes(data.biases.bias)}
            <div class="bg-slate-300 p-2 rounded-md">
                <img src="/img/MBFC/center.webp" alt="MBFC Gauge for {data.name} reporting as {data.biases.pretty}" class="mx-auto"/>
            </div>

        {/if}


        {#if data.biases?.description}
            <p class="text-sm">{data.biases.description}</p>
            <p class="text-xs">
                <strong>Learn more</strong>: 
                <Link href={data.biases.url} newtab={true} title={data.biases.pretty} highlight>
                    {data.biases.url}
                </Link>
            </p>
        {/if}
        <hr/>

        <ul class="list-disc pl-4 mt-2 text-sm">
            {#if data.biases}
                <li>
                    <strong>Bias Rating</strong>: {data.biases.name}
                </li>
            {/if}

            {#if data.credibility}
                <li class="mt-2">
                    <strong>Credibility Rating</strong>: {data.credibility}
                </li>
            {/if}

            {#if data.reporting}
                <li class="mt-2">
                    <strong>Factual Reporting</strong>: {data.reporting}
                </li>
            {/if}

            {#if data.questionable?.length > 0}
                <li class="mt-2">
                    <strong>Questionable Reasoning</strong>:
                    <ul class="list-disc pl-4 text-sm">
                        {#each data.questionable as reason}
                            <li>{reason}</li>
                        {/each}
                    </ul>
                </li>
            {/if}
        </ul>
        
        {#if data.url}
            <hr class="mt-2"/>
            <p class="text-sm">
                Read the full report for {data.name} at Media Bias Fact Check.    
            </p>
            
            <p class="ml-2 text-sm">
                <Link href={data.url} newtab={true} title="Full MBFC report for {data.name}" highlight>
                    <span class="flex flex-row gap-2">
                        <Icon src={ClipboardDocumentCheck} mini width={16}/>
                        Full MBFC Report
                    </span>
                </Link>
            </p>
        {/if}
        
        
    {:else}
        <p class="text-sm font-normal my-auto">
            No data found for this entity.
        </p>
    {/if}
</Modal>