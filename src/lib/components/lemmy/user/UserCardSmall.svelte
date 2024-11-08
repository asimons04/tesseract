<script lang="ts">
    import type { PersonView } from "lemmy-js-client"
    
    import { createEventDispatcher } from "svelte"
    import { imageProxyURL } from "$lib/image-proxy"
    import { userProfileModal } from "../moderation/moderation";
    import { userSettings } from '$lib/settings'

    import Avatar from "$lib/components/ui/Avatar.svelte"
    import Badge from "$lib/components/ui/Badge.svelte";
    import Card from "$lib/components/ui/Card.svelte"
    import FormattedNumber from "$lib/components/util/FormattedNumber.svelte"
    import RelativeDate from "$lib/components/util/RelativeDate.svelte"

    import {
        Icon,
        Cake,
        ChatBubbleOvalLeftEllipsis,
        Clock,
        PencilSquare,
        ShieldExclamation,
        EyeSlash,
        NoSymbol,
    } from 'svelte-hero-icons'
    
    
    

    export let person_view: PersonView
    export let mod: boolean = false
    export let blocked: boolean = false
    export let mostRecentItem: string|undefined = undefined
    export let href: boolean = false            // If true, user link in the card will go to the /u/ page. False, default, will open the modal.

    let avatarWidth = 96
    const dispatcher = createEventDispatcher()
</script>



<Card backgroundImage={($userSettings.uiState.showBannersInCards && person_view.person.banner) ? imageProxyURL(person_view.person.banner, undefined, 'webp') : ''} 
    class="p-0 !items-start"
>
    <div class="flex flex-row gap-1 md:gap-3 items-start p-0">
        
        <div class="p-2 flex-shrink-1">
            <Avatar width={avatarWidth} fullRes ring url={person_view.person.avatar} alt={person_view.person.actor_id}  class="mx-auto"/>
        </div>

        <div class="flex flex-col gap-0  overflow-hidden break-words border border-slate-300 dark:border-zinc-900 bg-slate-200 dark:bg-zinc-950 rounded-bl-2xl rounded-tr-2xl p-1 w-fit opacity-70 w-full !border-slate-300 dark:!border-zinc-800 pl-4"
            style="width: calc(100% - {avatarWidth}px;"
        >
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

            <span class="flex flex-row flex-wrap w-full gap-2 text-sm font-normal mt-1">
                {#if mod}
                    <Badge color="green" icon={ShieldExclamation} inline click={false} rightJustify={false}>
                        Mod
                    </Badge>
                {/if}

                {#if blocked}
                    <Badge color="red" icon={EyeSlash} inline click={false} rightJustify={false}>
                        Blocked
                    </Badge>
                {/if}

                {#if person_view.person.banned}
                    <Badge color="red" icon={NoSymbol} inline click={false} rightJustify={false}>
                        Banned
                    </Badge>
                {/if}
            </span>
            
        </div>
    </div>

    <div class="mt-2"/>

    <Card elevation={0} class="p-1 w-fit opacity-70 w-full !border-slate-300 dark:!border-zinc-800 rounded-b-2xl rounded-t-none">
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