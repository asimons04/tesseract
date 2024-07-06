<script lang="ts">
    import type { Snapshot } from '@sveltejs/kit';    
    
    import { PageSnapshot } from '$lib/storage.js';
    import { scrollToLastSeenPost } from '$lib/components/lemmy/post/helpers.js';
    import { userSettings } from '$lib/settings'
    import UserPage from '../../u/[name]/+page.svelte'

    export let data

    // Page state that will persist in snapshots
    let pageState = {
        scrollY: 0,
    }

    // Store and reload the page data between navigations (Override functions to use LocalStorage instead of Session Storage)
    // Also jumps to last seen post upon restore.
    export const snapshot: Snapshot<void> = {
        capture: () => {
            pageState.scrollY = window.scrollY
            if ($userSettings.uiState.infiniteScroll) PageSnapshot.capture({data: data, state: pageState})
        },
        restore: async () => {
            try { 
                if ($userSettings.uiState.infiniteScroll)  {
                    let snapshot = PageSnapshot.restore() 
                    if (snapshot.data)  data = snapshot.data
                    if (snapshot.state) pageState = snapshot.state
                }

                await scrollToLastSeenPost(data.items.length + 200)
            }
            catch { 
                PageSnapshot.clear() 
                window.scrollTo(0,0)
            }
        }
    }


</script>


<UserPage bind:data={data}/>

