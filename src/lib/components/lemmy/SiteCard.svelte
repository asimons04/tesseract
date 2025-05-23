<script lang="ts">
    
    import type { SiteView, PersonView, Tagline } from 'lemmy-js-client'
    
    import CollapseButton from '../ui/CollapseButton.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import SidebarFooter from '$lib/components/ui/SidebarFooter.svelte';
    import SiteCardMini from './SiteCardMini.svelte'
    import SiteCardSmall from './SiteCardSmall.svelte'
    import StickyCard from '$lib/components/ui/StickyCard.svelte'
    import TaglinesCard from './TaglinesCard.svelte'
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
    

    export let site: SiteView
    export let taglines: Tagline[] | undefined = undefined
    export let admins: PersonView[] = []
    export let version: string
    export let taglineUpdateInterval: number = 15

    let expanded = {
        admins: false,
        site: false,
        legal: false
    }
</script>

<StickyCard class="{$$props.class}">
    
    
    {#if !expanded.site && !expanded.legal}
        <SiteCardSmall {site} {version} />
    {:else}
        <SiteCardMini {site} />
    {/if}
    
    {#if !expanded.admins && !expanded.site && !expanded.legal}
        <TaglinesCard bind:taglines interval={taglineUpdateInterval}/>
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
