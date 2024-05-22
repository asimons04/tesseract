<script lang="ts">
    import { removeURLParams } from "../helpers"
    import { userSettings, YTFrontends } from '$lib/settings'

    import Button from "$lib/components/input/Button.svelte";
    import Menu from "$lib/components/ui/menu/Menu.svelte"
    import MenuButton from "$lib/components/ui/menu/MenuButton.svelte"
    import MultiSelect from "$lib/components/input/MultiSelect.svelte"
    

    import { 
        ChevronDown, 
        ChevronUp, 
        Icon, 
        Link as LinkIcon 
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
</script>

{#if url}
    <Menu alignment="bottom-left">
        <Button slot="button" size="sm" aria-label="Archive Link Selector" let:toggleOpen let:open on:click={toggleOpen} title="Archive Links">
            <span class="flex flex-row gap-1 items-center">
                <Icon src={LinkIcon} width={14} mini />
                <Icon src={open ? ChevronUp : ChevronDown} min width={14}/>
            </span>
        </Button>

        <li class="flex flex-row items-center text-xs font-bold opacity-100 text-left mx-4 my-1 py-1 min-w-[175px]">
            Alternate Sources
            <span class="ml-auto"/>
            <Icon slot="icon" src={LinkIcon} width={16} mini />
        </li>
        <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />
        
        <!---Archive Link Providers for 'link' Post Types--->
        {#if postType == 'link'}
            <MenuButton color="info" link href="https://archive.ph/{removeURLParams(url)}" newtab={$userSettings.openInNewTab.links} title="Archive.ph">
                Archive.ph
            </MenuButton>

            <MenuButton color="info" link href="https://12ft.io/proxy?q={removeURLParams(url)}" newtab={$userSettings.openInNewTab.links} title="12ft IO">
                12ft.io
            </MenuButton>
        {/if}

        <!---Piped/Invidious Providers for 'youtube' Post Types--->
        {#if postType == 'youtube'}
            <MenuButton color="info" title="Invidious" link href={updateYTHostname(url, $userSettings.embeddedMedia.customInvidious)} newtab={$userSettings.openInNewTab.links}>
                Invidious
            </MenuButton>

            <MenuButton color="info" title="Invidious" link href={updateYTHostname(url, $userSettings.embeddedMedia.customPiped)} newtab={$userSettings.openInNewTab.links}>
                Piped
            </MenuButton>

            <MenuButton color="info" title="Invidious" link href={updateYTHostname(url, 'youtube.com')} newtab={$userSettings.openInNewTab.links}>
                YouTube
            </MenuButton>
        {/if}

    </Menu>
{/if}