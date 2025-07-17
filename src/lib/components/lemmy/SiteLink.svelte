<script lang="ts">
    import type { Site } from 'lemmy-js-client'
    
    import Avatar from '$lib/components/ui/Avatar.svelte'
    
    export let site: Site
    export let avatar: boolean = false
    export let avatarSize: number = 24
    export let href: string | undefined = undefined
    export let boldName:boolean = true
    export let showDescription:boolean = true
    
</script>


<div class="items-center flex flex-row gap-2 text-sm">
    {#if avatar}
        <Avatar url={site.icon} alt="Site icon for {site.name}"  width={avatarSize} ring />
    {/if}
    
    <span class="flex flex-col gap-1 ">
        <a class="{boldName ? 'font-bold' : 'font-normal'} hover:underline" href={href ?? site.actor_id}  title={site.name}>
            {site.name} [{new URL(site.actor_id).hostname}]
        </a>

        {#if showDescription }    
        <span class="text-slate-500 dark:text-zinc-500 font-normal">
            {site.description}
        </span>
        {/if}
    </span>
    
</div>
