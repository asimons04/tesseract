import { load as loadModlog } from '$routes/modlog/+page'
import { getClient } from '$lib/lemmy.js'


export async function load(req: any) {
    const community = await getClient().getCommunity({
        name: req.params.name,
    })

    const modlogSearchURL = new URL('https://localhost')
    modlogSearchURL.searchParams.set('community', community.community_view.community.id.toString())
    const modlog = await loadModlog({url: modlogSearchURL})
    
    return {
        community: community,
        modlog: modlog
    }
}
    
    