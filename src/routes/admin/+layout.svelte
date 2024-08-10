<script lang="ts">
        
    import { goto } from '$app/navigation'
    import { isAdmin } from '$lib/components/lemmy/moderation/moderation.js';
    import { page } from '$app/stores'
    import { profile } from '$lib/auth';
    import { searchParam } from '$lib/util.js'
    import { site } from '$lib/lemmy'
    
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import Placeholder from '$lib/components/ui/Placeholder.svelte';
    import SelectMenu from '$lib/components/input/SelectMenu.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    
    import { 
        ClipboardDocumentCheck,
        CommandLine, 
        Envelope,
        EnvelopeOpen,
        HandRaised
    } from 'svelte-hero-icons';
            
    $: path = $page.url.pathname.endsWith('/')
        ? $page.url.pathname.substring(0, $page.url.pathname.length-1)
        : $page.url.pathname
    $: authorized = isAdmin($profile?.user)
</script>

<SubNavbar home back refreshButton={authorized} toggleCommunitySidebar={authorized}>
    
        <div class="flex flex-row gap-1 md:gap-2 items-center" slot="far-left">
            {#if authorized}
                <!---Admin Section Selector--->
                <SelectMenu
                    title="Administration"
                    icon={
                        path.startsWith('/admin/config')
                            ? CommandLine
                            : path.startsWith('/admin/applications')
                                ? ClipboardDocumentCheck
                                : CommandLine
                        }
                    options={[
                        '/admin/config',
                        '/admin/applications',
                    ]}
                    optionNames={['Configuration', 'Applications']}
                    selected={path}
                    on:select={(e) => {
                        goto(e.detail)
                    }}
                />
                
                <!---Read/Unread Selector for Applications Page--->
                {#if path.startsWith('/admin/applications')}
                    <SelectMenu
                        title="Read/Unread"
                        icon={
                            !$page.url.searchParams.get('unreadOnly')
                                ? Envelope
                                : $page.url.searchParams.get('unreadOnly') == 'true'
                                    ? Envelope
                                    : EnvelopeOpen
                        }
                        selected={
                            !$page.url.searchParams.get('unreadOnly')
                                ? true
                                : $page.url.searchParams.get('unreadOnly') == 'true'
                                    ? true
                                    : false
                        }
                        
                        options={[false, true]}
                        optionNames={['All', 'Unread']}
                        on:select={(e) =>
                            searchParam($page.url, 'unreadOnly', e.detail.toString(), 'page')
                        }
                    />
                {/if}
            {/if}
        </div>
</SubNavbar>

{#if authorized}
    <MainContentArea>
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

