<script lang="ts">
    import type { InstanceWithFederationState } from 'lemmy-js-client'
    import Button from '$lib/components/input/Button.svelte';
    import Fediseer from '$lib/fediseer/Fediseer.svelte';   
    import RelativeDate from '$lib/components/util/RelativeDate.svelte';

    import { Icon, ArrowTopRightOnSquare, Eye, Calendar, Check, HandThumbDown, UserGroup  } from 'svelte-hero-icons'

    export let instance: InstanceWithFederationState
    export let filterTerm:string = ''
    export let hideDead:boolean = false
    export let softwareType:string = 'All'

    let fediseerModal = false


    // Check if instance is dead (not updated for > 3 days
    function isDead(updated:string|undefined):boolean {
        if (!updated) return true
        if (!updated.endsWith('Z')) updated += 'Z'
        
        let delta = 3 * 24 * 60 * 60 // 3 days -> seconds
        let lastUpdated = Math.floor(Date.parse(updated)/1000)  // Date in ms->seconds
        let now = Math.floor(Number(Date.now().toString()) /1000)

        if ( (now-delta) > lastUpdated) return true
        return false
    }
    
    $: dead = instance.updated
        ? isDead(instance.updated) && hideDead
        : true

    $: showInstance = (
        instance.domain && 
        (filterTerm == '' || instance.domain.includes(filterTerm)) && 
        (softwareType=='All' || softwareType == instance.software) &&
        !dead

    )
</script>   

{#if showInstance}
    {#if fediseerModal}
        <Fediseer bind:open={fediseerModal} instance={instance.domain} />
    {/if}

    <div class="bg-slate-100 dark:bg-zinc-800 text-black dark:text-slate-100 border border-slate-900 dark:border-zinc-100 p-2 text-sm rounded-md leading-[22px]">    
        <div class="flex flex-row gap-2 items-center w-full">
            
            <div class="flex flex-col w-full gap-1">
                <span class="text-base font-bold">
                    {instance.domain} 
                </span>
                
                <span class="flex flex-row text-xs gap-4 font-normal">
                    
                    {#if instance.published}
                        <span class="flex flex-row gap-1" title="Published">
                            <Icon mini src={Calendar} width={18} />
                            <RelativeDate date={instance.published} /> 
                        </span>
                    {/if}

                    {#if instance.updated}
                        <span class="flex flex-row gap-1" title="Updated">
                            <Icon mini src={Eye} width={18} />
                            <RelativeDate date={instance.updated} /> 
                        </span>
                    {/if}

                    <span class="flex flex-row gap-1">
                        {#if isDead(instance.updated)}
                            <Icon mini src={HandThumbDown} width={18} />
                            Dead
                        {:else}
                            <Icon mini src={Check} width={18} />
                        {/if}
                    </span>
                </span>

                <span class="flex flex-row text-xs font-normal">
                    {instance.software ? instance.software : ''} {instance.version ? instance.version : ''}
                </span>
            </div>    

            <span class="flex flex-row ml-auto gap-2 items-center">
                {#if instance.software == 'lemmy'}
                    <Button size="square-lg" color="tertiary-border" href="/communities?instance={instance.domain}&type=Local" newtab={true} title="Browse communities at {instance.domain}">
                        <Icon src={UserGroup} width={24} mini />
                    </Button>
                {/if}
                
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