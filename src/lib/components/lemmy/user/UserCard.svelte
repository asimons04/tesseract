<script lang="ts">
    import type { CommunityModeratorView, LocalUserView, PersonView } from 'lemmy-js-client'
    import type { BanUserEvent } from '$lib/ui/events';

    import { isBlocked } from '$lib/lemmy/user.js'
    import { profile } from '$lib/auth.js'

    import CollapseButton from '$lib/components/ui/CollapseButton.svelte'
    import CommunityLink from '../community/CommunityLink.svelte';
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import SidebarFooter from '$lib/components/ui/SidebarFooter.svelte';
    import StickyCard from '$lib/components/ui/StickyCard.svelte'
    import UserCardSmall from './UserCardSmall.svelte';

    import {
        ShieldCheck,
        UserCircle,
    } from 'svelte-hero-icons'
    
    export let person: PersonView 
    export let moderates: CommunityModeratorView[]
    export let display = true

    //$: is_admin = (person as PersonView).is_admin ?? (person as LocalUserView).local_user.admin ?? false
    $: is_admin = (person as PersonView).is_admin ?? false
    $: userBlocked = ($profile?.user && person) ? isBlocked($profile.user, person.person.id) : false

    function handleBanUser(e:BanUserEvent) {
        if (e.detail.person_id == person.person.id) {
            person.person.banned = e.detail.banned
            person  = person
        }
    }

</script>

<svelte:window on:banUser={handleBanUser} />

{#if display}

    <StickyCard class="{$$props.class}">
        <UserCardSmall person_view={person} blocked={userBlocked} href={false} admin={is_admin}/>

        
        <div class="hidden xl:block w-full overflow-y-auto">
        <!---List of Communities Moderated--->
        {#if moderates?.length > 0}
            <CollapseButton icon={ShieldCheck} title="Moderates">
                {#each moderates as community}
                    <CommunityLink community={community.community} avatar class="p-1"/>
                {/each}
            </CollapseButton>
        {/if}
        
        <!---Person Bio--->
        {#if person?.person?.bio}
            <CollapseButton icon={UserCircle} title="About Me" expanded={false}>
                <Markdown source={person.person.bio} />
            </CollapseButton>
        {/if}
        </div>
        
        <!---Tesseract Logo and project links--->
        <SidebarFooter />

        
        

    </StickyCard>
{/if}