import { get } from 'svelte/store'
import { getClient } from '$lib/lemmy.js'
import { goto } from '$app/navigation'
import { profile } from '$lib/auth.js'
import { removeToast, toast } from '$lib/components/ui/toasts/toasts.js'

let resolvingToastID: undefined | number = undefined

export async function load(req: any) {
    try {
        return {
            community: await getClient().getCommunity({
                name: req.params.community_name,
            })
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
            return

        }
        resolvingToastID = toast({
            content: `This community is not known to your instance. Fetching community from its home instance. This may take a moment...`,
            type: 'success',
            title: "Please Wait",
            loading: true,
            duration: 15000
        })

        try {
            await getClient().resolveObject({
                q: '!' + req.params.community_name,
            })
            if (resolvingToastID) removeToast(resolvingToastID)
            return {
                community: await getClient().getCommunity({
                    name: req.params.community_name,
                }),
            }
        }
        catch {
            if (resolvingToastID) removeToast(resolvingToastID)
            return { community: undefined }
        }
    }
}

