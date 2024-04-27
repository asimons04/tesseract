<script lang="ts">
    import type { Instance } from 'lemmy-js-client'
    import Button from '$lib/components/input/Button.svelte';
    import Fediseer from '$lib/fediseer/Fediseer.svelte';   
    import { Icon, ArrowTopRightOnSquare, Eye  } from 'svelte-hero-icons'

    export let instance: Instance
    
    let fediseerModal = false
    
    
</script>   

{#if instance.domain}
    {#if fediseerModal}
        <Fediseer bind:open={fediseerModal} instance={instance.domain} />
    {/if}

    <div class="bg-slate-100 dark:bg-zinc-800 text-black dark:text-slate-100 border border-slate-900 dark:border-zinc-100 p-2 text-sm rounded-md leading-[22px]">    
        <div class="flex flex-row gap-2 items-center w-full">
            
            <div class="flex flex-col w-full gap-1">
                <span class="text-base font-bold">{instance.domain}</span>
                <span class="text-xs font-normal">{instance.software} {instance.version}</span>
            </div>    

            <span class="flex flex-row ml-auto gap-2 items-center">
                <Button size="square-lg" color="tertiary-border" href="https://{instance.domain}" newtab={true} title="Visit Instance">
                    <Icon src={ArrowTopRightOnSquare} mini width={24}/>
                </Button>

                <Button size="square-lg" color="tertiary-border"  on:click={(e) => fediseerModal = true} title="Fediseer">
                    <Icon src={Eye} mini width={24}/>
                </Button>
            </span>
            
        </div>
    </div>
{/if}