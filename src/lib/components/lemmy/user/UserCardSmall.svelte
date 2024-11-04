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
    
    const dispatcher = createEventDispatcher()
</script>



<Card backgroundImage={($userSettings.uiState.showBannersInCards && person_view.person.banner) ? imageProxyURL(person_view.person.banner, undefined, 'webp') : ''} >
    <div class="flex flex-row gap-1 md:gap-3 items-center p-3">
        <div class="flex-shrink-0 w-1/3">
            <Avatar width={128} fullRes ring url={person_view.person.avatar} alt={person_view.person.actor_id}  />
        </div>

        <div class="flex flex-col gap-1 w-2/3 overflow-hidden">
            <span class="font-bold text-lg">
                <UserLink badges user={person_view.person} showInstance={false} useDisplayNames href admin={person_view.is_admin} mod={mod} blocked={blocked}
                    on:click={() => dispatcher('clickUserLink') }
                />
            </span>

            <span class="text-xs font-normal">@{person_view.person.name}@{new URL(person_view.person.actor_id).hostname}</span>
            
            <div class="mt-2"/>

            <Card elevation={0} class="p-2 w-fit opacity-80 w-full">
                <div class="flex flex-row">
                    
                    <div class="mx-auto text-xs md:text-sm flex flex-row w-full md:w-3/4 flex-wrap gap-2 justify-between">
                        <span class="flex flex-row mx-auto items-center gap-1 md:gap-2" title="Cake Day">
                            <Icon src={Cake} width={16} height={16} mini />
                            <span class="capitalize">
                                <RelativeDate date={person_view.person?.published}/>
                            </span>
                        </span>
                    
                        <span class="flex flex-row mx-auto items-center gap-1 md:gap-2" title="Posts">
                            <Icon src={PencilSquare} width={16} height={16} mini />
                            <FormattedNumber number={person_view.counts.post_count} />
                        </span>
            
                        <span class="flex flex-row mx-auto items-center gap-1 md:gap-2" title="Comments">
                            <Icon src={ChatBubbleOvalLeftEllipsis} width={16} height={16} mini />
                            <FormattedNumber number={person_view.counts.comment_count} />
                        </span>

                        {#if mostRecentItem}
                            <span class="flex flex-row mx-auto items-center gap-1 md:gap-2" title="Last Activity">
                                <Icon src={Clock} width={16} height={16} mini />
                                <RelativeDate date={mostRecentItem}/>
                            </span>
                        {/if}
                    </div>
                </div>
            </Card>
        </div>
    </div>
</Card>