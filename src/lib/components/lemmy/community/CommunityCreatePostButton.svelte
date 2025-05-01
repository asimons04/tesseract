<script lang="ts">
    import type { CommunityView } from "lemmy-js-client"

    import { amMod }        from "../moderation/moderation"
    import { createPost }   from "./helpers"
    import { profile }      from '$lib/auth'

    import Button           from "$lib/components/input/Button.svelte"
    
    import { PencilSquare } from "svelte-hero-icons"

    export let community_view: CommunityView

</script>

<Button color="tertiary-border" class="{$$props.class}" size="lg"
    on:click={() => createPost(community_view.community)}
    icon={PencilSquare}
    disabled={
        (!$profile?.user) ||
        (community_view.community.posting_restricted_to_mods && !amMod($profile?.user, community_view.community)) || 
        community_view.community.removed ||
        community_view.banned_from_community ||
        (
            community_view.community.visibility == 'LocalOnly' && 
            new URL($profile.user.local_user_view.person.actor_id).hostname != new URL(community_view.community.actor_id).hostname
        )
    }
>
    Create Post
</Button>