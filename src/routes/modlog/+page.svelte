<script lang="ts">
    import Pageination from '$lib/components/ui/Pageination.svelte'
    import { searchParam } from '$lib/util.js'
    import { page } from '$app/stores'
    import ObjectAutocomplete from '$lib/components/lemmy/ObjectAutocomplete.svelte'
    import { profile } from '$lib/auth.js'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import { userSettings } from '$lib/settings.js'
    import ModlogItemCard from './item/ModlogItemCard.svelte'
    import ModlogItemTable from './item/ModlogItemTable.svelte'

    export let data


    // If community URL param is present, set the title to reflect the modlog is filtered for that community.
    let communityName:string = ''
    let communityFiltered:boolean = new URLSearchParams(window.location.search).has('community');

    if (communityFiltered && data.modlog && data.modlog.length > 0 && data.modlog[0].community) {
        communityName += "for ";
        communityName += data.modlog[0].community.title + " (";
        communityName += data.modlog[0].community.name + "@";
        communityName += new URL(data.modlog[0].community.actor_id).host + ")";
    }

</script>

<svelte:head>
    <title>Modlog {communityName}</title>
</svelte:head>

<div class="flex flex-col gap-4 p-2">
    <h1 class="font-bold text-2xl">Modlog {communityName}</h1>
    <div class="flex flex-col gap-2">
        <MultiSelect
            options={[
                'All',
                'ModRemovePost',
                'ModLockPost',
                'ModFeaturePost',
                'ModRemoveComment',
                'ModRemoveCommunity',
                'ModBanFromCommunity',
                'ModAddCommunity',
                'ModTransferCommunity',
                'ModAdd',
                'ModBan',
                'ModHideCommunity',
                'AdminPurgePerson',
                'AdminPurgeCommunity',
                'AdminPurgePost',
                'AdminPurgeComment',
            ]}

            optionNames={[
                'All',
                'Remove Post',
                'Lock Post',
                'Feature Post',
                'Remove Comment',
                'Remove Community',
                'Ban From Community',
                'Add Community',
                'Transfer Community',
                'Add',
                'Ban',
                'Hide Community',
                'Purge Person',
                'Purge Community',
                'Purge Post',
                'Purge Comment',
            ]}
            selected={data.type}
            on:select={(e) => searchParam($page.url, 'type', e.detail, 'page')}
        />

        <div class="max-w-sm" class:hidden={communityFiltered}>
            <div class="block my-1 font-bold text-sm">Community</div>
            <ObjectAutocomplete
                placeholder="Filter by community"
                jwt={$profile?.jwt}
                listing_type="All"
                showWhenEmpty={true}
                on:select={(e) =>
                    searchParam($page.url, 'community', e.detail?.id.toString(), 'page')}
            />
        </div>

        <MultiSelect
            options={[false, true, undefined]}
            optionNames={['Table', 'Cards', 'Default']}
            selected={
                $userSettings.modlogCardView ??
                !window.matchMedia('(min-width: 1600px)').matches
            }
            on:select={
                (e) => { $userSettings.modlogCardView = e.detail; }
            }
        />
    </div>

    {#if data.modlog}
        {#if $userSettings.modlogCardView ?? !window.matchMedia('(min-width: 1600px)').matches}
            <div class="flex flex-col gap-4">
                {#each data.modlog as modlog}
                    <div class="bg-slate-100 border border-slate-200 dark:border-zinc-800 dark:bg-zinc-900 p-2 text-sm rounded-md leading-[22px]">    
                        <ModlogItemCard item={modlog} />
                    </div>
                {/each}
            </div>
        
        {:else}
        <div style="width:100%; overflow-x: auto;">
            <table class="table overflow-x-auto table-fixed relative" style="min-width: 800px;">
                <colgroup class="table-fixed">
                    <col width="5%" />
                    <col width="15%" />
                    <col width="18%" class="overflow-x-auto" />
                    <col width="8%" />
                    <col width="10%" />
                    <col width="18%" />
                    <col width="26%" />
                </colgroup>

                <thead class="text-left sticky top-0">
                    <tr class="rounded-t-lg overflow-hidden">
                        <th>Time</th>
                        <th>Moderator</th>
                        <th>Action</th>
                        <th>User</th>
                        <th>Community</th>
                        <th>Content</th>
                        <th>Reason</th>
                    </tr>
                </thead>

                <tbody class="text-sm">
                    {#each data.modlog as modlog}
                        <ModlogItemTable item={modlog} />
                    {/each}
                </tbody>
            </table>
        </div>
        {/if}
    {/if}


    <Pageination
        page={data.page}
        on:change={(e) => searchParam($page.url, 'page', e.detail.toString())}
    />
</div>

<style lang="postcss">
    :global(.table thead tr th) {
        @apply border border-slate-200 dark:border-zinc-800 px-4 py-2 bg-slate-100;
    }

    :global(.table tr td) {
        @apply border border-slate-200 px-4 py-2 overflow-auto;
    }

    :global(.dark .table tr td) {
        @apply border-zinc-800;
    }

    :global(.dark thead tr th) {
        @apply border-zinc-800 bg-zinc-900;
    }
</style>
