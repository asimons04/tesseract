<script lang="ts">
    import type { Community, Person } from 'lemmy-js-client'
    
    import { createEventDispatcher } from 'svelte';
    import { dispatchWindowEvent } from '$lib/ui/events'
    import { getClient } from '$lib/lemmy.js'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import SettingDateInput from '$lib/components/ui/settings/SettingDateInput.svelte';
    import SettingToggle from '$lib/components/ui/settings/SettingToggle.svelte'
    import SettingToggleContainer from '$lib/components/ui/settings/SettingToggleContainer.svelte'

    import {
        CalendarDays,
        Check,
        NoSymbol,
        Trash
    } from 'svelte-hero-icons'
    import BanUserForm from '../modal/components/BanUserForm.svelte';
    

    export let open = false
    export let user: Person 
    export let community: Community | undefined
    export let banned: boolean
 
</script>

<Modal bind:open title="{banned ? 'Unbanning' : 'Banning'} User From {community ? 'Community' : 'Instance'}" icon={banned ? Check : NoSymbol}  width="max-w-2xl"  on:close={() => { history.back() }}>
    <BanUserForm person={user} {community} creator_banned_from_community={community && banned}/>
</Modal>
