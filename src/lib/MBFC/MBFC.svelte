<script lang="ts">
    import type { MBFCReport } from './types'
    import type { PostView } from 'lemmy-js-client'
    
    import { lookup } from '$lib/MBFC/client'
    import { MBFCModal } from '$lib/components/lemmy/moderation/moderation.js'
    
    import Badge from '$lib/components/ui/Badge.svelte'
    
    import { 
        Icon,
        CheckBadge, 
        ExclamationCircle,
        ExclamationTriangle,
        QuestionMarkCircle,
    } from 'svelte-hero-icons'
    
    export let post:PostView
    export let collapseBadges:boolean = false
    export let rightJustify: boolean = true

    // @ts-ignore
    let results:MBFCReport = post.mbfc ?? lookup(post?.post?.url)

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
            on:click={() => { MBFCModal(post) }}
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
{/if}