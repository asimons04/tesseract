<script>
    import Link from '$lib/components/input/Link.svelte'
    import Logo from '$lib/components/ui/Logo.svelte'
    import Application from '../admin/applications/Application.svelte';
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte';

    export let data;
</script>

<title>Legal</title>
<div class="flex flex-col md:flex-row gap-4 w-full">
    <div class="flex flex-col gap-3 sm:gap-4 max-w-full w-full min-w-0">
        <Markdown source={data.site.site_view.local_site.legal_information ?? "There's nothing here"} />
    </div>
    
    <div class="hidden lg:block xl:block">
        <SiteCard site={data.site.site_view} taglines={data.site.taglines} />
      </div>
</div>


        
    
    

    
        
  
