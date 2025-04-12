import { get } from 'svelte/store'
import { getClient } from '$lib/lemmy.js'
import { goto } from '$app/navigation'
import { profile } from '$lib/auth.js'
import { toast } from '$lib/components/ui/toasts/toasts.js'


export async function load(req: any) {
    try {
        let getCommunityResponse = await getClient().getCommunity({
            name: req.params.community_name,
        })

        return {
            community: getCommunityResponse,
        }
    }
    
    // If the community is not found, try to resolve it
    catch {
        if (!get(profile)?.jwt) {
            toast({
                title: "Notice",
                content: `You must be logged in to resolve communities not currently known to this instance.`,
                type: 'warning',
            })
            goto('/communities');
            return

        }
        toast({
            content: `This community is not known to your instance. Fetching community from its home instance. This may take a moment...`,
            type: 'success',
            title: "Please Wait",
            loading: true,
            duration: 15000
        })

        await getClient().resolveObject({
            q: '!' + req.params.community_name,
        })
       
        return {
            community: await getClient().getCommunity({
                name: req.params.community_name,
            }),
        }
    }
}

