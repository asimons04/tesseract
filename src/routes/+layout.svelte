<script lang="ts">
    import '../style/app.css'
    
    import { 
        type AccessDeniedReason, 
        EXTREMIST_COMMUNITIES,
    } from '$lib/blacklists'

    import { navigating } from '$app/stores'
    import nProgress from 'nprogress'
    import 'nprogress/nprogress.css'
    
    import { site } from '$lib/lemmy'
    import { inDarkTheme } from '$lib/ui/colors.js'
    import { onMount } from 'svelte'
    import { page } from '$app/stores'
    
    // @ts-ignore
    import { pwaInfo } from 'virtual:pwa-info'
    import { profile } from '$lib/auth';
    import PwaReload from '$lib/PwaReload.svelte'
    import { userSettings } from '$lib/settings.js'


    import ModalContainer   from '$lib/components/ui/modal/ModalContainer.svelte'
    import Navbar           from '$lib/components/ui/Navbar.svelte'
    import Sidebar          from '$lib/components/ui/sidebar/Sidebar.svelte'
    import SystemTimer      from '$lib/components/ui/SystemTimer.svelte';
    import ToastContainer   from '$lib/components/ui/toasts/ToastContainer.svelte'
    
    
    import ExtremismWarningBanner       from '$lib/components/lemmy/banners/ExtremismWarningBanner.svelte'
    import PrivateInstanceWarningBanner from '$lib/components/lemmy/banners/PrivateInstanceWarningBanner.svelte'

    nProgress.configure({
        minimum: 0.4,
        trickleSpeed: 200,
        showSpinner: false,
    })

    $: {
        if ($navigating && typeof document != 'undefined') {
            nProgress.start()
            document?.documentElement?.classList?.toggle('wait', true)
        }

        if (!$navigating && typeof document != 'undefined') {
            nProgress.done()
            document?.documentElement?.classList?.toggle('wait', false)
        }
    }

    $: webManifest = pwaInfo ? pwaInfo.webManifest.linkTag : ''
  
    
    let accessDenied: boolean = false
    let accessDeniedReason: AccessDeniedReason = 'none'
     


    $:  $site, $profile, checkAccess()
    
    function checkAccess() {
        if ($site?.site_view.local_site.private_instance && !$profile?.user) {
            accessDenied = true
            accessDeniedReason = 'private_instance'
        }
        else if ($profile?.user?.follows && $profile.user.follows.find((c) => { return EXTREMIST_COMMUNITIES.includes(c.community.actor_id) }) )  {
            accessDenied = true
            accessDeniedReason = 'extremism'
        }
        else {
            accessDenied = false
            accessDeniedReason = 'none'
        }
    }

    // Clear the loading animation when loaded.
    onMount(() => {
        const element = document.getElementById('loader-animation')
        if (element) element.remove()
    })


  
</script>

<svelte:head>
    <meta name="theme-color" content={inDarkTheme() ? '#020202' : '#f1f6f9'} />
    <link rel="icon" href="{$site?.site_view.site.icon ?? '/img/favicon.png'}">
    {@html webManifest}
</svelte:head>

<div class="flex flex-col min-h-screen {$userSettings.font}">
    <SystemTimer />
    <Navbar />
    <ToastContainer />
    
    
    <div class="flex flex-row h-full w-full max-w-full flex-1">
        <Sidebar />
        <main class="p-2 min-w-0 w-full flex flex-col flex-[3] gap-2 sm:rounded-tl-lg border-slate-200 dark:border-zinc-900 sm:border-l border-t">
            <!---If private instance mode is enabled, user is not logged in, and page has API-restricted content, show a warning banner--->
            {#if  accessDenied && accessDeniedReason == 'private_instance' && 
                !(
                    $page.url.pathname.startsWith('/about') ||
                    $page.url.pathname.startsWith('/accounts') ||
                    $page.url.pathname.startsWith('/forgot_password') ||
                    $page.url.pathname.startsWith('/legal') ||
                    $page.url.pathname.startsWith('/login') || 
                    $page.url.pathname.startsWith('/settings') ||
                    $page.url.pathname.startsWith('/signup') ||
                    $page.url.pathname.startsWith('/site') ||
                    $page.url.pathname.startsWith('/verify_email')
                )
            }
                <PrivateInstanceWarningBanner/>
            {:else if accessDenied && accessDeniedReason == 'extremism'}   
                <ExtremismWarningBanner />
            {:else} 
                <slot />
            {/if}
        </main>
    </div>

    <ModalContainer />
</div>
