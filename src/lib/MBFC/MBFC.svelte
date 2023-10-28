<script lang="ts">
    import type { PostView } from 'lemmy-js-client'
    
    import type {
        MBFCBiases,
        MBFCCredibility,
        MBFCDataSet,
        MBFCQuestionable,  
        MBFCReport,
        MBFCReporting
    } from './types'
    import MBFCData from '$lib/MBFC/data/data.json'

    import { amMod, isAdmin, remove } from '$lib/components/lemmy/moderation/moderation.js'
    import { profile } from '$lib/auth.js'
    
    import Badge from '$lib/components/ui/Badge.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'

    import { 
        Icon,
        CheckBadge, 
        CheckCircle,
        ClipboardDocumentCheck,
        ExclamationCircle,
        ExclamationTriangle,
        Fire,
        QuestionMarkCircle,
        ShieldExclamation,
        Trash
    } from 'svelte-hero-icons'

    
    export let post:PostView
    export let credibility:string = ''

    let open:boolean = false;
    let results:MBFCReport|undefined = undefined

    function lookup(domain:string):MBFCReport|undefined {
        try {
            if (!domain) return
            domain = new URL(domain).host;

            // Normalize domains to remove any "www', "amp", and other prefixes that trip up detection.  Also replace some domains with their main aliases
            domain = domain
                .replace('www.', '')
                .replace('amp.', '')
                .replace('edition.', '')
                .replace(/.*\.businessinsider\.com/, 'businessinsider.com')
                .replace(/.*\.medium\.com/, 'medium.com')
                .replace(/.*\.yahoo\.com/, 'news.yahoo.com')
                .replace(/.*\.apnews\.com/, 'apnews.com')
                .replace(/.*\.elpais\.com/, 'elpais.com')
                .replace('bbc.co.uk', 'bbc.com')
                .replace('news.antiwar.com', 'antiwar.com')
                .replace('mronline.org', 'monthlyreview.org')
                .replace('bbc.in', 'bbc.com')


            // Lookup the provided domain and return the results
            let info:MBFCReport = {} as MBFCReport
            let found:boolean = false;

            MBFCData.sources.map((item:MBFCReport) => { 
                if (item.domain==domain) {
                    info=item
                    found = true
                }
            });
            
            // Resolve bias, credibility descriptions
            if (found) {
                
                // Biases
                MBFCData.biases.map((item:MBFCBiases) => { 
                    if (info?.bias == item.bias) info.biases = item;
                    
                })
                
                // Map credibility rating to pretty-printed string
                MBFCData.credibility.map((item:MBFCCredibility) => { 
                    if (info?.credibility == item.credibility) info.credibility = item.pretty;
                    
                })
                
                // Map questionable tags to pretty-printed strings
                MBFCData.questionable.map((item:MBFCQuestionable) => { 
                    if (info?.questionable) {
                        for (let i:number=0; i < info.questionable.length; i++) {
                            let question = info.questionable[i];
                            if (question == item.questionable) info.questionable[i] = item.pretty;
                        }
                    }
                })

                // Map Reporting rating to pretty-printed string
                MBFCData.reporting.map((item:MBFCReporting) => { 
                    if (info?.reporting == item.reporting) info.reporting = item.pretty;
                    
                })

                return info
            }
            else {
                return undefined
            }
        }
        catch (err) {
            console.log(err);
            return undefined;
        }
    }

    function generateModerationPreset():string {
        let template:string = "Post has been removed because it is not from a reputable or credible source:";
        if (post.post.url) {
            template += `\nSource: ${new URL(post.post.url).host}`
        }
        
        if (results) {
            if (results.credibility) {
                template += `\nCredibility: ${results.credibility}`
            }

            if (results.reporting) {
                template += `\nFactual Reporting: ${results.reporting}`
            }

            if (results.questionable?.length > 0) {
                template += `\nReasoning: `
                for (let i:number=0; i<results.questionable.length; i++) {
                    template += `${results.questionable[i]}, `   
                }
            }

            if (results.url) {
                template += `\nFull Report: ${results.url}`
            }
        }

        return template;

    }

    if (post?.post?.url) {
        results = lookup(post.post.url)
        if (results) credibility = results.credibility;
    }

    

</script>

{#if results}
    <!-- Create a badge based off the credibility score--->
    <Badge color={
        results.credibility == "High Credibility"
        ? 'green'
        : results.credibility == "Medium Credibility"
            ? 'yellow'
            : results.credibility == 'Low Credibility'
                ? 'red'
                : 'gray'
        }>
        <span class="flex flex-row items-center gap-1 cursor-pointer font-bold"
            title="Media Bias Fact Check: {results.credibility}"
            on:click={async () => {
                open=true;
            }}
        >
            <Icon src={
                results.credibility == "High Credibility"
                ? CheckBadge
                : results.credibility == "Medium Credibility"
                    ? ExclamationCircle
                    : results.credibility == 'Low Credibility'
                        ? ExclamationTriangle
                        : QuestionMarkCircle
            } mini size="12"/>
            
            {results.credibility.replace('Credibility', '')} <span class="hidden lg:block">Credibility</span>
        </span>
        
    </Badge>


    <Modal bind:open={open} icon={CheckBadge} title="Media Bias Fact Check">
        <h2 class="flex flex-row items-center justify-between w-full">
            <span class="font-bold text-lg">Report for {results.name}</span>
        </h2>
        
        
        {#if ['left', 'left-center', 'center', 'right-center', 'right', 'fake-news'].includes(results?.biases?.bias ?? '')}
            <div class="bg-slate-300 p-2 rounded-md">
                <img src="/img/MBFC/{results?.biases?.bias}.webp" alt="MBFC Gauge for {results.name} reporting as {results?.biases?.pretty}" class="mx-auto"/>
            </div>

        {/if}

        {#if ['satire', 'pro-science'].includes(results?.biases?.bias ?? '')}
            <div class="bg-slate-300 p-2 rounded-md">
                <img src="/img/MBFC/center.webp" alt="MBFC Gauge for {results.name} reporting as {results?.biases?.pretty}" class="mx-auto"/>
            </div>

        {/if}

        <div class="flex flex-row flex-wrap sm:flex-nowrap gap-2">
            <div class="flex flex-col gap-2 w-full sm:w-[60%]">
                {#if results.biases?.description}
                    <p class="text-base font-bold">{results?.biases?.name}</p>
                    <p class="text-sm">{results?.biases.description}</p>
                    <p class="text-xs">
                        <strong>Learn more</strong>: 
                        <Link href={results.biases.url} newtab={true} title={results.biases.pretty} highlight>
                            {results.biases.url}
                        </Link>
                    </p>
                {/if}
            </div>

            <div class="flex flex-col gap-2 w-full sm:w-[40%]">
                <ul class="pl-4 mt-2 text-sm">
                    
                    <!--- Credibility--->
                    {#if results.credibility}
                        <li class="flex flex-row gap-2 justify-between">
                            <span>
                                <strong>Credibility Rating</strong>: {results.credibility}
                            </span>
                            <span
                                class:text-green-500={results.credibility == 'High Credibility'}
                                class:text-amber-500={['Medium Credibility', 'N/A'].includes(results.credibility)}
                                class:text-red-500={results.credibility == 'Low Credibility'}
                            >
                                <Icon src={
                                    ['High Credibility', 'N/A'].includes(results.credibility)
                                        ? CheckBadge
                                        : results.credibility == 'Medium Credibility'
                                            ? ExclamationCircle
                                            : ExclamationTriangle
                                } mini width={24} />
                            </span>

                        </li>
                    {/if}
        
                    <!--Factual Reporting-->
                    {#if results.reporting}
                        <li class="flex flex-row gap-2 justify-between mt-2">
                            <span>
                                <strong>Factual Reporting</strong>: {results.reporting}
                            </span>
                            
                            <span
                                class:text-green-500={['Very-High', 'High'].includes(results.reporting)}
                                class:text-amber-500={['Mostly-Factual', 'Mixed'].includes(results.reporting)}
                                class:text-red-500={['Very-Low', 'Low'].includes(results.reporting)}
                            >
                                <Icon src={
                                    ['Very-High', 'High'].includes(results.reporting)
                                        ? CheckBadge
                                        : ['Mostly-Factual', 'Mixed'].includes(results.reporting)
                                            ? ExclamationCircle
                                            : ExclamationTriangle
                                    } mini width={24} />
                            </span>
                            
                        </li>
                    {/if}

                    <!---Bias Rating--->
                    {#if results.biases}
                        <li class="flex flex-row gap-2 justify-between mt-2">
                            <span>
                                <strong>Bias Rating</strong>: {results.biases.name}
                            </span>
                            
                            <span
                                class:text-green-500={['Least Biased', 'Left-Center Bias', 'Right-Center Bias', 'Pro-Science'].includes(results.biases.name)}
                                class:text-amber-500={['Left Bias', 'Right Bias', 'Satire'].includes(results.biases.name)}
                                class:text-red-500={['Questionable Sources', 'Conspiracy-Pseudoscience'].includes(results.biases.name)}
                            >
                                <Icon src={
                                    ['Least Biased', 'Left-Center Bias', 'Right-Center Bias', 'Pro-Science'].includes(results.biases.name)
                                        ? CheckBadge
                                        : ['Left Bias', 'Right Bias', 'Satire'].includes(results.biases.name)
                                            ? ExclamationCircle
                                            : ExclamationTriangle
                                    } mini width={24} />
                            </span>
                        </li>
                    {/if}
        
                    <!---Reasons for Questionable Status--->
                    {#if results.questionable?.length > 0}
                        <li class="mt-2">
                            <strong>Questionable Reasoning</strong>:
                            <ul class="list-disc pl-4 text-sm">
                                {#each results.questionable as reason}
                                    <li>{reason}</li>
                                {/each}
                            </ul>
                        </li>
                    {/if}

                </ul>
            </div>
        
        </div>
        
        {#if results?.url}
            <hr class="mt-1"/>
            
            <div class="flex flex-row items-center">
                
                <div class="flex flex-col">
                    <p class="text-sm font-bold flex flex-row gap-2">
                        <Icon src={CheckCircle} mini width={16}/>
                        Full Report
                    </p>
                    <p class="text-xs font-normal">Read the full report for {results.name} at Media Bias Fact Check.</p>
                </div>
                
                <div class="mx-auto"/>
                
                
                <Button color="tertiary" size="sm" href={results.url} newtab={true} title="Full MBFC report for {results.name}">
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
    </Modal>
{/if}