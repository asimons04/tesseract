<script lang="ts">
    import type { Community } from 'lemmy-js-client'
    
    import { communityProfileModal } from '../moderation/moderation'
    import { fixLemmyEncodings } from '$lib/components/lemmy/post/helpers'
    import { goto } from '$app/navigation'
    import { shortenCommunityName } from '$lib/components/lemmy/community/helpers'
    import { userSettings } from '$lib/settings.js'
    
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import CommunityProfileModal from '../modal/CommunityProfileModal.svelte'
    

    export let community: Community
    export let avatar: boolean = false
    export let name: boolean = true
    export let avatarSize: number = 24
    export let showInstance: boolean | undefined = undefined
    export let href: boolean = false
    export let heading:boolean = false
    export let boldCommunityName:boolean = true;
    export let useDisplayNames:boolean|undefined = undefined 

    function linkFromCommunity(community: Community) {
        const domain = new URL(community.actor_id).hostname
        return `/c/${community.name}@${domain}`
    }
</script>
<!---href={href ?? linkFromCommunity(community)} --->

<button  class="items-center flex flex-row gap-2 hover:underline {heading ? 'font-bold text-2xl' : ''}" 
    title={fixLemmyEncodings(community.title)}
    on:click={() => {
        if (href) goto(linkFromCommunity(community))
        else  communityProfileModal(community)
    }}
>
    {#if avatar}
        <Avatar url={community.icon} alt={community.name} width={avatarSize} community={true}/>
    {/if}

    {#if name}
        <span class="flex flex-wrap gap-0 {boldCommunityName ? 'font-bold' : 'font-normal'}">
            
            {useDisplayNames ?? $userSettings.displayNames 
                ? shortenCommunityName(community.title, 30)
                : `/c/${community.name}`
            }

            {#if showInstance != undefined ? showInstance : $userSettings.uiState.showInstances}    
            <span class="text-slate-500 dark:text-zinc-500 font-normal">
                @{new URL(community.actor_id).hostname}
            </span>
            {/if}
        </span>
    {/if}
</button>
