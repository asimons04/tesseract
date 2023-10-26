<script lang="ts">
    import {
        type MBFCReport,
    } from '$lib/MBFC/client.js'
    
    import type { PostView } from 'lemmy-js-client'
   
    import { amMod, ban, isAdmin, remove } from '$lib/components/lemmy/moderation/moderation.js'
    import { profile } from '$lib/auth.js'
    
    import Button from '$lib/components/input/Button.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'

    import { 
        Icon,
        CheckBadge, 
        CheckCircle,
        ClipboardDocumentCheck,
        ExclamationTriangle,
        Fire,
        ShieldExclamation,
        Trash
    } from 'svelte-hero-icons'

    
    export let data: MBFCReport
    export let open:boolean = false;
    export let post:PostView

    function generateModerationPreset():string {
        let template:string = "Post is not from a reputable or credible source of news:";
        if (post.post.url) {
            template += `\nSource: ${new URL(post.post.url).host}`
        }
        
        if (data?.credibility) {
            template += `\nCredibility: ${data.credibility}`
        }

        if (data?.reporting) {
            template += `\nFactual Reporting: ${data.reporting}`
        }

        if (data?.questionable?.length > 0) {
            template += `\nReasoning:`
            for (let i:number=0; i<data.questionable.length; i++) {
                template += `\n - ${data.questionable[i]}`   
            }
        }

        return template;

    }

</script>

<Modal bind:open={open} icon={CheckBadge} title="Media Bias Fact Check">
    
    {#if data}
        <h2 class="flex flex-row items-center justify-between w-full">
            <span class="font-bold text-lg">Report for {data.name}</span>
        </h2>
        
        
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

        <div class="flex flex-row flex-wrap sm:flex-nowrap gap-2">
            <div class="flex flex-col gap-2 w-full sm:w-[60%]">
                {#if data.biases?.description}
                    <p class="text-base font-bold">{data?.biases?.name}</p>
                    <p class="text-sm">{data?.biases.description}</p>
                    <p class="text-xs">
                        <strong>Learn more</strong>: 
                        <Link href={data.biases.url} newtab={true} title={data.biases.pretty} highlight>
                            {data.biases.url}
                        </Link>
                    </p>
                {/if}
            </div>

            <div class="flex flex-col gap-2 w-full sm:w-[40%]">
                <ul class="pl-4 mt-2 text-sm">
        
                    {#if data.credibility}
                        <li class="flex flex-row gap-2 justify-between">
                            <span>
                                <strong>Credibility Rating</strong>: {data.credibility}
                            </span>
                            <span
                                class:text-green-500={data.credibility == 'High Credibility'}
                                class:text-amber-500={data.credibility == 'Medium Credibility'}
                                class:text-red-500={data.credibility == 'Low Credibility'}
                            >
                                <Icon src={
                                ['High Credibility', 'Medium Credibility'].includes(data.credibility)
                                    ? CheckBadge
                                    : ExclamationTriangle
                                } mini width={24} />
                            </span>

                        </li>
                    {/if}
        
                    {#if data.reporting}
                        <li class="flex flex-row gap-2 justify-between mt-2">
                            <span>
                                <strong>Factual Reporting</strong>: {data.reporting}
                            </span>
                            
                            <span
                                class:text-green-500={['Very-High', 'High'].includes(data.reporting)}
                                class:text-amber-500={['Mostly-Factual', 'Mixed'].includes(data.reporting)}
                                class:text-red-500={['Very-Low', 'Low'].includes(data.reporting)}
                            >
                                <Icon src={
                                ['Very-High', 'High', 'Mostly-Factual', 'Mixed'].includes(data.reporting)
                                    ? CheckBadge
                                    : ExclamationTriangle
                                } mini width={24} />
                            </span>
                            
                        </li>
                    {/if}

                    {#if data.biases}
                        <li class="flex flex-row gap-2 justify-between mt-2">
                            <span>
                                <strong>Bias Rating</strong>: {data.biases.name}
                            </span>
                            
                            <span
                                class:text-green-500={['Least Biased', 'Left-Center Bias', 'Right-Center Bias', 'Pro-Science'].includes(data.biases.name)}
                                class:text-amber-500={['Left Bias', 'Right Bias', 'Satire'].includes(data.biases.name)}
                                class:text-red-500={['Questionable Sources', 'Conspiracy-Pseudoscience'].includes(data.biases.name)}
                            >
                                <Icon src={
                                ['Least Biased', 'Left-Center Bias', 'Right-Center Bias', 'Pro-Science', 'Left Bias', 'Right Bias', 'Satire'].includes(data.biases.name)
                                    ? CheckBadge
                                    : ExclamationTriangle
                                } mini width={24} />
                            </span>
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
            </div>
        
        </div>
        
        {#if data.url}
            <hr class="mt-1"/>
            
            <div class="flex flex-row items-center">
                
                <div class="flex flex-col">
                    <p class="text-sm font-bold flex flex-row gap-2">
                        <Icon src={CheckCircle} mini width={16}/>
                        Full Report
                    </p>
                    <p class="text-xs font-normal">Read the full report for {data.name} at Media Bias Fact Check.</p>
                </div>
                
                <div class="mx-auto"/>
                
                
                <Button color="primary" size="sm" href={data.url} newtab={true} title="Full MBFC report for {data.name}">
                    <Icon src={ClipboardDocumentCheck} mini size="16"/>
                    <span class="hidden md:block">Full MBFC Report</span>
                </Button>
                
            </div>
        {/if}
        
        {#if $profile?.user && (amMod($profile.user, post.community) || isAdmin($profile.user)) && !post.post.removed}
            <hr class="mt-1"/>
                <div class="flex flex-row items-center gap-2">
                    <div class="flex flex-col">
                        <p class="text-sm font-bold flex flex-row gap-2">
                            <Icon src={ShieldExclamation} mini width={16}/>
                            Moderation
                        </p>
                        
                        <p class="text-xs font-normal">
                            Use the results of this lookup to populate a post moderation modal.
                        </p>
                    </div>
                    
                    <div class="mx-auto"/>
                    
                    <Button color="danger" size="sm" on:click={() => {
                        open = false;
                        remove(post, true, generateModerationPreset())
                    }}>
                        <Icon src={Fire} size="16" mini />
                            <span class="hidden md:block">Purge</span>
                    </Button>   


                    <Button color="danger" size="sm" on:click={() => {
                        open = false;
                        remove(post, false, generateModerationPreset())
                    }}>
                        <Icon src={Trash} size="16" mini />
                        <span class="hidden md:block">Remove</span>
                    </Button>   
                    
                </div>
            {/if}
        
    {:else}
        <p class="text-sm font-normal my-auto">
            No data found for this entity.
        </p>
    {/if}
</Modal>