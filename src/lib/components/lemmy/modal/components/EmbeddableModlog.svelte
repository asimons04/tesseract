<script lang="ts">
    
    interface ModlogContainer {
        loading: boolean   
        searchURL: URL
        page: number
        fetchError: boolean
        results: ModLog[]
        containerDiv: HTMLDivElement | undefined

        init:           (form?:ModlogContainerInitForm) => Promise<void>
        load:           () => Promise<void>
        clearCommunity: () => void
        setCommunity:   (community_id?:number) => void
        clearUser:      () => void
        setUser:        (person_id?:number) => void
        clearModerator: () => void
        setModerator:   (person_id?:number) => void
        setPage:        (pageNum?:number) => void
        reset:          () => void
    }

    interface ModlogContainerInitForm {
        community_id?: number,
        moderator_id?: number,
        moderatee_id?: number
    }
    
    import type { Community, Person } from 'lemmy-js-client';
    import type { ModLog } from '$routes/modlog/+page'
    
    import { load as loadModlog } from '$routes/modlog/+page'
    import { slide } from 'svelte/transition'

    import Button from '$lib/components/input/Button.svelte'
    import ModlogItemList from '$routes/modlog/item/ModlogItemList.svelte'
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import Placeholder from '$lib/components/ui/Placeholder.svelte'
    import Spinner from '$lib/components/ui/loader/Spinner.svelte'
    
    
    import { 
    ArrowTopRightOnSquare,
        ExclamationTriangle,
        Newspaper 
    } from 'svelte-hero-icons'
    import { createEventDispatcher, onMount } from 'svelte';
    import Card from '$lib/components/ui/Card.svelte';
    import { goto } from '$app/navigation';
    
    export let community: Community | undefined = undefined
    export let moderator: Person | undefined = undefined
    export let moderatee: Person | undefined = undefined
    export let headingRowClass: string = ''                     // Allows passing a class to the heading row. Mostly used to pass in a mt-[-50px] class to bring it inline with the parent's title.
    
    const dispatcher = createEventDispatcher()

    // Object to hold the modlog viewer components
    let modlog = {
        loading: false,
        searchURL: new URL('https://localhost'),
        page: 1,
        results: [] as ModLog[], 
        fetchError: false,
        containerDiv: undefined,

        init: async function(form?:ModlogContainerInitForm) {
            modlog.reset()

            modlog.setUser(form?.moderatee_id)
            modlog.setCommunity(form?.community_id)
            modlog.setModerator(form?.moderator_id)

            modlog.load()
        },

        load: async function () {
            modlog.loading = true
            
            try {
                modlog.results = (await loadModlog({url: modlog.searchURL})).modlog
            }
            catch {
                modlog.fetchError = true
                modlog.results = [] as ModLog[]
            }
            modlog.loading = false
        },

        setPage: function(pageNum?:number) {
            if (!pageNum) return
            modlog.page = pageNum
            modlog.searchURL.searchParams.set('page', modlog.page.toString())
        },

        clearCommunity: function() {
            modlog.searchURL.searchParams.delete('community')
        },

        setCommunity: function(community_id?:number) {
            if (!community_id) {
                modlog.clearCommunity()
                return
            }
            modlog.searchURL.searchParams.set('community', community_id.toString())
        },

        clearUser: function() {
            modlog.searchURL.searchParams.delete('other_person_id')
        },

        setUser: function(person_id?:number) {
            if (!person_id) {
                modlog.clearUser()
                return
            }
            modlog.searchURL.searchParams.set('other_person_id', person_id.toString())
        },

        clearModerator: function() {
            modlog.searchURL.searchParams.delete('mod_person_id')
        },

        setModerator: function(person_id?:number) {
            if (!person_id) {
                modlog.clearModerator()
                return
            }
            modlog.searchURL.searchParams.set('mod_person_id', person_id.toString())
        },

        reset: function() {
            modlog.clearModerator()
            modlog.clearUser()
            modlog.clearCommunity()
            modlog.setPage(1)
            modlog.fetchError = false
            modlog.loading = false
            modlog.results = [] as ModLog[]
        }
    } as ModlogContainer

    onMount(async () => {
        modlog.init({
            community_id: community?.id,
            moderator_id: moderator?.id,
            moderatee_id: moderatee?.id
        })
    })

    // Reinitialize the modlog if the community, moderator, and/or moderatee change
    $:  community, moderator, moderatee, () => {
        modlog.init({
            community_id: community?.id,
            moderator_id: moderator?.id,
            moderatee_id: moderatee?.id
        })
    }
</script>


<div class="flex flex-col gap-4 mt-0 w-full" transition:slide>     
    <!---Modlog View--->
    {#if modlog.loading}
        <div class="flex w-full"> 
            <span class="flex flex-col gap-4 mx-auto my-auto">
                <Spinner width={64} />
            </span>
        </div>
    {:else}
        
        <!---Heading row --->
        <div class="flex flex-row items-center gap-2 {headingRowClass}">

            <span class="ml-auto" />
            
            <!---Goto Full Modlog (with same params)--->
            <Button color="tertiary" icon={Newspaper} iconSize={20} size="square-lg" 
                title="View in Full Modlog"
                on:click={()=> {
                    goto(`/modlog?${modlog.searchURL.searchParams.toString()}`)
                    dispatcher('gotoFullModlog')
                }}
            />
            
            <!---Goto Full Modlog in New Tab (with same params)--->
            <Button color="tertiary" icon={ArrowTopRightOnSquare} iconSize={20} size="square-lg" 
                title="View in Full Modlog in New Tab"
                on:click={()=> {
                    window.open(`/modlog?${modlog.searchURL.searchParams.toString()}`)
                    
                }}
            />
        </div>

        <Card class="flex flex-col w-full gap-4">
            
            <div bind:this={modlog.containerDiv} class="flex flex-col gap-4 mt-2 max-h-[50vh] overflow-y-scroll p-2">
                
                {#if modlog.results.length > 0}
                    {#each modlog.results as modlogItem}
                        <Card elevation={0} class="p-2 text-sm pointer-events-none">
                            <ModlogItemList bind:item={modlogItem} actions={false} hideCommunity={community ? true : false}/>
                        </Card>
                    {/each}
                {:else}
                    {#if !modlog.fetchError}
                        <span class="mx-auto my-auto">
                            <Placeholder icon={Newspaper} title="No Results" description="No modlog results returned" />
                        </span>
                    {:else}
                        <span class="mx-auto my-auto">
                            <Placeholder icon={ExclamationTriangle} title="Fetch Error" description="Unable to load the modlog from the API." />
                        </span>
                    {/if}
                {/if}
            </div>
            
            <Pageination bind:page={modlog.page} class="px-4 mb-4" on:change={(e) => {
                modlog.setPage(e.detail)
                modlog.load()
                modlog.containerDiv?.scrollTo(0,0)
            }}/>
        </Card>
    {/if}

</div>

