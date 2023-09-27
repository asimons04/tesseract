<script lang="ts">
    import type { LocalUserView, PersonView } from 'lemmy-js-client'

    import { ban, isAdmin } from '$lib/components/lemmy/moderation/moderation.js'
    import { isBlocked } from '$lib/lemmy/user.js'
    import { getClient } from '$lib/lemmy.js'
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import Avatar from '$lib/components/ui/Avatar.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import Modal from '$lib/components/ui/modal/Modal.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte'
    import ShieldIcon from '$lib/components/lemmy/moderation/ShieldIcon.svelte'
    import StickyCard from '$lib/components/ui/StickyCard.svelte'
    import TextArea from '$lib/components/input/TextArea.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    import {
        Cake,
        ChatBubbleOvalLeftEllipsis,
        Envelope,
        Icon,
        NoSymbol,
        PencilSquare,
        ShieldCheck,
        ShieldExclamation,
        Trophy,
        UserPlus,
    } from 'svelte-hero-icons'
    
    

    export let person:LocalUserView | PersonView

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

{#if $profile?.user}
    <Modal bind:open={messaging}>
        <h1 class="text-2xl font-bold" slot="title">Message</h1>
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


<StickyCard class="p-3">
    <Card>
        <div class="flex flex-row gap-3 items-center p-3">
            <div class="flex-shrink-k">
                <Avatar
                    width={64}
                    url={person.person.avatar}
                    alt={person.person.name}
                />
            </div>

            <div class="flex flex-col gap-0">
                <div>
                    <h1 class="font-bold text-lg">
                        <UserLink badges user={person.person} showInstance={false} />
                    </h1>
                    <span>@{person.person.name}@{new URL(person.person.actor_id).hostname}</span>
                </div>
            </div>
        </div>

        <div class="mt-4 text-sm flex flex-row justify-between gap-3 p-3 w-[95%] ml-auto mr-auto">
            
            <div class="flex flex-row items-center gap-2">
                <Icon src={Cake} width={16} height={16} mini />
                <span class="capitalize">
                    <RelativeDate date={new Date(person.person.published + 'Z')}/>
                </span>
            </div>
            
            <div class="flex flex-row items-center gap-2">
                <Icon src={PencilSquare} width={16} height={16} mini />
                <FormattedNumber number={person.counts.post_count} />
            </div>
    
            <div class="flex flex-row items-center gap-2">
                <Icon src={ChatBubbleOvalLeftEllipsis} width={16} height={16} mini />
                <FormattedNumber number={person.counts.comment_count} />
            </div>
            
            <div class="flex flex-row items-center gap-2">
                <Icon src={Trophy} width={16} height={16} mini />
                <FormattedNumber number={(person.counts.post_score + person.counts.comment_score)} />
            </div>

        </div>
    </Card>

    

    {#if $profile?.user && $profile.jwt && person.person.id != $profile.user.local_user_view.person.id}
        <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 w-full">
                <Button
                    size="lg"
                    color="secondary"
                    on:click={() => (messaging = true)}
                    class="flex-1"
                >
                    <Icon slot="icon" solid size="16" src={Envelope} />
                    Message
                </Button>

                {#if person.person.matrix_user_id}
                <Button
                    size="lg"
                    color="secondary"
                    href="https://matrix.to/#/{person.person.matrix_user_id}"
                    class="flex-1"
                >
                    <Icon slot="icon" solid size="16" src={ShieldCheck} />
                    Matrix User
                </Button>
                {/if}
            </div>

            <Button
                size="lg"
                color="danger"
                loading={blocking}
                disabled={blocking}
                on:click={() => blockUser(person.person.id)}
            >
                <Icon slot="icon" mini size="16" src={NoSymbol} />
                {isBlocked($profile.user, person.person.id)
                    ? 'Unblock'
                    : 'Block'
                }
            </Button>
        </div>

        {#if isAdmin($profile?.user)}
        <Menu class="ml-auto" alignment="top-right">
            <Button size="square-md" let:toggleOpen on:click={toggleOpen} slot="button">
                <ShieldIcon width={16} filled />
            </Button>
        
            <MenuButton
                color="dangerSecondary"
                on:click={() =>
                    ban(person.person.banned, person.person)
                }
            >
                <Icon slot="icon" mini size="16" src={ShieldExclamation} />
                {person.person.banned ? 'Unban' : 'Ban'}
            </MenuButton>
        </Menu>
        {/if}
    {/if}

    
    {#if person.person.bio}
        <h1 class="font-bold text-lg">About Me</h1>
    
        <Markdown source={person.person.bio} />
    {/if}
</StickyCard>