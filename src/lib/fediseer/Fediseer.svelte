<script lang="ts">
    import {
        type FediseerInfo,
    } from '$lib/fediseer/client.js'

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'

    import { 
        Icon, 
        Calendar,
        HandThumbUp,
        HandThumbDown,
        HandRaised
    } from 'svelte-hero-icons'

    let fediseer = {
        expanded: {
            censures: false,
            endorsements: false,
            hesitations: false
        }
    }
    
    export let data: FediseerInfo
    export let open:boolean = false;
</script>

<Modal bind:open={open}>
    <h1 class="font-bold text-3xl mt-[-50px] w-fit">Fediseer</h1>
    
    <!---Site logo, name, and instance domain--->
    {#if data?.site?.site_view}
        <div class="flex flex-row gap-3 items-center p-3">
            {#if data.site.site_view.site?.icon}
                <Avatar width={42} url={data.site.site_view.site.icon} alt={data.site.site_view.site.name} />
            {/if}
                    
            <div class="flex flex-col w-full">
                <div class="flex flex-row">
                    <h2 class="font-bold text-2xl">{data.site.site_view.site.name}</h2>
                    
                    <div class="ml-auto">
                        <span class="flex flex-row items-center gap-2 text-sm">
                            <Icon src={Calendar} width={16} height={16} mini />
                            <RelativeDate date={data.site.site_view.site.published} />
                        </span>
                    </div>
                </div>
                
                <span class="text-sm opacity-60">
                    {data.instance}
                </span>
            </div>
        </div>
    <!---Fallback in case the call to getSite fails for this instance--->
    {:else}
        <div class="flex flex-col w-full">
            <div class="flex flex-row">
                <h2 class="font-bold text-2xl">{data.instance}</h2>
            </div>
        </div>
    {/if}
    
    {#if data.badges?.guarantor || data.badges?.endorsements}
        <div class="flex flex-row flex-wrap gap-2 justify-between">
            {#if data.badges?.guarantor}
                {@html data.badges.guarantor}
            {/if}

            {#if data.badges?.endorsements}
                {@html data.badges.endorsements}
            {/if}
        </div>
    {/if}
    
    
    
    {#if data}
        <div class="flex flex-col gap-2">
            <!---Endorsements Received--->
            <div class="flex flex-col">
                <Button
                    color="tertiary"
                    alignment="left"
                    on:click={ ()=> { fediseer.expanded.endorsements = !fediseer.expanded.endorsements}}
                >
                    <Icon src={HandThumbUp} mini size="18" />

                    <span class="w-full flex flex-row justify-between">
                        Endorsements Received
                        <span class="bg-gray-800 text-gray-100 dark:bg-gray-100 dark:text-gray-800  text-xs font-medium mr-2 ml-auto px-2.5 py-0.5 rounded-full">
                            {data.endorsements.length}
                        </span>
                    </span>
                </Button>
                
                <div class="flex flex-col gap-2 pl-8 max-h-[45vh] overflow-y-scroll" class:hidden={!fediseer.expanded.endorsements}>
                    {#if data.endorsements?.length > 0}
                        <ol class="font-bold text-sm list-decimal">
                            {#each data.endorsements as endorsement}
                                <li>
                                    {endorsement.domain}

                                    {#if endorsement.endorsement_reasons?.length > 0}
                                        <ul class="pl-6 text-xs list-disc">
                                            {#each endorsement.endorsement_reasons as reason}
                                                <li>{reason}</li>
                                            {/each}
                                        </ul>
                                    {/if}
                                </li>
                            
                            {/each}
                        </ol>
                    {:else}
                        <span class="text-sm">No endorsements have been issued for {data.site?.site_view?.site?.name ?? 'this instance'}</span>
                    {/if}
                </div>
            </div>
            
            <!---Censures--->
            <div class="flex flex-col">
                <Button
                    color="tertiary"
                    alignment="left"
                    on:click={ ()=> { fediseer.expanded.censures = !fediseer.expanded.censures}}
                >
                    
                    <Icon src={HandThumbDown} mini size="18" />

                    <span class="w-full flex flex-row justify-between">
                        Censures Received
                        <span class="bg-gray-800 text-gray-100 dark:bg-gray-100 dark:text-gray-800  text-xs font-medium mr-2 ml-auto px-2.5 py-0.5 rounded-full">
                            {data.censures.length}
                        </span>
                    </span>
                </Button>
                
                <div class="flex flex-col gap-2 pl-8 max-h-[45vh] overflow-y-scroll" class:hidden={!fediseer.expanded.censures}>
                    {#if data.censures?.length > 0}
                        <ol class="font-bold text-sm list-decimal">
                            {#each data.censures as censure}
                                <li>
                                    {censure.domain}

                                    {#if censure.censure_reasons?.length > 0}
                                        <ul class="pl-6 text-xs list-disc">
                                            {#each censure.censure_reasons as reason}
                                                <li>{reason}</li>
                                            {/each}
                                        </ul>
                                    {/if}
                                </li>
                            
                            {/each}
                        </ol>
                    {:else}
                        <span class="text-sm">No censures have been issued for {data.site?.site_view?.site?.name ?? 'this instance'}</span>
                    {/if}
                </div>
            </div>

            <!---Hesitations--->
            <div class="flex flex-col">
                <Button
                    color="tertiary"
                    alignment="left"
                    on:click={ ()=> { fediseer.expanded.hesitations = !fediseer.expanded.hesitations}}
                >
                    <Icon src={HandRaised} mini size="18" />

                    <span class="w-full flex flex-row justify-between">
                        Hesitations Received
                        <span class="bg-gray-800 text-gray-100 dark:bg-gray-100 dark:text-gray-800  text-xs font-medium mr-2 ml-auto px-2.5 py-0.5 rounded-full">
                            {data.hesitations.length}
                        </span>
                    </span>
                </Button>
                
                <div class="flex flex-col gap-2 pl-8 max-h-[45vh] overflow-y-scroll" class:hidden={!fediseer.expanded.hesitations}>
                    {#if data.hesitations?.length > 0}
                        <ol class="font-bold text-sm list-decimal">
                            {#each data.hesitations as hesitation}
                                <li>
                                    {hesitation.domain}

                                    {#if hesitation.hesitation_reasons?.length > 0}
                                        <ul class="pl-6 text-xs list-disc">
                                            {#each hesitation.hesitation_reasons as reason}
                                                <li>{reason}</li>
                                            {/each}
                                        </ul>
                                    {/if}
                                </li>
                            
                            {/each}
                        </ol>
                    {:else}
                        <span class="text-sm">No hesitations have been issued for {data.site?.site_view?.site?.name ?? 'this instance'}</span>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
</Modal>