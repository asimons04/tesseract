<script lang="ts">
    import { lookup } from '$lib/MBFC/client'
    import { hrColors } from '$lib/ui/colors';
    import { linkPreviewModal } from "$lib/components/lemmy/moderation/moderation";
    import { removeURLParams } from "../helpers"
    import { toast } from '$lib/components/ui/toasts/toasts'
    import { userSettings } from '$lib/settings'

    import Button from "$lib/components/input/Button.svelte";
    import Menu from "$lib/components/ui/menu/Menu.svelte"
    import MenuButton from "$lib/components/ui/menu/MenuButton.svelte"

    import { 
        CheckBadge,
        ChevronDown, 
        ChevronUp, 
        Eye, 
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
            
            <!---Archive Today--->
            <div class="flex flex-row items-center gap-1 w-full">
                <MenuButton color="info" link href="https://archive.ph/{removeURLParams(url)}" newtab={true} title="Archive Today" containerClass="w-[calc(100%-48px)]">
                    Archive Today
                </MenuButton>

                <MenuButton icon={Eye} iconSize={14} size="square-sm" color="info" title="Load in IFrame" on:click={() => {
                    let previewURL = `https://archive.ph/${removeURLParams(url)}`
                    linkPreviewModal(previewURL, true)
                }}/>
            </div>

            <!---Ghost Archive--->
            <div class="flex flex-row items-center gap-1 w-full">
                <MenuButton color="info" link href="https://ghostarchive.org/search?term={removeURLParams(url)}" newtab={true} title="Ghost Archive" containerClass="w-[calc(100%-48px)]">
                    Ghost Archive
                </MenuButton>

                <MenuButton icon={Eye} iconSize={14} size="square-sm" color="info" title="Load in IFrame" on:click={() => {
                    let previewURL = `https://ghostarchive.org/search?term=${removeURLParams(url)}`
                    linkPreviewModal(previewURL, true)
                }}/>

            </div>

            <!---12ft.io
            <MenuButton color="info" link href="https://12ft.io/proxy?q={removeURLParams(url)}" newtab={true} title="12ft IO">
                12ft.io
            </MenuButton>
            --->

            <!---RemovePaywall.com--->
            <MenuButton color="info" link href="https://www.removepaywall.com/search?url={removeURLParams(url)}" newtab={true} title="Remove Paywalls" containerClass="w-[calc(100%-48px)]">
                RemovePaywall.com
            </MenuButton>
            

            <!---Ground News--->
            <MenuButton color="info" link href=" https://ground.news/find?url={removeURLParams(url)}" newtab={true} title="Ground News">
                Ground News
            </MenuButton>
            
            <!---Fact Check Section--->
            <div class="flex flex-row items-center text-xs font-bold opacity-100 text-left mx-4 mt-4 mb-1 py-1 min-w-[175px]">
                Fact Check
                <span class="ml-auto"/>
                <Icon slot="icon" src={CheckBadge} width={16} mini />
            </div>
            <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />           
            
            <!---MBFC--->
            {#if MBFCResults?.url}
                <div class="flex flex-row items-center gap-1 w-full">
                    <MenuButton color="info" link href={MBFCResults.url} newtab={true} title="Media Bias Fact Check" containerClass="w-[calc(100%-48px)]">
                        Media Bias Fact Check
                    </MenuButton>

                    <MenuButton icon={Eye} iconSize={14} size="square-sm" color="info" title="Load in IFrame" on:click={() => {
                        linkPreviewModal(MBFCResults.url, true)
                    }}/>
                </div>
            {/if}
            
            <!---SpinScore.io--->
            <div class="flex flex-row items-center gap-1 w-full">
                <MenuButton color="info" link href="https://spinscore.io/?url={removeURLParams(url)}" newtab={true} title="SpinScore.io" containerClass="w-[calc(100%-48px)]">
                    SpinScore.io
                </MenuButton>

                <MenuButton icon={Eye} iconSize={14} size="square-sm" color="info" on:click={() => {
                    let previewURL = `https://spinscore.io/?url=${removeURLParams(url)}`
                    linkPreviewModal(previewURL, true)
                }}/>
            </div>
        {/if}

        <!---Piped/Invidious Providers for 'youtube' Post Types--->
        {#if postType == 'youtube'}
            <div class="flex flex-col max-h-[20vh] overflow-y-scroll">
                <!---Show Canonical Youtube Button in case Some Jerk Linked to some Shady/Unreliable/Dead Invid/Piped instance--->
                <MenuButton color="info" title="YouTube" link href={updateYTHostname(url, 'youtube.com')} newtab={true}>
                    YouTube
                </MenuButton>    
                
                <!---Add any user-defined custom Piped/Invidious Instances to the List--->                
                {#if $userSettings.embeddedMedia.userDefinedInvidious.length > 0}
                    {#each $userSettings.embeddedMedia.userDefinedInvidious as invInstance}
                        <MenuButton color="info" title="{invInstance}" link href={updateYTHostname(url, invInstance)} newtab={true}>
                            {invInstance}
                        </MenuButton>
                    {/each}
                {/if}
            </div>
        {/if}


        {#if ['link', 'thumbLink', 'youtube'].includes(postType) }
            <hr class="{hrColors}} my-2 mx-auto" />
        {/if}
        
        <!---Copy Link--->
        <MenuButton title="Share" color="success"
            on:click={() => {
                navigator.clipboard.writeText(url)
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
        
        <!---Preview--->
        <div class="flex flex-row items-center gap-1 w-full">
            <MenuButton title="Preview" color="info" containerClass="w-[calc(100%-48px)]"
                on:click={(e) => {
                    linkPreviewModal(url)
                }}
            >
                <Icon src={Eye} width={16} mini />
                Preview
            </MenuButton>

            <MenuButton icon={Eye} iconSize={14} color="info" title="Load Link in IFrame" on:click={() => {
                linkPreviewModal(url, true)
            }}/>
        </div>
    </Menu>
{/if}