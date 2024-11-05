<script lang="ts">
    
    import type { SiteView, PersonView, Tagline } from 'lemmy-js-client'
    import {imageProxyURL} from '$lib/image-proxy'
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
        Icon,
        InformationCircle,
        Newspaper,
        PencilSquare,
        Server,
        ShieldCheck,
        UserGroup,
    } from 'svelte-hero-icons'
    import { slide } from 'svelte/transition';
    import SiteCardSmall from './SiteCardSmall.svelte';
    

    export let site: SiteView
    export let taglines: Tagline[] | undefined = undefined
    export let admins: PersonView[] = []
    export let version: string

    // Update the tagline every 30 seconds
    let tagline:string = ' '
    
    if (taglines && taglines.length > 0) {
        tagline = taglines[Math.floor(Math.random() * taglines.length)].content
        setInterval(() => {
            if (taglines && taglines.length > 0) tagline = taglines[Math.floor(Math.random() * taglines.length)].content
        }, 30*1000)
    }

    let expanded = {
        admins: false,
        site: false,
        legal: false
    }
</script>

<StickyCard class="{$$props.class}">
    <SiteCardSmall {site} {version} />
    
    {#if !expanded.admins && !expanded.site && !expanded.legal}
    <div class="flex flex-col w-full my-2" transition:slide>
        {#if taglines && taglines.length > 0}
            <Card class="p-2 text-center">
                <Markdown source={tagline} />
            </Card>
        {/if}
    </div>
    {/if}

    <!--- Collapsible buttons for admins and site info --->
    <div class="hidden xl:block w-full overflow-y-auto">
        {#if admins.length > 0}
           <CollapseButton bind:expanded={expanded.admins} icon={ShieldCheck} title="Admins">
                {#each admins as admin}
                    <UserLink user={admin.person} avatar={true} badges={false} showInstance={false} />
                {/each}
           </CollapseButton>
        {/if}
        
        {#if site?.site?.sidebar}
            <CollapseButton bind:expanded={expanded.site} icon={InformationCircle} title="Site Info" >
                <Markdown source={site.site.sidebar} />
            </CollapseButton>
        {/if}

        {#if site?.local_site?.legal_information}
            <CollapseButton bind:expanded={expanded.legal} icon={BuildingOffice} title="Legal">
                <Markdown source={site.local_site.legal_information} />
            </CollapseButton>
        {/if}
    </div>

    <SidebarFooter />

</StickyCard>
