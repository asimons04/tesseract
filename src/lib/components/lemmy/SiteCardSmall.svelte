<script lang="ts">
    import type { PersonView, SiteView, Tagline } from "lemmy-js-client"
    
    import { createEventDispatcher } from "svelte"
    import { imageProxyURL } from "$lib/image-proxy"
    import { userSettings } from '$lib/settings'

    import Avatar from "$lib/components/ui/Avatar.svelte"
    import Card from "$lib/components/ui/Card.svelte"
    import FormattedNumber from "$lib/components/util/FormattedNumber.svelte"
    import RelativeDate from "$lib/components/util/RelativeDate.svelte"
    
    import {
        Icon,
        Cake,
        ChatBubbleOvalLeftEllipsis,
        Clock,
        PencilSquare,
        Calendar,
        Server,
        UserGroup,
        Newspaper,
        CubeTransparent,
    } from 'svelte-hero-icons'
    import Markdown from "../markdown/Markdown.svelte";
    import Logo from "../ui/Logo.svelte";
    

    export let site: SiteView
    export let version: string

    let avatarWidth = 96
    const dispatcher = createEventDispatcher()
</script>



<Card backgroundImage={($userSettings.uiState.showBannersInCards && site?.site?.banner) ? imageProxyURL(site?.site?.banner, undefined, 'webp') : ''} 
    class="p-0 !items-start"
>
    <div class="flex flex-row gap-1 md:gap-3 items-start p-0">
        
        <div class="pl-2 pt-2 flex-shrink-1">
            <Avatar fullRes community 
                lazyload={false}
                fadeIn={false}
                width={avatarWidth}  
                rounded ring={false} 
                circle={false}  
                url={site.site.icon} 
                alt={site.site.name}  
                class="mx-auto" 
            />
        </div>

        <div class="flex flex-col gap-0 overflow-hidden break-words border border-slate-300 dark:border-zinc-900 bg-slate-200 dark:bg-zinc-950 rounded-bl-2xl rounded-tr-2xl p-1 w-fit opacity-70 w-full !border-slate-300 dark:!border-zinc-800 pl-4"
            style="width: calc(100% - {avatarWidth}px;"
        >
            
            <span class="flex flex-row w-full">
                
                <span class="flex flex-col w-full">
                    <span class="font-bold w-full text-xl">
                        <a href="/site/{new URL(site.site.actor_id).hostname}" class="hover:underline" title="About {site.site.name}">
                            {site.site.name}
                        </a>
                    </span>

                    <span class="text-base font-normal truncate">
                        {new URL(site.site.actor_id).hostname}
                    </span>
                </span>

                <div class="flex flex-col mt-auto gap-2 items-end pr-2">
                    <!---Lemmy API Version--->
                    <span class="flex flex-row items-center gap-2 text-sm" title="API Version">
                        <!--<Icon src={Server} width={16} height={16} mini />-->
                        <Logo url="/img/lemmy.svg" rounded={false} width={16}/>
                        {version.split('-')[0]}
                    </span>
                    
                    <!---Tesseract Version--->
                    <!-- svelte-ignore missing-declaration -->
                    <span class="flex flex-row items-center gap-2 text-sm" title="Tesseract Version">
                        <Icon src={CubeTransparent} width={16} height={16} mini />
                        {__VERSION__?.split('-')[0]}
                    </span>

                    
                </div>
            </span>
            
        </div>
    </div>

    

    <div class="mt-2"/>

    <Card elevation={0} class="p-1 w-fit opacity-70 w-full !border-slate-300 dark:!border-zinc-800 rounded-b-2xl rounded-t-none">
        <div class="my-auto p-3 italic text-center">
            <Markdown source={site.site.description} />
        </div>

        <div class="flex flex-row w-full">
            
            <div class="mx-auto text-xs md:text-sm flex flex-row w-full flex-wrap gap-0 px-2 justify-between">
                
                <span class="flex flex-col mx-auto items-center gap-1 md:gap-2" title="Site Created">
                    <Icon src={Calendar} width={20} mini />
                    <RelativeDate date={site.site.published} />
                </span>
                
                <span class="flex flex-col mx-auto items-center gap-1 md:gap-2" title="Users">
                    <Icon src={UserGroup} width={20} mini />
                    <span class="capitalize">
                        <FormattedNumber number={site.counts.users}/>
                    </span>
                </span>
            
                <span class="flex flex-col mx-auto items-center gap-1 md:gap-2" title="Posts">
                    <Icon src={PencilSquare} width={20} mini />
                    <FormattedNumber number={site.counts.posts} />
                </span>
    
                <span class="flex flex-col mx-auto items-center gap-1 md:gap-2" title="Comments">
                    <Icon src={ChatBubbleOvalLeftEllipsis} width={20} mini />
                    <FormattedNumber number={site.counts.comments} />
                </span>

                
                <span class="flex flex-col mx-auto items-center gap-1 md:gap-2" title="Communities">
                    <Icon src={Newspaper} width={20} mini />
                    <FormattedNumber number={site.counts.communities} />
                </span>
                
            </div>
        </div>
    </Card>
</Card>