<script lang="ts">
    
    import type { SiteView, PersonView, Tagline } from 'lemmy-js-client'
    import { getClient } from '$lib/lemmy.js'
    import {imageProxyURL} from '$lib/image-proxy'
    import { slide } from 'svelte/transition'
    import { userSettings } from '$lib/settings.js'
    
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import CollapseButton from '../ui/CollapseButton.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import SidebarFooter from '$lib/components/ui/SidebarFooter.svelte';
    import StickyCard from '$lib/components/ui/StickyCard.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    import {
        BuildingOffice,
        Calendar,
        ChatBubbleOvalLeftEllipsis,
        ChevronDoubleRight,
        ChevronUp,
        ChevronDown,
        Icon,
        InformationCircle,
        Newspaper,
        PencilSquare,
        Server,
        ShieldCheck,
        UserGroup,
    } from 'svelte-hero-icons'
    

    export let site: SiteView
    export let taglines: Tagline[] | undefined = undefined
    export let admins: PersonView[] = []
    export let version: string
</script>

<StickyCard class="-mt-1
    {$userSettings.uiState.expandCommunitySidebar
        ? 'block'
        : 'hidden'
    }
    {$$props.class}
    "
>
    <Card backgroundImage={($userSettings.uiState.showBannersInCards && site?.site?.banner) ? imageProxyURL(site.site.banner, 384, 'webp') : ''}>
        <div class="flex flex-row gap-3 items-center p-3">
            {#if site.site.icon}
                <Avatar width={64} url={site.site.icon} alt={site.site.name} circle={false} />
            {/if}
            
            
            <div class="flex flex-col w-full">
                <div class="flex flex-row">
                    <span class="flex flex-col">
                        <h1 class="font-bold text-base">{site.site.name}</h1>
                        <span class="text-sm opacity-60">
                            {new URL(site.site.actor_id).hostname}
                        </span>
                    </span>
                    <div class="ml-auto flex flex-col">
                        <span class="flex flex-row items-center gap-2 text-sm" title="Created">
                            <Icon src={Calendar} width={16} height={16} mini />
                            <RelativeDate date={site.site.published} />
                        </span>
                        
                        <span class="flex flex-row items-center gap-2 text-sm" title="Version">
                            <Icon src={Server} width={16} height={16} mini />
                            {version}
                        </span>
                    </div>
                </div>
                <!---
                <span class="text-sm opacity-60">
                    {new URL(site.site.actor_id).hostname}
                </span>
                --->
            </div>

                
        </div>

        <div class="mt-2 p-3 italic">
            <Markdown source={site.site.description} />
        </div>
       
        <div class="flex flex-row p-3 mx-auto">
            <div class="text-sm flex flex-row flex-wrap gap-8 mx-auto">
                <span class="flex flex-row items-center gap-2" title="Users">
                    <Icon src={UserGroup} width={16} height={16} mini />
                    <FormattedNumber number={site.counts.users} />
                </span>

                <span class="flex flex-row items-center gap-2" title="Posts">
                    <Icon src={PencilSquare} width={16} height={16} mini />
                    <FormattedNumber number={site.counts.posts} />
                </span>

                <span class="flex flex-row items-center gap-2" title="Comments">
                    <Icon src={ChatBubbleOvalLeftEllipsis} width={16} height={16} mini />
                    <FormattedNumber number={site.counts.comments} />
                </span>

                <span class="flex flex-row items-center gap-2" title="Communities">
                    <Icon src={Newspaper} width={16} height={16} mini />
                    <FormattedNumber number={site.counts.communities} />
                </span>
            </div>
        </div>
    </Card>
    
    <div class="mt-2"/>
    
    {#if taglines && taglines.length > 0}
        <Markdown source={taglines[Math.floor(Math.random() * taglines.length)].content} />
        <hr class="border-slate-300 dark:border-zinc-700" />
    {/if}

    <!--- Collapsible buttons for admins and site info --->
    <div class="hidden xl:block w-full overflow-y-auto">
        {#if admins.length > 0}
           <CollapseButton icon={ShieldCheck} title="Admins">
                {#each admins as admin}
                    <UserLink user={admin.person} avatar={true} badges={false} showInstance={false} />
                {/each}
           </CollapseButton>
        {/if}
        
        {#if site?.site?.sidebar}
            <CollapseButton icon={InformationCircle} title="Site Info" expanded={false}>
                <Markdown source={site.site.sidebar} />
            </CollapseButton>
        {/if}

        {#if site?.local_site?.legal_information}
            <CollapseButton icon={BuildingOffice} title="Legal" expanded={false}>
                <Markdown source={site.local_site.legal_information} />
            </CollapseButton>
        {/if}
    </div>

    <SidebarFooter />

</StickyCard>
