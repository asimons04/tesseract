<script lang="ts">
    import type { CommunityView } from 'lemmy-js-client'
    
    import { getClient } from '$lib/lemmy.js'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'


    export let community: CommunityView

    let subscribing = false

    async function subscribe() {
        if (!$profile?.jwt) return

        subscribing = true

        try {
            const resolve = await getClient().resolveObject({
                auth: $profile.jwt,
                q: community.community.actor_id
            })

            if (!resolve.community) {
                toast({
                    title: 'Error',
                    type: 'error',
                    content: 'Unable to resolve community'
                })
                return
            }

            const resolvedCommunity = resolve.community

      
            const res = await getClient().followCommunity({
                auth: $profile.jwt,
                community_id: resolvedCommunity.community.id,
                follow: community.subscribed == 'NotSubscribed',
            })

            subscribing = false
            return res

        } 
        catch (error) {
            toast({ 
                content: 'Failed to subscribe to community', 
                type: 'error',
                title: 'Error'
            })
        }

        subscribing = false
  }
</script>

<slot {subscribe} {subscribing} />
