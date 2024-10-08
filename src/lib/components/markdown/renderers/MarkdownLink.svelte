<script lang="ts">
    import type { Community, Person } from 'lemmy-js-client';
    import type { Tokens } from 'marked'
    
    import { createFakePerson, createFakeCommunity } from '$lib/components/lemmy/post/helpers'
    import { userProfileModal, communityProfileModal } from '$lib/components/lemmy/moderation/moderation'
    import { userSettings } from '$lib/settings';

    import Badge from '$lib/components/ui/Badge.svelte';
    import Link from '$lib/components/input/Link.svelte';
    
    import { 
        type CustomMarkdownOptions,
        photonify 
    } from '../markdown';
    
   
    export let token: Tokens.Link
    export let options: CustomMarkdownOptions

    let person: Person | undefined = undefined
    let community: Community | undefined = undefined
    let hashtagRE = /^#[A-Za-z0-9À-ÿ]+/i
    
    $: token, token.href = photonify(token.href) ?? token.href
    $: token, token.text = token.text.startsWith('\\#') ? token.text.replace('\\#', '#') : token.text
    $: token, person = generatePerson(token.href)
    $: token, community = generateCommunity(token.href)

    function generatePerson(text:string) {
        if (!text.startsWith('/u/')) return

        let username = text.replaceAll('/u/', '').trim()
        const [user, domain] = username.split('?')[0].split('@')
        if (!user || !domain) return
        const actor_id =  `https://${domain.trim()}/u/${user}`
        const person = createFakePerson()
        person.actor_id = actor_id
        person.name = user
        return person
    }

    function generateCommunity(text:string) {
        if (!text.startsWith('/c/') ) return
        let username = text.replaceAll('/c/', '').trim()
        const [name, domain] = username.split('?')[0].split('@')
        if (!name || !domain) return
        const actor_id =  `https://${domain.trim()}/c/${name}`
        const community = createFakeCommunity()
        community.actor_id = actor_id
        community.name = name
        return community
    }
</script>

<!--- Turn user links into badges that load a user profile modal--->
{#if person}
    <Badge color="blue" rightJustify={false} inline={true} on:click={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (person) userProfileModal(person)
    }}>
        @{person.name}@{new URL(person.actor_id).hostname}
    </Badge>

<!--- Turn community links into badges that load a community profile modal--->
{:else if community}
    <Badge color="orange" rightJustify={false} inline={true} on:click={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (community) communityProfileModal(community)
    }}>
        !{community.name}@{new URL(community.actor_id).hostname}
    </Badge>


<!--Turn hashtags into badges but keep the original link--->
{:else if $userSettings.linkifyHashtags && hashtagRE.test(token.text)}
    <Badge color="yellow" rightJustify={false} inline={true} on:click={(e) => {
        e.preventDefault()
        e.stopPropagation()
        $userSettings.openInNewTab.links
            ? window.open(token.href)
            : window.location.href=token.href
    }}>
        {token.text}
    </Badge>

<!---Display a regular link--->
{:else}
    <Link highlight 
        href={token.href} 
        title={token.title ?? token.href} 
        preview={
            !(token.href.startsWith('/')) && 
            $userSettings.uiState.linkPreviews &&
            !(options?.custom?.noPreview ?? false)
        } 
        newtab={$userSettings.openInNewTab.links}
    >
        <slot/>
    </Link>

    
{/if}