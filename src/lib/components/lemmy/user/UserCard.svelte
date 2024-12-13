<script lang="ts">
    import type { CommunityModeratorView, LocalUserView, PersonView } from 'lemmy-js-client'
    import type { BanUserEvent } from '$lib/ui/events';

    import { ban, isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
    import { isBlocked, blockUser } from '$lib/lemmy/user.js'
    import { goto } from '$app/navigation'
    import {imageProxyURL} from '$lib/image-proxy'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { userSettings } from '$lib/settings.js'

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import CollapseButton from '$lib/components/ui/CollapseButton.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import SidebarFooter from '$lib/components/ui/SidebarFooter.svelte';
    import StickyCard from '$lib/components/ui/StickyCard.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
    import UserSendMessageModal from '../modal/UserSendMessageModal.svelte'

    import {
        Cake,
        ChatBubbleOvalLeftEllipsis,
        EllipsisVertical,
        Envelope,
        Hashtag,
        Home,
        Icon,
        NoSymbol,
        Newspaper,
        PencilSquare,
        Share,
        ShieldCheck,
        ShieldExclamation,
        UserCircle,
    } from 'svelte-hero-icons'
    import UserCardSmall from './UserCardSmall.svelte';
    
    
    
    
    export let person: PersonView 
    export let moderates: CommunityModeratorView[]
    export let display = true

    //$: is_admin = (person as PersonView).is_admin ?? (person as LocalUserView).local_user.admin ?? false
    $: is_admin = (person as PersonView).is_admin ?? false
    $: userBlocked = ($profile?.user && person) ? isBlocked($profile.user, person.person.id) : false
    
    let blocking = false
    let messaging = false

    function handleBanUser(e:BanUserEvent) {
        if (e.detail.person_id == person.person.id) {
            person.person.banned = e.detail.banned
            person  = person
        }
    }

</script>

<svelte:window on:banUser={handleBanUser} />

{#if display}
    
    <!---DM Compose Modal--->
    {#if $profile?.user}
        <UserSendMessageModal bind:open={messaging} bind:person={person} />
    {/if}

    <StickyCard class="{$$props.class}">
        <UserCardSmall person_view={person} blocked={userBlocked} href={false}/>

        
        <div class="hidden xl:block w-full overflow-y-auto">
        <!---List of Communities Moderated--->
        {#if moderates?.length > 0}
            <CollapseButton icon={ShieldCheck} title="Moderates">
                {#each moderates as community}
                    <div class="inline-flex w-full">
                        <Button
                            class="hover:bg-slate-200 w-full h-max !px-0"
                            color="tertiary"
                            alignment="left"
                            href="/c/{community.community.name}@{new URL(community.community.actor_id).hostname}"
                            title="{community.community.title.replace('&amp;', '&')}@{new URL(community.community.actor_id).hostname}"
                        >
                            <div class="flex-none">
                                <Avatar
                                    url={community.community.icon}
                                    alt={community.community.name}
                                    title={community.community.title}
                                    width={20}
                                    slot="icon"
                                />
                            </div>
                            
                            <span class="w-full break-words">
                                {community.community.title.replace('&amp;', '&')}
                            </span>
                        </Button>
                    </div>
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