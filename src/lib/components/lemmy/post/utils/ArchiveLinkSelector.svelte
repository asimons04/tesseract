<script lang="ts">
    import { lookup } from '$lib/MBFC/client'
    import { isYouTube, removeURLParams } from "../helpers"
    import { toast } from '$lib/components/ui/toasts/toasts'
    import { userSettings } from '$lib/settings'

    import Button from "$lib/components/input/Button.svelte";
    import Menu from "$lib/components/ui/menu/Menu.svelte"
    import MenuButton from "$lib/components/ui/menu/MenuButton.svelte"

    import { 
        CheckBadge,
        ChevronDown, 
        ChevronUp, 
        Icon, 
        Link as LinkIcon,
        Share,
    } from 'svelte-hero-icons'

    export let url:string | undefined
    export let postType:string = 'link'

    function updateYTHostname(original_url:string, new_hostname:string) {
        try {
            const tempURL = new URL(original_url)
            tempURL.hostname = new_hostname
            return tempURL.toString()
        }
        catch {
            return original_url
        }
    }

    let MBFCResults = url ? lookup(url) : undefined
</script>

{#if url}
    <Menu alignment="bottom-left" > <!--class="z-10"-->
        <Button slot="button" size="sm" color="ghost" aria-label="Archive Link Selector" let:toggleOpen let:open on:click={toggleOpen} title="Alternate Sources">
            <span class="flex flex-row gap-1 items-center">
                <Icon src={LinkIcon} width={14} mini />
                <Icon src={open ? ChevronUp : ChevronDown} min width={14}/>
            </span>
        </Button>

       
        
        
        {#if ['link', 'thumbLink', 'youtube'].includes(postType)}
            <div class="flex flex-row items-center text-xs font-bold opacity-100 text-left mx-4 my-1 py-1 min-w-[175px]">
                Alternate Sources
                <span class="ml-auto"/>
                <Icon slot="icon" src={LinkIcon} width={16} mini />
            </div>
            <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />
        {/if}

        <!---Archive Link Providers for 'link' Post Types--->
        {#if ['link', 'thumbLink'].includes(postType)}
            

            <MenuButton color="info" link href="https://archive.ph/{removeURLParams(url)}" newtab={$userSettings.openInNewTab.links} title="Archive Today">
                Archive Today
            </MenuButton>

            <MenuButton color="info" link href="https://ghostarchive.org/search?term={removeURLParams(url)}" newtab={$userSettings.openInNewTab.links} title="Ghost Archive">
                Ghost Archive
            </MenuButton>

            <MenuButton color="info" link href="https://12ft.io/proxy?q={removeURLParams(url)}" newtab={$userSettings.openInNewTab.links} title="12ft IO">
                12ft.io
            </MenuButton>

            <MenuButton color="info" link href=" https://ground.news/find?url={removeURLParams(url)}" newtab={$userSettings.openInNewTab.links} title="Ground News">
                Ground News
            </MenuButton>
            
            <div class="flex flex-row items-center text-xs font-bold opacity-100 text-left mx-4 mt-4 mb-1 py-1 min-w-[175px]">
                Fact Check
                <span class="ml-auto"/>
                <Icon slot="icon" src={CheckBadge} width={16} mini />
            </div>
            <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />           
            
            {#if MBFCResults?.url}
                <MenuButton color="info" link href={MBFCResults.url} newtab={$userSettings.openInNewTab.links} title="Media Bias Fact Check">
                    Media Bias Fact Check
                </MenuButton>
            {/if}
            
            <MenuButton color="info" link href="https://spinscore.io/?url={removeURLParams(url)}" newtab={$userSettings.openInNewTab.links} title="SpinScore.io">
                SpinScore.io
            </MenuButton>
        {/if}

        <!---Piped/Invidious Providers for 'youtube' Post Types--->
        {#if postType == 'youtube'}
            <MenuButton color="info" title="Invidious" link href={updateYTHostname(url, $userSettings.embeddedMedia.customInvidious)} newtab={$userSettings.openInNewTab.links}>
                Invidious/Piped
            </MenuButton>
            
            {#if !isYouTube(url)}
            <MenuButton color="info" title="Invidious" link href={updateYTHostname(url, 'youtube.com')} newtab={$userSettings.openInNewTab.links}>
                YouTube
            </MenuButton>
            {/if}
        {/if}


        {#if ['link', 'thumbLink', 'youtube'].includes(postType)}
            <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />
        {/if}
        
        <MenuButton title="Share" color="success"
            on:click={() => {
                navigator.share?.({
                    url: url
                }) ?? navigator.clipboard.writeText(url)
                toast({
                    type: 'success',
                    content: `Copied URL to clipboard!`,
                    title: 'Copied'
                })
                
            }}
        >
            <Icon src={Share} width={16} mini />
            Copy Link
        </MenuButton>

    </Menu>
{/if}