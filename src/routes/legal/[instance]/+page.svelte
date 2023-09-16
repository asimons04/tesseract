<script lang="ts">
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Link from '$lib/components/input/Link.svelte'
    import Logo from '$lib/components/ui/Logo.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte';
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

<div class="flex flex-col md:flex-row gap-4 w-full">
    <div class="flex flex-col gap-3 sm:gap-4 max-w-full w-full min-w-0">
        
        <span class="flex gap-4 items-center font-bold text-xl text-center mx-auto">
            {#if data.site.site_view.site.icon}
                <Avatar circle={false} width={48} url={data.site.site_view.site.icon} />
            {/if}
            {data.site.site_view.site.name}
        </span>
        
        <div class="max-w-3xl mx-auto">
            <Markdown source={data.site.site_view.local_site.legal_information ?? "There's nothing here"} />
        </div>
    </div>
    
    <div class="hidden lg:block xl:block">
        <SiteCard site={data.site.site_view} taglines={data.site.taglines} />
      </div>
</div>


        
    
    

    
        
  
