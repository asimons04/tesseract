<script lang="ts">
    import UserPage from '../../u/[name]/+page.svelte'
    export let data
</script>
<h1 class="flex flex-row justify-between">
    <span class="font-bold text-2xl">Submissions</span>
</h1>

{#if data.user && data.sort && data.type && data.page}
    <UserPage
        data={
            {
                items: data.user.submissions,
                page: data.page,
                person_view: data.user.person_view,
                sort: data.sort,
                type: data.type,
            }
        }
        userSideCard={false}
    />
{:else}
    <pre>
        {JSON.stringify(data)}
    </pre>
{/if}
