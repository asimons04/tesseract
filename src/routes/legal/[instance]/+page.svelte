<script lang="ts">
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte';
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import Markdown from '$lib/components/markdown/Markdown.svelte';
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte';

    import { page } from '$app/stores'
    import { goto } from '$app/navigation'
    import { LINKED_INSTANCE_URL } from "$lib/instance.js";
    
    
    

    export let data;

    if (LINKED_INSTANCE_URL && LINKED_INSTANCE_URL != $page.params.instance) {
        goto(`/legal/${LINKED_INSTANCE_URL}`);
    }

</script>

<svelte:head>
    <title>{data.site.site_view.site.name} | Legal</title>
</svelte:head>

<SubNavbar home back toggleMargins toggleCommunitySidebar scrollButtons/>

<MainContentArea>
    <FeedContainer>
        <span class="flex gap-4 items-center font-bold text-xl md:text-2xl lg:text-3xl text-center mx-auto">
            {#if data.site.site_view.site.icon}
                <Avatar circle={false} width={48} url={data.site.site_view.site.icon} />
            {/if}
            {data.site.site_view.site.name}: Legal Information
        </span>
        <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />

        <div class="flex w-full">
            <Markdown source={data.site.site_view.local_site.legal_information ?? "There's nothing here"} />
        </div>

    </FeedContainer>

    

    <SiteCard site={data.site.site_view} taglines={data.site.taglines} admins={data.site.admins} version={data.site.version} slot="right-panel" class="hidden xl:flex"/>
</MainContentArea>


        
    
    

    
        
  
