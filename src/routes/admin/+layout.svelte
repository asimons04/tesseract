<script lang="ts">
        
    import { isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
    import { profile } from '$lib/auth'
    import { site } from '$lib/lemmy'
    
    import AdminSectionBar from './AdminSectionBar.svelte'
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    
    import { 
        HandRaised
    } from 'svelte-hero-icons';
    
    $: authorized = isAdmin($profile?.user)
</script>

<SubNavbar home back refreshButton={authorized} quickSettings toggleCommunitySidebar={authorized} />

{#if authorized}
    <MainContentArea>
        <AdminSectionBar />
        <slot />
        
        <div class="flex h-full" slot="right-panel">
            {#if $site}
                <SiteCard site={$site.site_view} taglines={$site.taglines} admins={$site.admins} version={$site.version} />
            {/if}
        </div>
    </MainContentArea>
{:else}
    <Placeholder icon={HandRaised} title="Unauthorized" description="You must be an administrator to access this section." />
{/if}

