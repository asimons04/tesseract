<script lang="ts">
    import type { PersonProfile } from '../lib/types'
    import type { StandardReport } from './helpers'

    import { fade } from 'svelte/transition'

    import UserCardBasic from './UserCardBasic.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'

    export let creatorProfile:PersonProfile 
    export let display:boolean = true
</script>



{#if display}
<div class="flex flex-col w-full h-full p-2 gap-2 overflow-x-hidden overflow-y-scroll" in:fade={{duration: 300}}>
    {#if creatorProfile.loading}
        <span class="flex flex-row w-full items-center">        
            <span class="ml-auto"/>
            <Spinner width={64}/>
            <span class="mr-auto"/>
        </span>
    {:else}
        {#if creatorProfile?.person_view }
            <UserCardBasic person={creatorProfile.person_view} />
        {/if}
    {/if}
</div>
{/if}