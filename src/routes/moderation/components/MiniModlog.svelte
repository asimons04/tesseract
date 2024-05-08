<script lang="ts">
    import type { ModlogContainer} from '../lib/types'
    import type { StandardReport } from './helpers'
    

    import { fade } from 'svelte/transition'
    import { isCommentReport } from '$lib/lemmy/item.js'

    import ModlogItemList from '$routes/modlog/item/ModlogItemList.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    export let modlog:ModlogContainer 
    export let display:boolean = true
    export let item: StandardReport
</script>


{#if display}
    <div class="w-full p-2 gap-2 overflow-x-hidden overflow-y-scroll" in:fade={{duration: 300}}>
        {#if modlog.loading}
            <span class="flex flex-row w-full items-center">    
                <span class="ml-auto"/>
                <Spinner width={64}/>
                <span class="mr-auto"/>
            </span>
        {:else}
            <h1 class="text-lg font-bold">Modlog History</h1>
            <p class="text-sm font-normal">
                Abridged modlog filtered for <UserLink user={item.reportee} />
            </p>

            {#if modlog?.data?.modlog && modlog.data.modlog?.length > 0}
                <div class="flex flex-col gap-4 mt-2">
                    {#each modlog.data.modlog as modlogItem}
                        {#if [
                                'postRemoval', 'postRestore', 'postLock', 'postUnlock', 'commentRemoval', 'commentRestore', 
                                'ban', 'unban' ,'banCommunity', 'unbanCommunity'
                            ].includes(modlogItem.actionName)
                        }
                            <div class="bg-slate-200 border border-slate-200 dark:border-zinc-800 dark:bg-zinc-900 p-2 text-sm rounded-md leading-[22px]">    
                                <ModlogItemList item={modlogItem} />
                            </div>
                        {/if}

                    {/each}
                </div>

            {/if}
        {/if}
    </div>
{/if}