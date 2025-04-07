<script lang="ts">
    import type { SystemTimerEvent } from '$lib/ui/events'
    import { amModOfAny,isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
    import { getClient } from '$lib/lemmy'
    import { getInbox } from '$lib/lemmy/inbox.js'
    import { profile } from '$lib/auth'
    import { userSettings } from '$lib/settings'

    import Button from '$lib/components/input/Button.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import ShieldIcon from '$lib/components/lemmy/moderation/ShieldIcon.svelte'

    import {
        Icon,
        Bell,
        Clipboard,
        InboxArrowDown,
        ArrowPath,
    } from 'svelte-hero-icons'

    export let size:number = 28

    localStorage.setItem('seenUntil', Date.now().toString())
    
    let selectedClass = '!text-sky-700 dark:!text-sky-500 font-bold'
    let polling = false
    let lastTick: number = 0

    // WIP method to do browser notifications; not implemented yet
    async function getInboxNotifications(dontUpdate: boolean = false) {
        if (!$profile?.jwt) return

        let until = Number(localStorage.getItem('seenUntil'))

        if (Number.isNaN(until) || until == 0) {
            const now = Date.now()
            localStorage.setItem('seenUntil', now.toString())
            until = now
        }

        const inbox = await getInbox(until)
        console.log(inbox)
        
        if (Notification.permission != 'denied') {
            Notification.requestPermission()
        }

        inbox.forEach((item) => {
            let title: string
            const sender = `${item.person.display_name ?? item.person.name}@${new URL(item.person.actor_id).hostname}`
            switch(item.type) {
                case 'comment_reply':
                    title= `${sender} replied to you.`
                    break
                case 'person_mention':
                    title= `${sender} mentioned you.`
                    break
                case 'private_message':
                    title= `${sender} messaged you.`
                    break
            }
            const notif = new Notification(
                title,
                {
                    body: item.body,
                    //timestamp: item.created,
                    icon: item.person.avatar ?? '/logo_512.png',
                }
            )
            notif.onclick = (e) => { window.open('/profile/inbox')}
        })

        if (dontUpdate) return

        localStorage.setItem('seenUntil', Date.now().toString())
    }


    // Get the notification counts (inbox items, reports, registration applications) 
    const getNotificationCount = async (mod: boolean, admin:boolean=false) => {
        const client = getClient()
        const unreads = await client.getUnreadCount()

        let reports: number = 0

        if (mod) {
            const reportRes = await client.getReportCount({})

        reports =
            reportRes.comment_reports +
            reportRes.post_reports +
            (reportRes.private_message_reports ?? 0)
        }

        let applications = 0
        if (admin) {
            applications = (await client.listRegistrationApplications(
                { unread_only: true }
            ))?.registration_applications?.length ?? 0
        }

        return {
            unreads: unreads.mentions + unreads.private_messages + unreads.replies,
            reports: reports,
            registration_applications: applications
        }
    }

    async function pollNotifications() {
        if (!$profile?.user || !$profile.jwt) return
        polling = true
        const notifs = await getNotificationCount(amModOfAny($profile.user) ?? false, isAdmin($profile.user) ?? false)

        $profile.user.unreads = notifs.unreads
        $profile.user.reports = notifs.reports
        $profile.user.registration_applications = notifs.registration_applications

        profile.update((p) => ({
            ...p!,
            user: $profile.user,
        }))

        polling = false
    }

    function handleSystemTimer(e:SystemTimerEvent) {
        if (!$profile?.user) return
        if ( (e.detail.timestamp - lastTick) > $userSettings.notifications.pollRate) {
            lastTick = e.detail.timestamp
            polling = true
            pollNotifications().then(() => polling = false)
        }
    }
</script>

<svelte:window on:systemTimer={handleSystemTimer} />

{#if $profile?.user}
<Menu alignment="bottom-right">
    <Button
        color="tertiary"
        slot="button"
        aria-label="Notifications"
        title="Notifications"
        icon={Bell}
        iconSize={size}
        loading={polling}
        let:toggleOpen
        let:open
        on:click={toggleOpen}
        class="max-md:w-9 max-md:h-8 max-md:!p-0 {open ? selectedClass : ''}"
    >
        
        <!---Notification Dots for Reports and Inbox--->
        {#if $profile?.user?.registration_applications ?? 0 > 0}
            <div class="rounded-full w-2 h-2 bg-sky-800 absolute top-0 left-0 z-10"/>
        {/if}

        {#if $profile?.user?.reports ?? 0 > 0}
            <div class="rounded-full w-2 h-2 bg-green-700 absolute bottom-0 right-0 z-10"/>
        {/if}
        
        {#if $profile.user.unreads > 0}
            <div class="rounded-full w-2 h-2 bg-red-800 absolute top-0 right-0 z-10"/>
        {/if}   

    </Button>
    
    <li class="flex flex-row items-center text-xs font-bold opacity-100 text-left px-4 py-1 min-w-48">
        Notifications
        <span class="ml-auto"/>
        <Icon src={Bell} width={16} mini />
    </li>
    <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />

    <!----Messages--->
    <MenuButton link href="/profile/inbox" color="secondary" data-sveltekit-preload-data="hover" aria-label="Moderation">
        <Icon src={InboxArrowDown} mini size="16" slot="icon"/>
        Inbox
        <span class="text-xs font-bold text-zinc-100 bg-red-800 px-2 py-0.5 rounded-md ml-auto">
            {$profile.user.unreads ?? 0}
        </span>
    </MenuButton>

    <!---Reports--->
    {#if amModOfAny($profile?.user)}
    <MenuButton link href="/moderation" color="secondary" data-sveltekit-preload-data="hover" aria-label="Moderation">
        <ShieldIcon filled width={16} slot="icon"/>
        Reports
        <span class="text-xs font-bold text-zinc-100 bg-green-700 px-2 py-0.5 rounded-md ml-auto">
            {$profile?.user?.reports ?? 0}
        </span>
    </MenuButton>
    {/if}

    <!---Registration Applications--->
    {#if isAdmin($profile.user)}
    <MenuButton link href="/admin/applications/" color="secondary" data-sveltekit-preload-data="hover" aria-label="Registration Applications">
        <Icon src={Clipboard} mini size="16" slot="icon" />
        Registration Applications
        <span class="text-xs font-bold text-zinc-100 bg-sky-800 px-2 py-0.5 rounded-md ml-auto">
            {$profile.user.registration_applications ?? 0}
        </span>
    </MenuButton>
    {/if}
    
    <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />
    <MenuButton color="secondary" aria-label="Check for Notifications" loading={polling} preventDefault on:click={async (e) => await pollNotifications() } >
        <Icon src={ArrowPath} mini size="16" slot="icon"/>
        Check for Notifications
    </MenuButton>

</Menu>
{/if}