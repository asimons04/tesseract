<script lang="ts">
    import type { Community } from 'lemmy-js-client'
    
    import { communityProfileModal } from '../moderation/moderation'
    import { createEventDispatcher } from 'svelte'
    import { fixLemmyEncodings } from '$lib/components/lemmy/post/helpers'
    import { goto } from '$app/navigation'
    import { shortenCommunityName } from '$lib/components/lemmy/community/helpers'
    import { userSettings } from '$lib/settings.js'
    
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import { EyeSlash, Icon } from 'svelte-hero-icons';
  

    export let community: Community
    export let avatar: boolean = false
    export let name: boolean = true
    export let avatarSize: number = 24
    export let avatarBackground: boolean = false
    export let showInstance: boolean | undefined = undefined
    export let href: boolean = false
    export let heading:boolean = false
    export let boldCommunityName:boolean = true;
    export let useDisplayNames:boolean|undefined = undefined 
    export let noClick:boolean = false
    export let maxNameLength: number = 45
    export let inline: boolean = true
    
    const dispatcher = createEventDispatcher()

    function linkFromCommunity(community: Community) {
        const domain = new URL(community.actor_id).hostname
        return `/c/${community.name}@${domain}`
    }

    function loadCommunityProfileModal(e:CustomEvent) {
        dispatcher('click')
        if (!href) {
            e.preventDefault()
            e.stopPropagation()
            communityProfileModal(community)
        }
    }
</script>

<a href="{linkFromCommunity(community)}" class="items-center flex flex-row gap-2 {noClick ? 'pointer-events-none' : ''} hover:underline {heading ? 'font-bold text-2xl' : ''}" 
    title={fixLemmyEncodings(community.title)}
    on:click={loadCommunityProfileModal}
>
    {#if avatar}
        <Avatar url={community.icon} alt={community.name} width={avatarSize} title={community.title ?? community.name} community={true} background={avatarBackground}/>
    {/if}

    {#if name}
        <span class="flex flex-wrap text-left {inline ? 'items-center flex-row gap-0' : 'flex-col gap-0'} {useDisplayNames ?? $userSettings.displayNames ? 'capitalize' : ''} {boldCommunityName ? 'font-bold' : 'font-normal'}">

            {useDisplayNames ?? $userSettings.displayNames 
                ? shortenCommunityName(community.title, maxNameLength)
                : `c/${community.name}`
            }

            {#if showInstance != undefined ? showInstance : $userSettings.uiState.showInstances}    
                <span class="text-slate-500 dark:text-zinc-500 font-normal normal-case">
                    {inline ? '@' : ''}{new URL(community.actor_id).hostname}
                </span>
            {/if}

            {#if !inline && community.hidden}
                <span class="ml-2 text-red-500">
                    <Icon mini src={EyeSlash} size="12"/>
                </span>
            {/if}
        </span>
    {/if}
</a>
