<script lang="ts">
    import type { Community } from 'lemmy-js-client'
    
    import { fixLemmyEncodings } from '$lib/components/lemmy/post/helpers'
    import { shortenCommunityName } from '$lib/components/lemmy/community/helpers'
    import { userSettings } from '$lib/settings.js'
    
    import Avatar from '$lib/components/ui/Avatar.svelte'
    
    

    export let community: Community
    export let avatar: boolean = false
    export let name: boolean = true
    export let avatarSize: number = 24
    export let showInstance: boolean | undefined = undefined
    export let href: string | undefined = undefined
    export let heading:boolean = false
    export let boldCommunityName:boolean = true;

    function linkFromCommunity(community: Community) {
        const domain = new URL(community.actor_id).hostname
        return `/c/${community.name}@${domain}`
    }
</script>

<a 
    class="items-center flex flex-row gap-2 hover:underline {heading ? 'font-bold text-2xl' : ''}" 
    href={href ?? linkFromCommunity(community)} 
    title={fixLemmyEncodings(community.title)}
>
    {#if avatar}
        <Avatar url={community.icon} alt={community.name} width={avatarSize} />
    {/if}

    {#if name}
        <span class="flex flex-wrap gap-0 {boldCommunityName ? 'font-bold' : 'font-normal'}">
            
            {$userSettings.displayNames 
                ? shortenCommunityName(community.title)
                : `/c/${community.name}`
            }

            {#if showInstance != undefined ? showInstance : $userSettings.uiState.showInstances}    
            <span class="text-slate-500 dark:text-zinc-500 font-normal">
                @{new URL(community.actor_id).hostname}
            </span>
            {/if}
        </span>
    {/if}
</a>
