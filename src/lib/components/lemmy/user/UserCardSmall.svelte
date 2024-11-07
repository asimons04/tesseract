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
    import { userProfileModal } from "../moderation/moderation";
    

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
    <div class="flex flex-row gap-1 md:gap-3 items-start p-0">
        
        <div class="flex-shrink-0 p-2" style="min-width: {Math.round(avatarWidth * 0.75)}px; max-width: min({avatarWidth}px, 25%);">
            <Avatar width={avatarWidth} fullRes ring url={person_view.person.avatar} alt={person_view.person.actor_id}  class="mx-auto"/>
        </div>

        <div class="flex flex-col gap-0 w-3/4 overflow-hidden break-words border border-slate-300 dark:border-zinc-900 bg-slate-200 dark:bg-zinc-950 rounded-bl-3xl rounded-tr-3xl p-1 w-fit opacity-70 w-full !border-slate-300 dark:!border-zinc-800 pl-4">
            <a href="/u/{person_view.person.name}@{new URL(person_view.person.actor_id).hostname}"
                class="text-left items-center hover:underline capitalize font-bold text-xl truncate"     
                title={person_view.person.display_name ?? person_view.person.name}
                on:click={(
                    //@ts-ignore
                    e
                ) => {
                    if (href) {
                        dispatcher('clickUserLink')
                        return
                    }
                    e.preventDefault()
                    e.stopPropagation()    
                    userProfileModal(person_view.person) 
                }}
            >
                {person_view.person.display_name ?? person_view.person.name}
            </a>
            
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