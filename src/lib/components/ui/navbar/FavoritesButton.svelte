<script lang="ts">
    import { getGroupIndex, sortGroups } from '$lib/favorites'
    import { profile, type CommunityGroup } from '$lib/auth'
    import { slide } from 'svelte/transition'

    
    import Button from '$lib/components/input/Button.svelte'
    import CommunityList from '$lib/components/ui/sidebar/CommunityList.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'

    import {
        Icon,
        InboxArrowDown,
        Star,
        UserGroup,
        XCircle,
    } from 'svelte-hero-icons'
    
    export let size:number = 28
    
    let selected: 'subscribed' | 'favorites' = 'subscribed'
    let selectedClass = '!text-sky-700 dark:!text-sky-500 font-bold'
    let onlyShowModerating = false
    let communityFilterTerm = ''
    let communityFiltervalue:string = ''
    
    let favoritesGroup: CommunityGroup 
    $: favoritesGroup = ($profile?.groups && $profile.groups.length > 0)
        ? $profile?.groups[getGroupIndex('Favorites')]
        : {
            name: "Favorites",
            communities: [],
        } as CommunityGroup
    
    let debounceTimer: ReturnType<typeof setTimeout>;
    function debounce(value:string,  timeout=300) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(
            () => {
                communityFilterTerm = value.toLowerCase();
                clearTimeout(debounceTimer);
            }, timeout
        )
        
    }

</script>


{#if $profile && $profile.user}
<Menu alignment="bottom-center" containerClass="!max-w-fit !max-h-[85vh] !left-[-300%] overflow-y-hidden">
    <Button
        color="tertiary"
        slot="button"
        aria-label="My Communities"
        title="My Communities"
        let:toggleOpen
        let:open
        on:click={toggleOpen}
        class="max-md:w-9 max-md:h-8 max-md:!p-0"
    >
        <Icon src={UserGroup} width={size} mini slot="icon" class="{open ? selectedClass : ''}"/>
    </Button>
    
    <li class="flex flex-row items-center font-bold text-left text-xs opacity-100 text-left px-4 py-1 w-full">
        My Communities
        <span class="ml-auto"/>
        <Icon src={UserGroup} width={16} mini />
    </li>
    <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />

    <li class="flex flex-row items-center justify-between text-xs opacity-100 text-left px-4 py-1 w-full">
        <Button color="tertiary" alignment="left" title='Subscribed' icon={InboxArrowDown}
            class="!text-xs hover:bg-slate-200 {selected == 'subscribed' ? selectedClass: ''}" 
            on:click={(e) => {
                e.preventDefault()
                e.stopPropagation()
                selected = selected = 'subscribed'
            }}
            
        >
            Subscribed
        </Button>

        <Button color="tertiary" alignment="left" title='Favorites' icon={Star}
            class="!text-xs hover:bg-slate-200 {selected == 'favorites' ? selectedClass : ''}" 
            on:click={(e) => {
                e.preventDefault()
                e.stopPropagation()
                selected = selected = 'favorites'
            }}
            
        >
            Favorites
        </Button>
    </li>

    <!---Show filter term input if viewing subscribed list--->
    {#if selected == 'subscribed'}
        <div class="flex flex-row w-full justify-between" transition:slide>
            
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <form class="p-2 flex flex-row items-center gap-2" on:click|preventDefault|stopPropagation on:submit|preventDefault>
                <TextInput 
                    type="text" autocomplete="new-password"    
                    placeholder="Filter Communities"
                    class="h-8 w-full"
                    bind:value={communityFiltervalue}
                    on:click={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                    }}
                    on:keyup={(e) => { 
                        debounce(e.detail.srcElement.value);
                    }}
                />

                <Button size="square-md" color="tertiary" title="Reset Search Filter" class="ml-auto" icon={XCircle} iconSize={22}
                    on:click={async (e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        debounce('');
                        communityFiltervalue = '';
                    }}
                >
                </Button>
            </form>
        </div>
    {/if}

    <hr class="dark:opacity-10 w-[90%] my-2 mx-auto" />

    <div class="flex flex-col gap-1">

        <!---Favorites List--->
        {#if selected == 'favorites'}
            {#if $profile?.groups &&  $profile?.groups[getGroupIndex('Favorites')]?.communities?.length > 0}
                <CommunityList 
                    expanded={true}  hidden={false}
                    items={$profile?.groups[getGroupIndex('Favorites')]?.communities}
                    class="max-h-[79vh] overflow-y-auto"
                />
            {:else}
                <li class="text-xs opacity-80 text-left mx-4 my-1 py-1 w-48">Favorites group is empty.</li>
            {/if}
                
        {/if}

        <!---Subscribed List--->
        {#if selected == 'subscribed'}
            <CommunityList expanded hidden={false}
                items={
                    onlyShowModerating
                    ? $profile.user.moderates.map((i) => i.community)
                    : $profile.user.follows.map((i) => i.community)
                }
                filter={communityFilterTerm}
                class="max-h-[79vh] overflow-y-auto"
            />

        {/if}

    </div>

</Menu>
{/if}