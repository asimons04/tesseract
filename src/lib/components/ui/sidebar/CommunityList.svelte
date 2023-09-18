<script lang="ts">
    import Badge from '$lib/components/ui/Badge.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Avatar from '$lib/components/ui/Avatar.svelte'
    import type { Community } from 'lemmy-js-client'
    import { flip } from 'svelte/animate'
    import { expoOut } from 'svelte/easing'
    import { slide, fade } from 'svelte/transition'

    export let items: Community[]
    export let expanded: boolean
    export let hidden: boolean
    export let filter: string

</script>

<!---min-h-[10vh]--->
<div class="h-auto overflow-y-auto flex flex-col { expanded ? 'pl-1' : '' }"
    class:hidden={hidden}
>
    {#each items.sort( (a, b) => a.title.localeCompare(b.title) ) as follow (follow.id)}
        <div class="inline-flex w-full"
            animate:fade={{ duration: 50, easing: expoOut }}
            class:hidden={ filter && !follow.title.toLowerCase().trim().includes(filter.trim()) }
        >
        
            <Button
                class="hover:bg-slate-200 w-full h-max {expanded ? '' : '!p-1.5'}"
                color="tertiary"
                alignment="left"
                href="/c/{follow.name}@{new URL(follow.actor_id).hostname}"
                title="{follow.title.replace('&amp;', '&')}@{new URL(follow.actor_id).hostname}"
            >
                <div class="flex-none">
                    <Avatar
                        url={follow.icon}
                        alt={follow.name}
                        title={follow.title}
                        width={20}
                        slot="icon"
                    />
                </div>
                
                <span class="w-full break-words flex flex-row justify-between" class:hidden={!expanded}>
                    {follow.title.replace('&amp;', '&')}

                    {#if follow.nsfw}
                        <Badge color="red">NSFW</Badge>
                    {/if}
                </span>
            </Button>
        </div>
    {/each}
</div>
