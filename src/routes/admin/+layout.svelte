<script lang="ts">
        
    import { goto } from '$app/navigation'
    import { isAdmin } from '$lib/components/lemmy/moderation/moderation.js';
    import { onMount } from 'svelte';
    import { page } from '$app/stores'
    import { profile } from '$lib/auth';
    import { searchParam } from '$lib/util.js'
    import { site } from '$lib/lemmy'
    import { toast } from '$lib/components/ui/toasts/toasts.js';
    
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import SelectMenu from '$lib/components/input/SelectMenu.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    
    import { 
        ClipboardDocumentCheck,
        CommandLine, 
        Envelope,
        EnvelopeOpen 
    } from 'svelte-hero-icons';
    
    onMount(() => {
        if (!$profile?.jwt || !isAdmin($profile.user)) {
            goto(`/`)
            toast({
                title: 'Not Authorized',
                type: 'warning',
                content: 'You must be logged in as an administrator to access this section.'

            })
        }
    })

</script>

<SubNavbar home back refreshButton toggleCommunitySidebar>
    <div class="flex flex-row gap-1 md:gap-2 items-center" slot="far-left">
        <!---Admin Section Selector--->
        <SelectMenu
            title="Administration"
            icon={
                $page.url.pathname.startsWith('/admin/config')
                    ? CommandLine
                    : $page.url.pathname.startsWith('/admin/applications')
                        ? ClipboardDocumentCheck
                        : CommandLine
                }
            options={[
                '/admin/config',
                '/admin/applications',
            ]}
            optionNames={['Configuration', 'Applications']}
            selected={$page.url.pathname}
            on:select={(e) => {
                goto(e.detail)
            }}
        />
        
        <!---Read/Unread Selector for Applications Page--->
        {#if $page.url.pathname.startsWith('/admin/applications')}
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
    </div>
</SubNavbar>

<MainContentArea>
    <slot />
    
    <div class="flex h-full" slot="right-panel">
        {#if $site}
            <SiteCard site={$site.site_view} taglines={$site.taglines} admins={$site.admins} version={$site.version} />
        {/if}
    </div>
</MainContentArea>

