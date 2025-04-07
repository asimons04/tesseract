<script lang="ts">
    import type { SiteView } from "lemmy-js-client"
    
    import { createEventDispatcher } from "svelte"
    import { slide } from "svelte/transition"

    import Avatar from "$lib/components/ui/Avatar.svelte"

    export let site: SiteView
    export let avatarWidth = 32
</script>


<div class="flex flex-row gap-2 items-center" transition:slide>
    <Avatar fullRes community 
        lazyload={false}
        fadeIn={false}
        width={avatarWidth}  
        rounded={false}
        ring={false} 
        circle={false}  
        url={site.site.icon} 
        alt={site.site.name}  
        class="mx-auto" 
    />

    <span class="text-lg font-bold truncate">
        <a href="/site/{new URL(site.site.actor_id).hostname}" class="hover:underline" title="About {site.site.name}">
            {site.site.name}
        </a>
    </span>

</div>