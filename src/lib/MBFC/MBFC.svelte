<script lang="ts">
    import type { MBFCReport } from './types'
    import type { PostView } from 'lemmy-js-client'
    
    import { lookup, generateModerationPreset, generateReportPreset } from '$lib/MBFC/client'
    import { amMod, isAdmin, remove, report } from '$lib/components/lemmy/moderation/moderation.js'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { pushState } from '$app/navigation'
    
    import Badge from '$lib/components/ui/Badge.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'

    import { 
        Icon,
        CheckBadge, 
        CheckCircle,
        ExclamationCircle,
        ExclamationTriangle,
        Flag,
        QuestionMarkCircle,
        ShieldExclamation,
        Trash
    } from 'svelte-hero-icons'
    import ReportItemForm from '$lib/components/lemmy/modal/components/ReportItemForm.svelte';
    import ModalPanel from '$lib/components/lemmy/modal/components/ModalPanel.svelte';
    import ModalPanelHeading from '$lib/components/lemmy/modal/components/ModalPanelHeading.svelte';
    import ModalScrollArea from '$lib/components/lemmy/modal/components/ModalScrollArea.svelte';
    import RemoveItemForm from '$lib/components/lemmy/modal/components/RemoveItemForm.svelte';
    


    
    export let post:PostView
    export let collapseBadges:boolean = false
    export let rightJustify: boolean = true

    $:  open = ($page.state.modals?.MBFCModal?.open ?? false) && ($page.state.modals?.MBFCModal?.id == post.post.id)

    // @ts-ignore
    let results:MBFCReport = post.mbfc ?? lookup(post?.post?.url)
    let action: 'none' | 'report' | 'remove' = 'none'


</script>

{#if results}
    <!-- Create a badge based off the credibility score--->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <Badge color={
        results.credibility == "High Credibility"
        ? 'green'
        : results.credibility == "Medium Credibility"
            ? 'yellow'
            : results.credibility == 'Low Credibility'
                ? 'red'
                : 'gray'
        }
        {rightJustify}
    >
        
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span class="flex flex-row items-center gap-1 cursor-pointer font-bold"
            title="Media Bias Fact Check: {results.credibility} - {results?.biases?.name}"
            on:click={async () => {
                pushState('', {
                    modals: {
                        ...$page.state.modals,
                        MBFCModal: {
                            open: true,
                            id: post.post.id
                        }
                    }
                })
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
            } mini size="16"/>
            
            <!--{results.credibility.replace('Credibility', '')} <span class="hidden {collapseBadges ? 'hidden' : 'lg:block'}">Credibility</span>-->
            {results.credibility.replace('Credibility', '')} 
                <span class="{collapseBadges ? 'hidden' : 'hidden lg:block'}">
                     ({results?.biases?.name.replace('Biased', '').replace('Bias','').trim()})
                </span>
        </span>
        
    </Badge>


    <Modal {open} icon={CheckBadge} card={false} title="Media Bias Fact Check" width="max-w-4xl" on:close={() => history.back()}>
        {#if action == 'none'}
        <ModalPanel>
            <ModalScrollArea>    
                <div class="flex flex-col gap-4 w-full">
                    <h2 class="flex flex-row items-center justify-between w-full">
                        <span class="font-bold text-lg">{results.name}</span>
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
                    
                    <!--Full MBFC Report Button--->
                    {#if results?.url}
                        <hr class="mt-1"/>
                        
                        <div class="flex flex-row items-center">
                            
                            <div class="flex flex-col">
                                <p class="text-sm font-bold flex flex-row gap-2 items-center">
                                    <Icon src={CheckCircle} mini width={16}/>
                                    Full Results
                                </p>
                                <p class="text-xs font-normal">Read the full report for {results.name} at Media Bias Fact Check.</p>
                                
                                <span class="mt-2 text-xs font-normal">
                                    <Link highlight href={results.url} newtab={true} title="Full MBFC report for {results.name}"/>
                                </span>
                            </div>
                            
                        </div>
                    {/if}
                    

                    <!--- User Report Post--->
                    {#if post?.post.id > 0 && post?.creator?.id && !post.post.removed && !post.post.deleted && $profile?.user && $profile.user?.local_user_view.person.id != post.creator.id}
                        <hr class="mt-1"/>
                        <div class="flex flex-row items-center gap-2">
                            <div class="flex flex-col">
                                <p class="text-sm font-bold flex flex-row items-center gap-2">
                                    <Icon src={Flag} mini width={16}/>
                                    Report Post
                                </p>
                                
                                <p class="text-xs font-normal">
                                    If you feel this post is from a non-credible source, submit a report to the community moderators that includes
                                    an abridged copy of this MBFC result.
                                </p>
                            </div>
                            
                            <div class="mx-auto"/>
                            
                            <Button color="primary" size="md" on:click={() => {
                                action = 'report'
                                //open = false;
                                //report(post, generateReportPreset(post, results))
                            }}>
                                <Icon src={Flag} size="16" mini />
                                    <span class="hidden md:block">Report</span>
                            </Button> 
                        </div>
                    {/if}

                    <!--- Moderator Purge/Remove Post --->
                    {#if post?.post.id > 0 && $profile?.user && (amMod($profile.user, post.community) || isAdmin($profile.user)) && !post.post.removed}
                        <hr class="mt-1"/>
                        <div class="flex flex-row items-center gap-2">
                            <div class="flex flex-col">
                                <p class="text-sm font-bold flex flex-row gap-2 items-center">
                                    <Icon src={ShieldExclamation} mini width={16}/>
                                    Moderation
                                </p>
                                
                                <p class="text-xs font-normal">
                                    Use the results of this lookup to populate a post moderation modal.
                                </p>
                            </div>
                            
                            <div class="mx-auto"/>
                            
                            <Button color="danger" size="md" on:click={() => {
                                action = 'remove'
                                //open = false;
                                //remove(post, false, generateModerationPreset(post, results))
                            }}>
                                <Icon src={Trash} size="16" mini />
                                <span class="hidden md:block">Remove</span>
                            </Button>   
                            
                        </div>
                    {/if}
                </div>
            </ModalScrollArea>
        </ModalPanel>
        {/if}

        {#if action == 'report'}
        <ModalPanel>
            <ModalPanelHeading on:click={() =>action = 'none'} title="Reporting Post" />   

            <ModalScrollArea>
                <ReportItemForm item={post} reason={generateReportPreset(post, results)} on:reported={() => action = 'none'} />
            </ModalScrollArea>
        </ModalPanel>
        {/if}

        {#if action == 'remove'}
        <ModalPanel>
            <ModalPanelHeading on:click={() =>action = 'none'} title="Removing Post" />   

            <ModalScrollArea>
                <RemoveItemForm item={post} removed={post.post.removed} reason={generateModerationPreset(post, results)} on:finish={()=> history.back()}/>
            </ModalScrollArea>
        </ModalPanel>
        {/if}
    </Modal>
{/if}