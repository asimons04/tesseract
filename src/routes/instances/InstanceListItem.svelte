<script lang="ts">
    import type { InstanceWithFederationState, ReadableFederationState} from 'lemmy-js-client'
    import type { InstanceWithFederationStateCustom } from './+page'
    
    import { getClient } from '$lib/lemmy'
    import { instance as currentInstance} from '$lib/instance'
    
    import Button from '$lib/components/input/Button.svelte';
    import Card from '$lib/components/ui/Card.svelte'
    import Fediseer from '$lib/fediseer/Fediseer.svelte';   
    import RelativeDate from '$lib/components/util/RelativeDate.svelte';

    import { 
        Icon, 
        ArrowRight,
        ArrowTopRightOnSquare, 
        Calendar,
        Check,
        Eye,
        HandThumbDown, 
        NoSymbol,
        UserGroup,
        CloudArrowDown,
        ArrowPath,
    } from 'svelte-hero-icons'

    export let instance: InstanceWithFederationStateCustom

    let fediseerModal = false
    let inboundFederationDetailsLoading:boolean = false

    // Get inbound federation state from this instance
    async function getFederationStateFromInstance(domain:string) {
        if (!domain) return
        
        try {
            inboundFederationDetailsLoading = true
            
            const instances = await getClient(domain).getFederatedInstances();
            if (instances?.federated_instances?.linked) {
                let thisInstance = instances.federated_instances.linked.find((instance:InstanceWithFederationState) => instance.domain = $currentInstance)
                
                if (thisInstance?.federation_state) {
                    instance.inbound_federation = thisInstance.federation_state
                }
            }

            inboundFederationDetailsLoading = false

            
        }
        catch (err) {
            inboundFederationDetailsLoading = false
        }
    }
    

    

</script>   

{#if instance}
    {#if fediseerModal}
        <Fediseer bind:open={fediseerModal} instance={instance.domain} />
    {/if}

    <!---<div class="flex flex-col gap-2 bg-slate-100 dark:bg-zinc-800 text-black dark:text-slate-100 border border-slate-900 dark:border-zinc-100 p-2 text-sm rounded-md leading-[22px]">    --->
    <Card class="p-4">        
        <div class="flex flex-row gap-2 items-center w-full">
            
            <div class="flex flex-col w-full gap-0">
                <span class="flex flex-row text-base font-bold items-center">
                    {instance.domain}
                    
                    {#if instance.state == 'blocked'}
                        <span class="ml-4 text-red-500">
                            <Icon src={NoSymbol} mini width={18} />
                        </span>
                    {/if}
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
                        {#if instance.dead}
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
        {#if !(instance.state == 'blocked')}
        <details class="text-sm mt-1">
            <summary class="cursor-pointer font-bold">
                Federation State
            </summary>
            
            <div class="flex flex-col lg:flex-row gap-4 items-start mt-1">
                
                <!---Outbound Federation--->
                <div class="flex flex-col gap-1 w-full lg:w-1/2">
                    <span class="flex flex-row gap-1 items-center font-bold">
                        {$currentInstance} <Icon src={ArrowRight} mini width={14}/> {instance.domain}
                    </span>
                    
                    {#if instance.federation_state}
                        <span class="flex flex-col gap-1 pl-4">
                            {#if instance.federation_state.fail_count}
                                <span>
                                    <span class="font-bold">Fail Count</span>:
                                    {instance.federation_state.fail_count}
                                </span>
                            {/if}
                            
                            {#if instance.federation_state.last_retry}
                                <span>
                                    <span class="font-bold">Last Retry</span>:
                                    {new Date(instance.federation_state.last_retry).toLocaleString()}
                                </span>
                            {/if}

                            {#if instance.federation_state.last_successful_published_time}
                                <span>
                                    <span class="font-bold">Last Successful Publish</span>:
                                    {new Date(instance.federation_state.last_successful_published_time).toLocaleString()}
                                </span>
                            {/if}

                            {#if instance.federation_state.last_successful_id}
                                <span>
                                    <span class="font-bold">Last Successful ID</span>:
                                    {instance.federation_state.last_successful_id}
                                </span>
                            {/if}
                            
                            {#if instance.federation_state.next_retry}
                                <span>
                                    <span class="font-bold">Next Retry</span>:
                                    {new Date(instance.federation_state.next_retry).toLocaleString()}
                                </span>
                            {/if}
                        </span>
                    {/if}
                </div>
                
                <!---Inbound Federation--->
                <div class="flex flex-col gap-1 w-full lg:w-1/2">
                    <span class="flex flex-row gap-1 items-center font-bold">
                        {instance.domain} <Icon src={ArrowRight} mini width={14}/> {$currentInstance}
                    </span>
                    
                    {#if !instance.dead && instance.software=='lemmy' && !(instance.state=='blocked') && instance.inbound_federation}
                        <span class="flex flex-col gap-1 pl-4">
                            {#if instance.inbound_federation.fail_count}
                                <span>
                                    <span class="font-bold">Fail Count</span>:
                                    {instance.inbound_federation.fail_count}
                                </span>
                            {/if}
                            
                            {#if instance.inbound_federation.last_retry}
                                <span>
                                    <span class="font-bold">Last Retry</span>:
                                    {new Date(instance.inbound_federation.last_retry).toLocaleString()}
                                </span>
                            {/if}

                            {#if instance.inbound_federation.last_successful_published_time}
                                <span>
                                    <span class="font-bold">Last Successful Publish</span>:
                                    {new Date(instance.inbound_federation.last_successful_published_time).toLocaleString()}
                                </span>
                            {/if}

                            {#if instance.inbound_federation.last_successful_id}
                                <span>
                                    <span class="font-bold">Last Successful ID</span>:
                                    {instance.inbound_federation.last_successful_id}
                                </span>
                            {/if}
                            
                            {#if instance.inbound_federation.next_retry}
                                <span>
                                    <span class="font-bold">Next Retry</span>:
                                    {new Date(instance.inbound_federation.next_retry).toLocaleString()}
                                </span>
                            {/if}
                        </span>
                    {/if}

                    {#if !(instance.software == 'lemmy')}
                        <p class="text-sm font-normal">
                            Inbound federation stats not available for this instance.
                        </p>
                    
                    {:else}
                        <span class="pl-4 w-full">
                            <Button color="tertiary-border" size="sm" class="w-full"
                                loading={inboundFederationDetailsLoading} disabled={inboundFederationDetailsLoading}
                                icon={instance.inbound_federation ? ArrowPath : CloudArrowDown}
                                on:click={() => getFederationStateFromInstance(instance.domain)}
                            >
                                {instance.inbound_federation ? 'Refresh' : 'Load'}
                            </Button>
                        </span>
                    {/if}
                </div>

            </div>

        </details>
        {/if}
    </Card>
{/if}