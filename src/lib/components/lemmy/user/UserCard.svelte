<script lang="ts">
    import type { CommunityModeratorView, LocalUserView, PersonView } from 'lemmy-js-client'

    import { ban, isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
    import { isBlocked } from '$lib/lemmy/user.js'
    import { getClient } from '$lib/lemmy.js'
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
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import SidebarFooter from '$lib/components/ui/SidebarFooter.svelte';
    import StickyCard from '$lib/components/ui/StickyCard.svelte'
    import TextArea from '$lib/components/input/TextArea.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    import {
        Cake,
        ChatBubbleOvalLeftEllipsis,
        EllipsisVertical,
        Envelope,
        Hashtag,
        Home,
        Icon,
        InformationCircle,
        NoSymbol,
        Newspaper,
        PencilSquare,
        Share,
        ShieldCheck,
        ShieldExclamation,
        Trophy,
        UserCircle,
    } from 'svelte-hero-icons'
    
    
    export let person: PersonView | LocalUserView
    export let moderates: CommunityModeratorView[]
    export let display = true

    let blocking = false
    let loadingMessage = false
    let messaging = false
    let message = ''

    async function blockUser(block: number) {
        if (!$profile?.user || !$profile?.jwt) throw new Error('Unauthenticated')
        blocking = true

        try {
            const blocked = isBlocked($profile.user, block)

            await getClient().blockPerson({
                auth: $profile.jwt,
                block: !blocked,
                person_id: block,
            })

            if (blocked) {
                const index = $profile.user.person_blocks
                    .map((p) => p.target.id)
                    .indexOf(block)
                $profile.user.person_blocks.splice(index, 1)
            }
            
            toast({
                content: `Successfully ${blocked ? 'unblocked' : 'blocked'} that user.`,
                type: 'success',
            })

            goto($page.url, {
                invalidateAll: true,
            })
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
            })
        }
        blocking = false
    }

    async function sendMessage() {
        if (!$profile?.jwt || message == '') return
        
        loadingMessage = true

        try {
            await getClient().createPrivateMessage({
                auth: $profile.jwt,
                content: message,
                recipient_id: person.person.id,
            })

            toast({
                content: 'Successfully sent that person a message.',
                type: 'success',
            })

            messaging = false
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
            })
        }

        loadingMessage = false
    }
</script>
{#if display}

    {#if $profile?.user}
        <Modal bind:open={messaging} title="Message">
            <form on:submit|preventDefault={sendMessage} class="flex flex-col gap-4">
                <p class="inline-flex flex-row gap-2 items-center">
                    Sending <UserLink avatar user={person.person} /> a message
                </p>
                <TextArea
                    bind:value={message}
                    label="Message"
                    rows={8}
                />
                <Button
                    color="primary"
                    size="lg"
                    submit
                    loading={loadingMessage}
                    disabled={loadingMessage}
                >
                    Send
                </Button>
            </form>
        </Modal>
    {/if}




    <StickyCard class="-mt-1 {$userSettings.uiState.expandCommunitySidebar ? 'block' : 'hidden'} {$$props.class}">
        <Card backgroundImage={($userSettings.uiState.showBannersInCards && person?.person?.banner) ? imageProxyURL(person.person.banner, 384, 'webp') : ''}>
            <div class="flex flex-row gap-3 items-start p-3">
                <div class="flex-shrink-0">
                    <Avatar width={48} url={person.person.avatar} alt={person.person.name} />
                </div>

                <div class="flex flex-col gap-0 w-full">
                    <div>
                        <h1 class="flex flex-row">
                            <span class="font-bold text-lg">
                                <UserLink badges user={person.person} showInstance={false} />
                            </span>

                            
                            <!--- Person Action Menu --->
                            <div class="ml-auto">
                                <Menu
                                    alignment="bottom-right"
                                    itemsClass="h-8 md:h-8"
                                    containerClass="!max-h-[90vh]"
                                >
                                    <Button color="tertiary" slot="button" let:toggleOpen on:click={toggleOpen} title="Community Options">
                                        <Icon src={EllipsisVertical} mini size="16" slot="icon" />
                                    </Button>
                                    
                                    <span class="px-4 py-1 my-1 text-xs text-slate-600 dark:text-zinc-400">
                                        User Actions
                                    </span>
                                    

                                    <!--- User Modlog--->
                                    <MenuButton link
                                        href="/modlog?other_person_id={person.person.id}"
                                        title="Modlog for {person.person.display_name ?? person.person.name}"
                                    >
                                        <Icon src={Newspaper} mini size="16" />
                                        User Modlog
                                    </MenuButton>

                                    <!--- View on Home Instance--->
                                    <MenuButton link
                                        href="{person.person.actor_id}"
                                        newtab={$userSettings.openInNewTab.links}
                                        title="View {person.person.display_name ?? person.person.name}'s profile on thier home instance"
                                    >
                                        <Icon src={Home} mini size="16" />
                                        View on User's Home Instance
                                    </MenuButton>

                                    <!--- Copy Lemmyverse Link--->
                                    <MenuButton title="Copy Lemmyverse Link"
                                    on:click={() => {
                                        navigator.clipboard.writeText(`https://lemmyverse.link/u/${person.person.name}@${new URL(person.person.actor_id).host}`)
                                        toast({
                                            type: 'success',
                                            content: `Copied Lemmyverse link to clipboard!`,
                                        })
                                        
                                    }}
                                    >
                                        <Icon src={Share} width={16} mini />
                                        Copy Lemmyverse Link
                                    </MenuButton>
                                    
                                    <!--- Actions for Logged-in <Users--->
                                    {#if $profile?.user && $profile.jwt && person.person.id != $profile.user.local_user_view.person.id}
                                        <!--- Message in Lemmy--->
                                        <MenuButton
                                            on:click={() => (messaging = true)}
                                        >
                                            <Icon solid size="16" src={Envelope} />
                                            Message in Lemmy
                                        </MenuButton>
                                
                                        <!---Message in Matrix--->
                                        {#if person.person.matrix_user_id}
                                        <MenuButton link
                                            href="https://matrix.to/#/{person.person.matrix_user_id}"
                                            newtab = {true}
                                        >
                                            <Icon solid size="16" src={Hashtag} />
                                            Message on Matrix
                                        </MenuButton>
                                        {/if}
                                            
                                        <!--- Block--->
                                        <MenuButton
                                            color="dangerSecondary"
                                            loading={blocking}
                                            disabled={blocking}
                                            on:click={() => blockUser(person.person.id)}
                                        >
                                            <Icon mini size="16" src={NoSymbol} />
                                            {isBlocked($profile.user, person.person.id)
                                                ? 'Unblock'
                                                : 'Block'
                                            }
                                        </MenuButton>
                                    {/if}
                                
                                    
                                    
                                    
                                    <!--- Admin Options--->
                                    {#if $profile?.user && isAdmin($profile?.user)}
                                        
                                        <!--Hide ban button if viewing own profile--->
                                        {#if person.person.id != $profile.user.local_user_view.person.id}
                                            <MenuButton
                                                color="dangerSecondary"
                                                on:click={() =>
                                                    ban(person.person.banned, person.person)
                                                }
                                            >
                                                <Icon slot="icon" mini size="16" src={ShieldExclamation} />
                                                {person.person.banned ? 'Unban' : 'Ban'}
                                            </MenuButton>
                                        {/if}
                                    {/if}
                                
                                </Menu>
                            </div>
                            <!---End Person Action Menu--->
                        </h1>
                        <span class="text-xs">@{person.person.name}@{new URL(person.person.actor_id).hostname}</span>
                    </div>
                </div>

                

            </div>

            
            <div class="flex flex-row p-3 mx-auto">
                <div class="text-sm flex flex-row gap-8 mx-auto">
                    <span class="flex flex-row items-center gap-2" title="Cake Day">
                        <Icon src={Cake} width={16} height={16} mini />
                        <span class="capitalize">
                            <RelativeDate date={person.person?.published}/>
                        </span>
                    </span>
                
                    <span class="flex flex-row items-center gap-2" title="Posts">
                        <Icon src={PencilSquare} width={16} height={16} mini />
                        <FormattedNumber number={person.counts.post_count} />
                    </span>
        
                    <span class="flex flex-row items-center gap-2" title="Comments">
                        <Icon src={ChatBubbleOvalLeftEllipsis} width={16} height={16} mini />
                        <FormattedNumber number={person.counts.comment_count} />
                    </span>
                    
                    {#if person.counts.post_score && person.counts.comment_score}
                    <span class="flex flex-row items-center gap-2" title="Content Score">
                        <Icon src={Trophy} width={16} height={16} mini />
                        <FormattedNumber number={(person.counts.post_score + person.counts.comment_score)} />
                    </span>
                    {/if}
                    
                </div>
            </div>
        </Card>

        <div class="hidden xl:block w-full overflow-y-auto">
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
        
        {#if person?.person?.bio}
            <CollapseButton icon={UserCircle} title="About Me" expanded={false}>
                <Markdown source={person.person.bio} />
            </CollapseButton>
        {/if}
        </div>
        
        <!-- Spacer block to give user action menu room to expand --->
        <!--<div class="hidden xl:block h-[150px]" />-->

        <SidebarFooter />

        
        

    </StickyCard>
{/if}