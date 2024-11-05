<script lang="ts">
    import type { PersonView } from "lemmy-js-client"
    
    import { createEventDispatcher } from "svelte"
    import { imageProxyURL } from "$lib/image-proxy"
    import { userSettings } from '$lib/settings'

    import Avatar from "$lib/components/ui/Avatar.svelte"
    import Card from "$lib/components/ui/Card.svelte"
    import FormattedNumber from "$lib/components/util/FormattedNumber.svelte"
    import RelativeDate from "$lib/components/util/RelativeDate.svelte"
    import UserLink from "./UserLink.svelte"

    import {
        Icon,
        Cake,
        ChatBubbleOvalLeftEllipsis,
        Clock,
        PencilSquare,
    } from 'svelte-hero-icons'
    

    export let person_view: PersonView
    export let mod: boolean = false
    export let blocked: boolean = false
    export let mostRecentItem: string|undefined = undefined
    export let href: boolean = false            // If true, user link in the card will go to the /u/ page. False, default, will open the modal.

    let avatarWidth = 128
    const dispatcher = createEventDispatcher()
</script>



<Card backgroundImage={($userSettings.uiState.showBannersInCards && person_view.person.banner) ? imageProxyURL(person_view.person.banner, undefined, 'webp') : ''} 
    class="p-0 !items-start"
>
    <div class="flex flex-row gap-1 md:gap-3 items-start p-2">
        
        <div class="flex-shrink-0" style="min-width: {Math.round(avatarWidth * 0.75)}px; max-width: min({avatarWidth}px, 25%);">
            <Avatar width={avatarWidth} fullRes ring url={person_view.person.avatar} alt={person_view.person.actor_id}  class="mx-auto"/>
        </div>

        <div class="flex flex-col gap-1 w-3/4 overflow-hidden">
            <span class="font-bold w-full text-xl">
                <UserLink badges user={person_view.person} showInstance={false} useDisplayNames {href} admin={person_view.is_admin} {mod} blocked={blocked}
                    on:click={() => dispatcher('clickUserLink') }
                />
            </span>

            <span class="text-base font-normal truncate">
                @{person_view.person.name}@{new URL(person_view.person.actor_id).hostname}
            </span>

            
        </div>
    </div>

    <div class="mt-2"/>

    <Card elevation={0} class="p-1 w-fit opacity-70 w-full !border-slate-300 dark:!border-zinc-800 rounded-b-3xl rounded-t-none">
        <div class="flex flex-row w-full">
            
            <div class="mx-auto text-xs md:text-sm flex flex-row w-full flex-wrap gap-0 px-2 justify-between">
                <span class="flex flex-col mx-auto items-center gap-1 md:gap-2" title="Cake Day">
                    <Icon src={Cake} width={20} mini />
                    <span class="capitalize">
                        <RelativeDate date={person_view.person?.published}/>
                    </span>
                </span>
            
                <span class="flex flex-col mx-auto items-center gap-1 md:gap-2" title="Posts">
                    <Icon src={PencilSquare} width={20} mini />
                    <FormattedNumber number={person_view.counts.post_count} />
                </span>
    
                <span class="flex flex-col mx-auto items-center gap-1 md:gap-2" title="Comments">
                    <Icon src={ChatBubbleOvalLeftEllipsis} width={20} mini />
                    <FormattedNumber number={person_view.counts.comment_count} />
                </span>

                {#if mostRecentItem}
                    <span class="flex flex-col mx-auto items-center gap-1 md:gap-2" title="Last Activity">
                        <Icon src={Clock} width={20} mini />
                        <RelativeDate date={mostRecentItem}/>
                    </span>
                {/if}
            </div>
        </div>
    </Card>
</Card>