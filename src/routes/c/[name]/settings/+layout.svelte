<script lang="ts">
    import type { PageData } from './$types.js'

    import { fullCommunityName } from '$lib/util.js'
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
      
    

    import Button from '$lib/components/input/Button.svelte'
    import CommunityCard from '$lib/components/lemmy/community/CommunityCard.svelte'
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    
    import {
        Cog6Tooth,
        Icon,
        UserGroup
    } from 'svelte-hero-icons'
    

    export let data: PageData

    $: communityUrl = `/c/${fullCommunityName(
        data.community.community_view.community.name,
        data.community.community_view.community.actor_id
    )}`
</script>


<SubNavbar home back toggleCommunitySidebar refreshButton toggleMargins/>

<MainContentArea>
        
    <!---Profile Sub-Page Buttons--->
    <div class="sticky top-[6.9rem] flex flex-row gap-1 -ml-2 px-2 py-1 w-[calc(100%+1rem)] bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-3xl z-10">
        <Button color="tertiary" alignment="left" title="Settings" class="hover:bg-slate-200" href="{communityUrl}/settings">
            <span class="flex flex-col items-center {$page.url.pathname.endsWith('/settings') ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                <Icon src={Cog6Tooth} mini size="18" title="Settings" />
                <span class="text-xs">Settings</span>
            </span>            
        </Button>
        
        <Button color="tertiary" alignment="left" title="Team" class="hover:bg-slate-200" href="{communityUrl}/settings/team">
            <span class="flex flex-col items-center {$page.url.pathname.endsWith('/settings/team') ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                <Icon src={UserGroup} mini size="18" title="Team" />
                <span class="text-xs">Team</span>
            </span>            
        </Button>

        
    </div>
        
    <!---Content Area for Child Pages--->
    <slot />
        

    <!---User Sidebar--->
    <CommunityCard  community_view={data.community.community_view} moderators={data.community.moderators} slot="right-panel"/>

</MainContentArea>
