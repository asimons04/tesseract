<script lang="ts">
    import type { Community } from 'lemmy-js-client'
  
    import Button from '$lib/components/input/Button.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte';

    export let community:Community
    export let hidden:boolean = false
    export let expanded:boolean = true;
</script>


<Button {hidden}
    class="!text-xs hover:bg-slate-200 w-full h-max {expanded ? '' : '!p-1.5'}"
    color="tertiary"
    alignment="left"
    href="/c/{community.name}@{new URL(community.actor_id).hostname}"
    title="{community.title.replace('&amp;', '&')}@{new URL(community.actor_id).hostname}"
>
    <CommunityLink bind:community 
        boldCommunityName={true} 
        avatarSize={expanded ? 28 : 20} 
        avatar 
        maxNameLength={30} 
        inline={false} 
        bind:name={expanded}
        href={!expanded}
    />
</Button>