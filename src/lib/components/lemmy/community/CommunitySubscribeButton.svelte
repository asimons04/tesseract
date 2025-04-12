<script lang="ts">
    import type { CommunityView, GetCommunityResponse } from "lemmy-js-client"
    
    import { StorageCache, StorageController } from '$lib/storage-controller'
    import Button from "$lib/components/input/Button.svelte"

    import { addSubscription } from "$lib/lemmy/user"
    import { getClient } from "$lib/lemmy"
    import { instance } from "$lib/instance"
    import { profile } from "$lib/auth"
    import { toast } from "$lib/components/ui/toasts/toasts"
    

    import { Minus, Rss } from 'svelte-hero-icons'
    import { cache } from "$lib/cache/memory";
    
    export let community_view: CommunityView

    const storage = new StorageCache({
        type: 'session',
        ttl: 15,
        useCompression: true   
    })

    let subscribing = false

    async function subscribe() {
        if (!$profile?.jwt) return
        subscribing = true
        
        const subscribed = community_view.subscribed == 'Subscribed' || community_view.subscribed == 'Pending'
        try {
            await getClient().followCommunity({
                community_id: community_view.community.id,
                follow: !subscribed,
            })
        } catch (error) {
            toast({ content: error as any, type: 'error' })
        }

        community_view.subscribed = subscribed ? 'NotSubscribed' : 'Subscribed'
        addSubscription(community_view.community, !subscribed)

        // Update the cached data
        let cachedCommunityResponse = await storage.getCommunityResponse(`${community_view.community.name}@${new URL(community_view.community.actor_id).hostname}`)
        
        if (cachedCommunityResponse) {
            // Replace the community_view on the cache response since we have CommunityResponse and that only accepts GetCommunityResponse
            cachedCommunityResponse = {
                ...cachedCommunityResponse,
                community_view: community_view
            }
            await storage.putCommunityResponse(cachedCommunityResponse)
        }
        
        /*
        const storageKey = `getCommunity_${$instance}:${community_view.community.name}@${new URL(community_view.community.actor_id).hostname}`
        let cachedCommunityResponse: GetCommunityResponse | undefined = await storage.get(storageKey)
        
        if (cachedCommunityResponse) {
            cachedCommunityResponse = {
                ...cachedCommunityResponse,
                community_view: community_view
            }
            await storage.put(storageKey, cachedCommunityResponse)
        }
        */


        subscribing = false
    }


</script>

<!---Subscrube/UnSubscribe--->
<Button color="tertiary-border" class="{$$props.class}" size="lg" 
    loading={subscribing}
    disabled={subscribing || community_view.community.removed || !$profile?.jwt || community_view.banned_from_community} 
    icon={community_view.subscribed == 'Subscribed' ? Minus : Rss}
    on:click={ (e) => {
        e.stopPropagation();
        subscribe();
    }}
    >
        {
            (community_view.subscribed == 'Subscribed' || community_view.subscribed == 'Pending')
                ? 'Unsubscribe'
                : 'Subscribe'
        }
</Button>
