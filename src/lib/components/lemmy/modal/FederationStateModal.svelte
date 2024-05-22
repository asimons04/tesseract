<script lang="ts">
    import type { InstanceWithFederationState } from 'lemmy-js-client';
    import { 
        type InstanceWithFederationStateCustom,
        type GetFederatedInstancesData,
        load as GetFederatedInstances 
    } from '$routes/instances/+page'

    import { instance as currentInstance } from '$lib/instance'
    import { getClient } from '$lib/lemmy'
    import { onDestroy, onMount } from 'svelte'

    import Button from '$lib/components/input/Button.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import SettingToggle from '$lib/components/ui/settings/SettingToggle.svelte'
    import SettingToggleContainer from '$lib/components/ui/settings/SettingToggleContainer.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'

    import { 
        Icon,
        ArrowPath,
        ArrowRight,
        Calendar,
        Check,
        CloudArrowDown,
        Eye,
        HandThumbDown,
        ExclamationTriangle, 
        NoSymbol,
        ServerStack, 
    } from 'svelte-hero-icons';
    
    
    
    
    
    
    export let open = false
    export let domain:string

    let instance: InstanceWithFederationStateCustom | undefined
    let data: GetFederatedInstancesData
    let refresher: typeof window.setInterval

    let state = {
        loading: false,
        fetchError: false,
        inboundFetchError: false,
        inboundLoading: false,
        autoRefresh: true,
        autoRefreshInterval: 30,
        refreshing: false,
    }    
    
    onMount(async () => await load() )

    async function load(spinner = true) {
        if (spinner) state.loading = true
        
        data = await GetFederatedInstances()
        let tempInstance = data.instances.find((i) => i.domain == domain)
        
        if (!tempInstance) {
            state.fetchError = true
            return
        }
        if (tempInstance.software?.toLowerCase() == 'lemmy') tempInstance.inbound_federation = await getRemoteFederationState(domain)
        if (spinner) state.loading = false
        instance = tempInstance
    }

    async function refresh() {
        state.refreshing = true
        await load(false)
        state.refreshing = false
    }
    
    async function getRemoteFederationState(remote:string) {
        if (!remote) return
        
        try {
            let newest_id = 0
            state.inboundLoading = true
            
            const instances = await getClient(remote).getFederatedInstances();
            
            if (!instances?.federated_instances?.linked) {
                state.inboundFetchError = true
                state.inboundLoading = false
                return
            }

            // Find the highest last_successful_id among all the remote instances's linked instances.
            // This will be used to estimate how far behind the current instance is from the target one.
            for(const instance of instances.federated_instances.linked) {
                const last_id = instance.federation_state?.last_successful_id ?? 0
                if ( last_id > newest_id) newest_id = last_id
            }

            let thisInstance = instances.federated_instances.linked.find(
                (instance:InstanceWithFederationState) => instance.domain == $currentInstance
            )

            if (!thisInstance?.federation_state) {
                state.inboundFetchError = true
                state.inboundLoading = false
                return undefined
            }
            
            state.inboundFetchError = false
            state.inboundLoading = false
            
            return {
                ...thisInstance.federation_state,
                newest_id: newest_id
            }
        }
        catch (err) {
            console.log(err)
            state.inboundLoading = false
            state.inboundFetchError = true
            return undefined
        }
       
    }
    
    const timer = setInterval(() => {
            if (state.autoRefresh) refresh()
        },
        (state.autoRefreshInterval * 1000)
    )

    onDestroy(() => {
        clearInterval(timer)
    })
    
    
</script>


<Modal bind:open icon={ServerStack} title="Federation State for {domain}" width="max-w-4xl">
    
    {#if state.loading}
        <div class="flex flex-col gap-4 mx-auto my-auto">
            <Spinner width={64} />
        </div>
    {/if}

    {#if !state.loading && state.fetchError}
        <Placeholder icon={ExclamationTriangle} title="Fetch Error" description="There was an error during the fetch for this request. Please try again later." />    
    {/if}

    {#if instance && !state.loading && !state.fetchError}
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
            
            <span class="ml-auto">
                <Button color="tertiary-border" size="sm" class="w-full"
                    loading={state.refreshing} disabled={state.inboundLoading} icon={ArrowPath} 
                    on:click={async () => { refresh() }} 
                >
                    Refresh
                </Button>
            </span>   
        </div>

        <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />

        <!--- Outbound and Inbound Federation Status--->                    
        <div class="flex flex-col lg:flex-row gap-4 items-start mt-2">
            
            <!---Outbound Federation--->
            <div class="flex flex-col gap-1 w-full lg:w-1/2">
                <span class="flex flex-row gap-1 items-center font-bold">
                    {$currentInstance} <Icon src={ArrowRight} mini width={14}/> {instance.domain}
                </span>
                
                {#if instance.federation_state}
                    <span class="flex flex-col gap-1 pl-4">
                        
                        
                        <!---Activities Behind Estimate--->
                        {#if data.newest_id && instance.federation_state.last_successful_id}
                            <span>
                                <span class="font-bold">Activities Behind</span>:
                                {data.newest_id - instance.federation_state.last_successful_id}
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

                {#if state.inboundFetchError}
                    <p class="text-sm font-normal">
                        Failed to load the federation stats from this instance.
                    </p>
                {/if}

                {#if !(instance.software == 'lemmy')}
                    <p class="text-sm font-normal">
                        Inbound federation stats not available for this instance.
                    </p>
                {/if}
            </div>
        </div>

        <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />

        <SettingToggleContainer>
            <SettingToggle bind:value={state.autoRefresh} title="Auto Refresh" icon={ArrowPath} description="Automatically refresh the state every 30 seconds" />
        </SettingToggleContainer>
    {/if}
</Modal>