<script lang="ts">
    import { amMod, isAdmin, isTopMod } from '$lib/components/lemmy/moderation/moderation.js';
    import { fullCommunityName } from '$lib/util.js'
    import { profile } from '$lib/auth.js';
    import { page } from '$app/stores'
    
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte';
    import CommunityCard from '$lib/components/lemmy/community/CommunityCard.svelte'
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    
    import {
        Cog6Tooth,
        HandRaised,
        Icon,
        UserGroup
    } from 'svelte-hero-icons'
    
    export let data

    $: communityUrl = `/c/${fullCommunityName(
        data.community.community_view.community.name,
        data.community.community_view.community.actor_id
    )}`
</script>


<SubNavbar home back toggleCommunitySidebar refreshButton/>

{#if amMod($profile?.user, data.community.community_view.community) || isTopMod($profile?.user, data.community) }
    <MainContentArea>
            
        <!---Profile Sub-Page Buttons--->
        <div class="sticky top-[6.9rem] flex flex-row gap-1 px-2 py-1 w-full bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-3xl z-10">
            <Card class="flex flex-row w-full">
                <Button color="tertiary" alignment="left" title="Settings" class="hover:bg-slate-200" href="{communityUrl}/settings">
                    <span class="flex flex-col items-center {$page.url.pathname==`${communityUrl}/settings` || $page.url.pathname==`${communityUrl}/settings/` ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                        <Icon src={Cog6Tooth} mini size="18" title="Settings" />
                        <span class="text-xs">Settings</span>
                    </span>            
                </Button>
                
                <Button color="tertiary" alignment="left" title="Team" class="hover:bg-slate-200" href="{communityUrl}/settings/team">
                    <span class="flex flex-col items-center {$page.url.pathname.startsWith(`${communityUrl}/settings/team`) ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                        <Icon src={UserGroup} mini size="18" title="Team" />
                        <span class="text-xs">Team</span>
                    </span>            
                </Button>

                <Button color="tertiary" alignment="left" title="Moderation" class="hover:bg-slate-200" href="{communityUrl}/settings/moderation">
                    <span class="flex flex-col items-center {$page.url.pathname.startsWith(`${communityUrl}/settings/moderation`) ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                        <Icon src={HandRaised} mini size="18" title="Moderation" />
                        <span class="text-xs">Moderation</span>
                    </span>            
                </Button>
            </Card>
        </div>
            
        <!---Content Area for Child Pages--->
        <slot />
            

        <!---User Sidebar--->
        <CommunityCard  community_view={data.community.community_view} moderators={data.community.moderators} slot="right-panel"/>

    </MainContentArea>
{:else}
    <Placeholder icon={HandRaised} title="Unauthorized" description="You must be an admin or moderator to access this section" />
{/if}

