<script lang="ts">
    
    interface FediseerModal {
        data: FediseerInfo | undefined,
        loading: boolean,
        ready: boolean,
        expanded: {
            censures: boolean,
            endorsements: boolean,
            hesitations:boolean,
            admins: boolean
        }
    }

    import type { PersonView, PostView, SiteView } from 'lemmy-js-client'
    import { onMount } from 'svelte'

    import { 
        type FediseerInfo,
        getFediseerInfo, 
        fediseerLookup 
    } from '$lib/fediseer/client.js'

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    import { 
        Icon, 
        Calendar,
        Eye,
        HandThumbUp,
        HandThumbDown,
        HandRaised,
        ShieldCheck
    } from 'svelte-hero-icons'
    
    
    let fediseer:FediseerModal = {
        data: undefined,
        loading: false,
        ready: false,
        expanded: {
            censures: false,
            endorsements: false,
            hesitations: false,
            admins: false
        }
    }
    
    export let open:boolean = false;
    export let instance:string

    //new URL(post.community.actor_id).hostname);
    let site:SiteView
    let admins:PersonView[] = []

    onMount(async ()=> {
        if (instance) {
            fediseer.loading = true;
            fediseer.data = await fediseerLookup(instance) 
            fediseer.loading = false;

            if (fediseer.data.success) {
                if (fediseer.data?.site?.site_view?.site) {
                    site = fediseer.data.site.site_view.site
                    admins = fediseer.data.site.admins
                }
                fediseer.ready = true;
            }
        }
    })
</script>


<Modal bind:open={open} icon={Eye} title="Fediseer">
    {#if fediseer.ready && fediseer.data}
        <div class="flex flex-col gap-2 w-full">
            <!---Site logo, name, and instance domain--->
            {#if site}
                <div class="flex flex-col md:flex-row gap-3 items-center p-3">
                    {#if site.icon}
                        <Avatar width={64} url={site.icon} alt={site.name} circle={false} />
                    {/if}
                            
                    <div class="flex flex-col w-full">
                        
                        <div class="flex flex-col md:flex-row items-center">
                            <h2 class="font-bold text-2xl">{site.name}</h2>
                            
                            <span class="px-4 text-sm italic">
                                {site.description ?? ''}
                            </span>
                            


                            <div class="ml-auto">
                                <span class="flex flex-row whitespace-nowrap items-center gap-2 text-sm">
                                    <Icon src={Calendar} width={16} height={16} mini />
                                    <RelativeDate date={site.published} />
                                </span>
                            </div>
                        </div>
                        
                        <span class="text-sm opacity-60">
                            {fediseer.data.instance}
                        </span>
                    </div>

                    
                </div>
            
            <!---Fallback in case the call to getSite fails for this instance--->
            {:else}
                <div class="flex flex-col w-full">
                    <div class="flex flex-row">
                        <h2 class="font-bold text-2xl">{fediseer.data.instance}</h2>
                    </div>
                </div>
            {/if}
            
            {#if fediseer.data.badges?.guarantor || fediseer.data.badges?.endorsements}
                <div class="flex flex-row flex-wrap gap-2 justify-between">
                    {#if fediseer.data.badges?.guarantor}
                        {@html fediseer.data.badges.guarantor}
                    {/if}

                    {#if fediseer.data.badges?.endorsements}
                        {@html fediseer.data.badges.endorsements}
                    {/if}
                </div>
            {/if}

            
        
        
        
            <!--Endorsements, Censures, and Hesitations--->
            <div class="flex flex-col gap-2">
                
                <!---Site Admins--->
                {#if admins.length > 0}
                <div class="flex flex-col">
                    <Button color="tertiary" alignment="left" on:click={ ()=> { fediseer.expanded.admins = !fediseer.expanded.admins}}>
                        <Icon src={ShieldCheck} mini size="18" />

                        <span class="w-full flex flex-row justify-between">
                            Admins
                            <span class="bg-gray-800 text-gray-100 dark:bg-gray-100 dark:text-gray-800  text-xs font-medium mr-2 ml-auto px-2.5 py-0.5 rounded-full">
                                {admins.length}
                            </span>
                        </span>
                    </Button>
                    
                    <div class="flex flex-col gap-2 pl-4 text-sm" class:hidden={!fediseer.expanded.admins}>
                        {#each admins as admin}
                            <UserLink user={admin.person} avatar={true} badges={false} showInstance={false} />
                        {/each}
                    </div>
                </div>
                {/if}

                <!---Endorsements Received--->
                <div class="flex flex-col">
                    <Button color="tertiary" alignment="left" on:click={ ()=> { fediseer.expanded.endorsements = !fediseer.expanded.endorsements}} >
                        <Icon src={HandThumbUp} mini size="18" />
                        <span class="w-full flex flex-row justify-between">
                            Endorsements Received
                            <span class="bg-gray-800 text-gray-100 dark:bg-gray-100 dark:text-gray-800  text-xs font-medium mr-2 ml-auto px-2.5 py-0.5 rounded-full">
                                {fediseer.data.endorsements?.length || 0}
                            </span>
                        </span>
                    </Button>
                    
                    <div class="flex flex-col gap-2 pl-8 max-h-[45vh] overflow-y-scroll" class:hidden={!fediseer.expanded.endorsements}>
                        {#if fediseer.data.endorsements?.length > 0}
                            <ol class="font-bold text-sm list-decimal">
                                {#each fediseer.data.endorsements as endorsement}
                                    <li>
                                        {endorsement.domain}

                                        {#if endorsement.endorsement_reasons?.length > 0}
                                            <p class="text-xs font-bold">Endorsement Reasons:</p>
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
                            <span class="text-sm">No endorsements have been issued for {site?.name ?? 'this instance'}</span>
                        {/if}
                    </div>
                </div>
                
                <!---Censures--->
                <div class="flex flex-col">
                    <Button color="tertiary" alignment="left" on:click={ ()=> { fediseer.expanded.censures = !fediseer.expanded.censures}} >
                        <Icon src={HandThumbDown} mini size="18" />

                        <span class="w-full flex flex-row justify-between">
                            Censures Received
                            <span class="bg-gray-800 text-gray-100 dark:bg-gray-100 dark:text-gray-800  text-xs font-medium mr-2 ml-auto px-2.5 py-0.5 rounded-full">
                                {fediseer.data.censures?.length || 0}
                            </span>
                        </span>
                    </Button>
                    
                    <div class="flex flex-col gap-2 pl-8 max-h-[45vh] overflow-y-scroll" class:hidden={!fediseer.expanded.censures}>
                        {#if fediseer.data.censures?.length > 0}
                            <ol class="font-bold text-sm list-decimal">
                                {#each fediseer.data.censures as censure}
                                    <li>
                                        {censure.domain}
                                        
                                        {#if censure.censure_evidence?.length > 0}
                                            <p class="text-xs font-bold">Hesitation Evidence:</p>
                                            {#each censure.censure_evidence as evidence}
                                            <p class="font-normal text-xs">
                                                {evidence}
                                            </p>
                                            {/each}
                                        {/if}

                                        {#if censure.censure_reasons?.length > 0}
                                            <p class="text-xs font-bold">Censure Reasons:</p>
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
                            <span class="text-sm">No censures have been issued for {site?.name ?? 'this instance'}</span>
                        {/if}
                    </div>
                </div>

                <!---Hesitations--->
                <div class="flex flex-col">
                    <Button color="tertiary" alignment="left" on:click={ ()=> { fediseer.expanded.hesitations = !fediseer.expanded.hesitations}} >
                        <Icon src={HandRaised} mini size="18" />

                        <span class="w-full flex flex-row justify-between">
                            Hesitations Received
                            <span class="bg-gray-800 text-gray-100 dark:bg-gray-100 dark:text-gray-800  text-xs font-medium mr-2 ml-auto px-2.5 py-0.5 rounded-full">
                                {fediseer.data.hesitations?.length || 0}
                            </span>
                        </span>
                    </Button>
                    
                    <div class="flex flex-col gap-2 pl-8 max-h-[45vh] overflow-y-scroll" class:hidden={!fediseer.expanded.hesitations}>
                        {#if fediseer.data.hesitations?.length > 0}
                            <ol class="font-bold text-sm list-decimal">
                                {#each fediseer.data.hesitations as hesitation}
                                    <li>
                                        {hesitation.domain}
                                        
                                        {#if hesitation.hesitation_evidence?.length > 0}
                                            <p class="text-xs font-bold">Hesitation Evidence:</p>
                                            {#each hesitation.hesitation_evidence as evidence}
                                            <p class="font-normal text-xs">
                                                {evidence}
                                            </p>
                                            {/each}
                                        {/if}
                                        
                                        {#if hesitation.hesitation_reasons?.length > 0}
                                            <p class="text-xs font-bold">Hesitation Reasons:</p>
                                            <ul class="pl-6 font-normal text-xs list-disc">
                                                {#each hesitation.hesitation_reasons as reason}
                                                    <li>{reason}</li>
                                                {/each}
                                            </ul>
                                        {/if}
                                    </li>
                                
                                {/each}
                            </ol>
                        {:else}
                            <span class="text-sm">No hesitations have been issued for {site?.name ?? 'this instance'}</span>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    {:else}
        <div class="mx-auto my-auto">
            <h1 class="font-bold text-base">Retrieving Fediseer report for {instance}</h1>
        </div>

        <div class="mx-auto my-auto">
                <Spinner width={64} />
        </div>
    {/if}
</Modal>