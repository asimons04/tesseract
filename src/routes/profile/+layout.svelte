<script>
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'

    import MultiSelect from '$lib/components/input/MultiSelect.svelte'
    import UserCard from '$lib/components/lemmy/user/UserCard.svelte'

    export let data;
</script>

<svelte:head>
    <title>Profile</title>
</svelte:head>

<div class="flex flex-col gap-4 h-full p-2">
    <MultiSelect
        headless
        options={['/profile/user', '/profile/inbox', '/profile/settings', '/profile/blocks', '/profile/saved']}
        optionNames={['User', 'Inbox', 'Settings', 'Blocks', 'Saved']}
        selected={$page.url.pathname}
        on:select={(e) => {
            goto(e.detail)
        }}
        items={5}
    />
    
    <div class="flex flex-col-reverse xl:flex-row gap-4 max-w-full w-full px-2">
        <div class="flex flex-col gap-4 max-w-full w-full min-w-0">
            <slot />
        </div>


        <div>
            <UserCard person={data.user.person_view} />
        </div>
    </div>

    
</div>
