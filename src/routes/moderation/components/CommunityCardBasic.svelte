<script lang="ts">
    import type { CommunityView, CommunityModeratorView } from 'lemmy-js-client'
    
    import {imageProxyURL} from '$lib/image-proxy'
    import { userSettings } from '$lib/settings.js'
    
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    
    
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    
    import {
        Calendar,
        ChatBubbleOvalLeftEllipsis,
        Icon,
        PencilSquare,
        UserGroup,
    } from 'svelte-hero-icons'
    
    

    export let community: CommunityView
</script>


<Card backgroundImage={($userSettings.uiState.showBannersInCards && community?.banner) ? imageProxyURL(community.banner, '384', 'webp') : ''}>
    <div class="flex flex-col gap-2 h-full">
        
        <!--- Commuinity Avatar, display name, and federation name--->
        <div class="flex flex-row gap-3 items-start p-3">
            <div class="flex-shrink-0">
                <Avatar
                    width={48}
                    url={community.icon}
                    alt={community.name}
                />
            </div>
            
            
            <div class="flex flex-col gap-0">
                <div class="flex flex-row">
                    <h1 class="font-bold text-xl">
                        <a href="/c/{community.name}@{new URL(community.actor_id).hostname}" title="{community.name}">
                            {community.title.replace('&amp;', '&')}
                        </a>
                    </h1>
                </div>
                    
                <span class="dark:text-zinc-400 text-slate-600 text-xs">
                    !{community.name}@{new URL(community.actor_id).hostname}
                </span>
            </div>
            
            <span class="ml-auto"/>
            
            <span class="flex flex-row items-center gap-2 text-sm" title="Created">
                <Icon src={Calendar} width={16} height={16} mini />
                <RelativeDate date={community.published} />
            </span>

        </div>
    </div>
</Card>

{#if community.description}
    <div class="flex flex-col text-sm font-normal">
        <Markdown source={community.description} />
    </div>
{/if}
        