<script lang="ts">
    import type { InstanceWithFederationState, ReadableFederationState} from 'lemmy-js-client'
    import type { InstanceWithFederationStateCustom } from './+page'
    
    import { getClient } from '$lib/lemmy'
    import { instance as currentInstance} from '$lib/instance'
    import { page } from '$app/stores';
    
    import Button from '$lib/components/input/Button.svelte';
    import Card from '$lib/components/ui/Card.svelte'
    import FederationStateModal from '$lib/components/lemmy/modal/FederationStateModal.svelte'
    import Fediseer from '$lib/fediseer/Fediseer.svelte';   
    import RelativeDate from '$lib/components/util/RelativeDate.svelte';

    import { 
        Icon, 
        ArrowPath,
        ArrowRight,
        ArrowTopRightOnSquare, 
        Calendar,
        Check,
        CloudArrowDown,
        Eye,
        HandThumbDown, 
        NoSymbol,
        Server,
        UserGroup,
        Bars3,
    } from 'svelte-hero-icons'
    import Menu from '$lib/components/ui/menu/Menu.svelte';
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte';

    export let instance: InstanceWithFederationStateCustom

    let fediseerModal = false
    let federationStateModal = {
        domain: '',
        open: false
    }

    function openFederationStateModal(instance:string):void {
        federationStateModal.domain = instance
        federationStateModal.open = true
    }

</script>   

{#if instance}
    {#if fediseerModal}
        <Fediseer bind:open={fediseerModal} instance={instance.domain} />
    {/if}

    {#if federationStateModal.open}
        <FederationStateModal bind:open={federationStateModal.open} domain={federationStateModal.domain} />
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



            <Menu alignment="bottom-right" itemsClass="flex my-auto h-8 md:h-8" containerClass="!max-h-[90vh] max-w-[18rem]">
                
                <Button color="tertiary" slot="button" let:toggleOpen on:click={toggleOpen} title="Action Menu">
                    <Icon src={Bars3} mini size="16" slot="icon" />
                </Button>

                <!---Browse Communities on Instance (if Lemmy)--->
                {#if instance.software == 'lemmy'}
                    <MenuButton link href="/communities?instance={instance.domain}&type=Local" newtab={true} title="Browse communities at {instance.domain}">
                        <Icon src={UserGroup} width={14} mini />
                        Browse Communities
                    </MenuButton>
                {/if}

                <!---Federation State--->
                <MenuButton title="Federation State" on:click={async () => openFederationStateModal(instance.domain) } >
                    <Icon src={Server} mini width={14}/>
                    Federation State
                </MenuButton>

                <!---Fediseer Lookup for Instance--->
                <MenuButton on:click={(e) => fediseerModal = true} title="Fediseer">
                    <Icon src={Eye} mini width={14}/>
                    Fediseer
                </MenuButton>

                <!---Visit Instance (open to that instance in new tab--->
                <MenuButton link  href="https://{instance.domain}" newtab={true} title="Visit Instance">
                    <Icon src={ArrowTopRightOnSquare} mini width={14}/>
                    Visit
                </MenuButton>

            </Menu>
        </div>


    </Card>
{/if}