<script lang="ts">
    
    import type { SiteView, PersonView, Tagline } from 'lemmy-js-client'
    import { getClient } from '$lib/lemmy.js'
    import {imageProxyURL} from '$lib/image-proxy'
    import { userSettings } from '$lib/settings.js'
    
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import StickyCard from '$lib/components/ui/StickyCard.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    import {
        Calendar,
        ChatBubbleOvalLeftEllipsis,
        ChevronDoubleRight,
        Icon,
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

    let expandAdmins:boolean = false

</script>

<StickyCard class="mb-3
    {$userSettings.uiState.expandCommunitySidebar
        ? 'block'
        : 'hidden'}
    "
>
    <Card backgroundImage={($userSettings.uiState.showBannersInCards && site?.site?.banner) ? imageProxyURL(site.site.banner, 384, 'webp') : ''}>
        <div class="flex flex-row gap-3 items-center p-3">
            {#if site.site.icon}
                <Avatar width={42} url={site.site.icon} alt={site.site.name} circle={false} />
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

    <div class="hidden xl:block">
        {#if admins.length > 0}
            <div class="flex flex-col gap-1 mt-2 mb-4">
                <Button
                    color="tertiary"
                    alignment="left"
                    on:click={ ()=> { expandAdmins = !expandAdmins}}
                >
                    
                    <Icon src={ShieldCheck} mini size="18" />

                    <span class="w-full flex flex-row justify-between">
                        Admins
                        <span class="bg-gray-800 text-gray-100 dark:bg-gray-100 dark:text-gray-800  text-xs font-medium mr-2 ml-auto px-2.5 py-0.5 rounded-full">
                            {admins.length}
                        </span>
                    </span>
                </Button>
                
                <div class="flex flex-col gap-2 pl-4" class:hidden={!expandAdmins}>
                    {#each admins as admin}
                        <UserLink user={admin.person} avatar={true} badges={false} showInstance={false} />
                    {/each}
                </div>
            </div>
        {/if}
        
        <Markdown source={site.site.sidebar} />
    </div>
</StickyCard>
