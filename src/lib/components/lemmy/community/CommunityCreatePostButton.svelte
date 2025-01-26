<script lang="ts">
    import type { CommunityView } from "lemmy-js-client"

    import { amMod } from "../moderation/moderation"
    import { createPost } from "./helpers"
    import { profile } from '$lib/auth'

    import Button from "$lib/components/input/Button.svelte";
    
    import { PencilSquare } from "svelte-hero-icons"
    
    
    

    export let community_view: CommunityView

</script>

<Button color="tertiary-border" class="{$$props.class}" size="lg"
    on:click={() => createPost(community_view.community)}
    icon={PencilSquare}
    disabled={
        (community_view.community.posting_restricted_to_mods && !amMod($profile?.user, community_view.community)) || 
        community_view.community.removed ||
        (!$profile?.jwt)
    }
>
    Create Post
</Button>