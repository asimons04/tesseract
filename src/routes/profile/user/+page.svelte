<script lang="ts">
    import type { Snapshot } from '@sveltejs/kit';    
    
    import { PageSnapshot } from '$lib/storage.js';
    import { scrollTo, scrollToLastSeenPost } from '$lib/components/lemmy/post/helpers.js';

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
            PageSnapshot.capture({data: data, state: pageState})
        },
        restore: async () => {
            try { 
                let snapshot = PageSnapshot.restore() 
                if (snapshot.data)  data = snapshot.data
                if (snapshot.state) pageState = snapshot.state
                
                if (data.type == 'all' || data.type == 'comments')
                    await scrollTo(pageState.scrollY, 300)
                else  await scrollToLastSeenPost(data.user.submissions.length + 200)
            }
            catch { 
                PageSnapshot.clear() 
                window.scrollTo(0,0)
            }
        }
    }
</script>

{#if data.user && data.sort && data.type && data.page}
    <UserPage data={
        {
            items: data.user.submissions,
            page: data.page,
            person_view: data.user.person_view,
            moderates: data.user.moderates,
            sort: data.sort,
            type: data.type,
            limit: data.limit
        }
    }/>
{/if}
