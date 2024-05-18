<script lang="ts">
    import type { InstanceWithFederationState, ReadableFederationState} from 'lemmy-js-client'
    import type { InstanceWithFederationStateCustom } from './+page'
    
    import { getClient } from '$lib/lemmy'
    import { instance as currentInstance} from '$lib/instance'
    import { page } from '$app/stores';
    
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
    export let newest_id: number = 0

    let fediseerModal = false
    let inboundFederationDetailsLoading = false
    let inboundFederationLoadFail = false
    let federationStateOpen = false

    
    function autoLoadStats() {
        if  (
            $page.url.searchParams.has('stats') && 
            $page.url.searchParams.get('instance') &&
            $page.url.searchParams.get('instance') == instance.domain &&
            instance.software && instance.software.toLowerCase() == 'lemmy'
        ) {
            federationStateOpen = true
            getFederationStateFromInstance(instance.domain)
        }
    }
    
    
    // Get inbound federation state from this instance
    async function getFederationStateFromInstance(domain:string) {
        if (!domain) return
        
        try {
            let newest_id = 0
            inboundFederationDetailsLoading = true
            
            const instances = await getClient(domain).getFederatedInstances();
            
            if (!instances?.federated_instances?.linked) {
                inboundFederationLoadFail = true
                inboundFederationDetailsLoading = false
                return
            }

            // Find the highest last_successful_id among all the remote instances's linked instances.
            // This will be used to estimate how far behind the current instance is from the target one.
            for(const instance of instances.federated_instances.linked) {
                const last_id = instance.federation_state?.last_successful_id ?? 0
                if ( last_id > newest_id) {
                    newest_id = last_id
                }
            }

            let thisInstance = instances.federated_instances.linked.find(
                (instance:InstanceWithFederationState) => instance.domain == $currentInstance
            )

            if (thisInstance?.federation_state) {
                instance.inbound_federation = {
                    ...thisInstance.federation_state,
                    newest_id: newest_id
                }
                instance = instance
                inboundFederationLoadFail = false
            }
            else {
                inboundFederationLoadFail = true
            }
            
            inboundFederationDetailsLoading = false
        }
        catch (err) {
            console.log(err)
            inboundFederationDetailsLoading = false
            inboundFederationLoadFail = true
        }
    }
    

    autoLoadStats()

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

        <!---Show federation state if instance is not blocked or dead --->
        {#if !(instance.state == 'blocked') && !instance.dead}
            <details bind:open={federationStateOpen} class="text-sm mt-1">
                <summary class="cursor-pointer font-bold">
                    Federation State
                </summary>
                
                <div class="flex flex-col lg:flex-row gap-4 items-start mt-2">
                    
                    <!---Outbound Federation--->
                    <div class="flex flex-col gap-1 w-full lg:w-1/2">
                        <span class="flex flex-row gap-1 items-center font-bold">
                            {$currentInstance} <Icon src={ArrowRight} mini width={14}/> {instance.domain}
                        </span>
                        
                        {#if instance.federation_state}
                            <span class="flex flex-col gap-1 pl-4">
                                
                                
                                <!---Activities Behind Estimate--->
                                {#if newest_id && instance.federation_state.last_successful_id}
                                    <span>
                                        <span class="font-bold">Activities Behind</span>:
                                        {newest_id - instance.federation_state.last_successful_id}
                                    </span>
                                {/if}

                                <!---Last Successful ID--->
                                {#if instance.federation_state.last_successful_id}
                                    <span>
                                        <span class="font-bold">Last Successful ID</span>:
                                        {instance.federation_state.last_successful_id}
                                    </span>
                                {/if}

                                <!---Fail Count--->
                                {#if instance.federation_state.fail_count}
                                    <span>
                                        <span class="font-bold">Fail Count</span>:
                                        {instance.federation_state.fail_count}
                                    </span>
                                {/if}
                                
                                <!---Last Retry--->
                                {#if instance.federation_state.last_retry}
                                    <span>
                                        <span class="font-bold">Last Retry</span>:
                                        {new Date(instance.federation_state.last_retry).toLocaleString()}
                                    </span>
                                {/if}

                                <!---Last Successful Publish Time--->
                                {#if instance.federation_state.last_successful_published_time}
                                    <span>
                                        <span class="font-bold">Last Successful Publish</span>:
                                        {new Date(instance.federation_state.last_successful_published_time).toLocaleString()}
                                    </span>
                                {/if}
                                
                                <!---Next Retry--->
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
                        
                        {#if !instance.dead && instance.software=='lemmy' && instance.inbound_federation}
                            <span class="flex flex-col gap-1 pl-4">
                                
                                <!---Activities Behind Estimate--->
                                {#if instance.inbound_federation.newest_id && instance.inbound_federation.last_successful_id}
                                    <span>
                                        <span class="font-bold">Activities Behind</span>:
                                        {instance.inbound_federation.newest_id - instance.inbound_federation.last_successful_id}
                                    </span>
                                {/if}

                                <!---Last Successful ID--->
                                {#if instance.inbound_federation.last_successful_id}
                                    <span>
                                        <span class="font-bold">Last Successful ID</span>:
                                        {instance.inbound_federation.last_successful_id}
                                    </span>
                                {/if}
                                
                                <!---Fail Count--->
                                {#if instance.inbound_federation.fail_count}
                                    <span>
                                        <span class="font-bold">Fail Count</span>:
                                        {instance.inbound_federation.fail_count}
                                    </span>
                                {/if}
                                
                                <!---Last Retry--->
                                {#if instance.inbound_federation.last_retry}
                                    <span>
                                        <span class="font-bold">Last Retry</span>:
                                        {new Date(instance.inbound_federation.last_retry).toLocaleString()}
                                    </span>
                                {/if}

                                <!---Last Successful Publish Time--->
                                {#if instance.inbound_federation.last_successful_published_time}
                                    <span>
                                        <span class="font-bold">Last Successful Publish</span>:
                                        {new Date(instance.inbound_federation.last_successful_published_time).toLocaleString()}
                                    </span>
                                {/if}

                                
                                <!---Next Retry--->
                                {#if instance.inbound_federation.next_retry}
                                    <span>
                                        <span class="font-bold">Next Retry</span>:
                                        {new Date(instance.inbound_federation.next_retry).toLocaleString()}
                                    </span>
                                {/if}

                            </span>
                        {/if}

                        {#if inboundFederationLoadFail}
                            <p class="text-sm font-normal">
                                Failed to load the federation stats from this instance.
                            </p>
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
                                    on:click={async () => await getFederationStateFromInstance(instance.domain)}
                                >
                                    {instance.inbound_federation ? 'Refresh' : inboundFederationLoadFail ? 'Retry' : 'Load'}
                                </Button>
                            </span>
                        {/if}
                    </div>

                </div>

            </details>
        {/if}
    </Card>
{/if}