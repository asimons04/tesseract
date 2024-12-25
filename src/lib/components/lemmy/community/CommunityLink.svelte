<script lang="ts">
    import type { Community } from 'lemmy-js-client'
    
    import { communityProfileModal } from '../moderation/moderation'
    import { createEventDispatcher } from 'svelte'
    import { fixLemmyEncodings } from '$lib/components/lemmy/post/helpers'
    import { shortenCommunityName } from '$lib/components/lemmy/community/helpers'
    import { userSettings } from '$lib/settings.js'
    
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import { EyeSlash, Icon } from 'svelte-hero-icons';
  

    export let community: Community
    export let avatar: boolean = false
    export let name: boolean = true
    export let avatarSize: number = avatar ? 24 : 0
    export let avatarBackground: boolean = false
    export let showInstance: boolean | undefined = undefined
    export let href: boolean = false
    export let heading:boolean = false
    export let boldCommunityName:boolean = true;
    export let useDisplayNames:boolean | undefined = undefined
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

<a href="{linkFromCommunity(community)}" 
    class="items-center flex flex-row gap-2 hover:underline w-full
        {noClick ? 'pointer-events-none' : ''}  
        {heading ? 'font-bold text-2xl' : ''}  
        {$$props.class}
    " 
    title={fixLemmyEncodings(community.title)}
    on:click={loadCommunityProfileModal}
>
    {#if avatar}
        <Avatar url={community.icon} alt={community.name} width={avatarSize} title={community.title ?? community.name} community={true} background={avatarBackground}/>
    {/if}

    {#if name}
        <span class="flex text-left 
            {inline ? 'items-center flex-row gap-0 truncate' : 'flex-col gap-0'} 
            {useDisplayNames ?? $userSettings.displayNames ? 'capitalize' : ''} 
            {boldCommunityName ? 'font-bold' : 'font-normal'}
        "
            style="width:calc(100% - {avatarSize+2}px - 0.5rem);"
        >
            <span class="font-bold opacity-80 text-left  truncate ">
                { useDisplayNames ?? $userSettings.displayNames
                    ? shortenCommunityName(community.title, maxNameLength)
                    : `c/${community.name}`
                }
            </span>
            

            {#if  showInstance ?? $userSettings.uiState.showInstances}    
                <span class="opacity-70 font-normal normal-case truncate">
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
