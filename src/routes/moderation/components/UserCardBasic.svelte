<script lang="ts">
    import type { PersonView } from 'lemmy-js-client'

    import {imageProxyURL} from '$lib/image-proxy'
    import { userSettings } from '$lib/settings.js'

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    import {
        Cake,
        ChatBubbleOvalLeftEllipsis,
        Icon,
        PencilSquare,
        Trophy,
    } from 'svelte-hero-icons'
    
    

    export let person: PersonView
</script>



<Card backgroundImage={($userSettings.uiState.showBannersInCards && person?.person?.banner) ? imageProxyURL(person.person.banner, 384, 'webp') : ''} class="min-h-[130px]">
    <div class="flex flex-row gap-3 items-start p-3">
        <div class="flex-shrink-0">
            <Avatar width={48} url={person.person.avatar} alt={person.person.name} />
        </div>

        <div class="flex flex-col gap-0 w-full">
            <div>
                <h1 class="flex flex-row">
                    <span class="font-bold text-lg">
                        <UserLink badges user={person.person} showInstance={false} />
                    </span>
                </h1>
                <span class="text-xs">@{person.person.name}@{new URL(person.person.actor_id).hostname}</span>
            </div>
        </div>
    </div>

    
    <div class="flex flex-row p-3 mx-auto">
        <div class="text-sm flex flex-row flex-wrap gap-8 mx-auto">
            <span class="flex flex-row items-center gap-2" title="Cake Day">
                <Icon src={Cake} width={16} height={16} mini />
                <span class="capitalize">
                    <RelativeDate date={person.person.published}/>
                </span>
            </span>
        
            <span class="flex flex-row items-center gap-2" title="Posts">
                <Icon src={PencilSquare} width={16} height={16} mini />
                <FormattedNumber number={person.counts.post_count} />
            </span>

            <span class="flex flex-row items-center gap-2" title="Comments">
                <Icon src={ChatBubbleOvalLeftEllipsis} width={16} height={16} mini />
                <FormattedNumber number={person.counts.comment_count} />
            </span>
            
            {#if person.counts.post_score && person.counts.comment_score}
                <span class="flex flex-row items-center gap-2" title="Content Score">
                    <Icon src={Trophy} width={16} height={16} mini />
                    <FormattedNumber number={(person.counts.post_score + person.counts.comment_score)} />
                </span>
            {/if}
        </div>
    </div>
</Card>



{#if person.person.bio}
    <div class="hidden xl:block">
        <h1 class="font-bold text-lg">About Me</h1>
        <span class="text-sm font-normal">
            <Markdown source={person.person.bio} />
        </span>
    </div>
{/if}

<div class="mt-[150px]"/>
    
