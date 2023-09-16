<script lang="ts">
    import Button from '$lib/components/input/Button.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import StickyCard from '$lib/components/ui/StickyCard.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import { getClient } from '$lib/lemmy.js'
    import type { SiteView, Tagline } from 'lemmy-js-client'
    import {
        Calendar,
        ChatBubbleOvalLeftEllipsis,
        ChevronDoubleRight,
        Icon,
        Newspaper,
        PencilSquare,
        UserGroup,
    } from 'svelte-hero-icons'
    import { userSettings } from '$lib/settings.js'

    export let site: SiteView
    export let taglines: Tagline[] | undefined = undefined
</script>

<!--- Button to expand/collapse the site-info sidebar --->
<aside class="sticky top-[4.7rem] flex flex-col pr-4">
    <div class="grid justify-items-end w-full mr-2">
        <Button
            alignment="right"
            on:click={() =>
                ($userSettings.uiState.expandCommunitySidebar = !$userSettings.uiState.expandCommunitySidebar)
            }
            class="w-max hover:bg-slate-200"
            aria-label={$userSettings.uiState.expandCommunitySidebar
                ? 'Collapse community sidebar'
                : 'Expand community sidebar'
            }
            title={$userSettings.uiState.expandCommunitySidebar
                ? 'Collapse community sidebar'
                : 'Expand community sidebar'
            }
        >
            <Icon
                src={ChevronDoubleRight}
                mini
                size="16"
                class="transition-transform {$userSettings.uiState.expandCommunitySidebar
                    ? ''
                    : 'rotate-180'}"
            />
        </Button>
    </div>
</aside>



<StickyCard class="p-3 mb-3
    {$userSettings.uiState.expandCommunitySidebar
        ? 'hidden lg:block xl:block'
        : 'hidden'}
    "
>
    <Card>
        <div class="flex flex-row gap-3 items-center p-3">
            {#if site.site.icon}
                <Avatar width={42} url={site.site.icon} alt={site.site.name} />
            {/if}
            
            <div class="flex flex-col">
                <h1 class="font-bold text-base">{site.site.name}</h1>
                <span class="text-sm opacity-60">
                    {new URL(site.site.actor_id).hostname}
                </span>
            </div>
        </div>

        <div class="mt-2 p-3">
            <Markdown source={site.site.description} />
        </div>
       
        <div class="p-3 ml-auto mr-auto">
            <div class="text-sm flex flex-row flex-wrap gap-3 justify-between">
                <span class="flex flex-row items-center gap-2 text-sm">
                    <Icon src={Calendar} width={16} height={16} mini />
                    <RelativeDate date={new Date(site.site.published)} />
                </span>
                
                <span class="flex flex-row items-center gap-2">
                    <Icon src={UserGroup} width={16} height={16} mini />
                    <FormattedNumber number={site.counts.users} />
                </span>

                <span class="flex flex-row items-center gap-2">
                    <Icon src={PencilSquare} width={16} height={16} mini />
                    <FormattedNumber number={site.counts.posts} />
                </span>

                <span class="flex flex-row items-center gap-2">
                    <Icon src={ChatBubbleOvalLeftEllipsis} width={16} height={16} mini />
                    <FormattedNumber number={site.counts.comments} />
                </span>

                <span class="flex flex-row items-center gap-2">
                    <Icon src={Newspaper} width={16} height={16} mini />
                    <FormattedNumber number={site.counts.communities} />
                </span>
            </div>
        </div>
    </Card>
    
    <div class="mt-2"></div>
    
    {#if taglines && taglines.length > 0}
        <Markdown source={taglines[Math.floor(Math.random() * taglines.length)].content} />
        <hr class="border-slate-300 dark:border-zinc-700" />
    {/if}
    
    <Markdown source={site.site.sidebar} />
</StickyCard>
