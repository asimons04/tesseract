<script lang="ts">
    import type { PrivateMessageView } from 'lemmy-js-client'

    import { profile } from '$lib/auth'

    import Markdown from '$lib/components/markdown/Markdown.svelte';
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte';


    export let item: PrivateMessageView
    export let read: boolean = false
</script>

<div class="flex flex-row items-center">
    <div class="text-sm max-w-[80ch] whitespace-nowrap text-ellipsis overflow-hidden flex flex-row items-center gap-1 {read ? 'opacity-80' : ''}">
        <span class="font-bold flex items-center">
            {#if item.creator.id == $profile?.user?.local_user_view.person.id}
                You
            {:else}
                <UserLink avatar user={item.creator} />
            {/if}
        </span>
        <span>messaged</span>
        <span class="font-bold flex items-center">
            {#if item.recipient.id == $profile?.user?.local_user_view.person.id}
                You
            {:else}
                <UserLink avatar user={item.recipient} />
            {/if}
        </span>
    </div>
</div>

<p class="text-sm py-2">
    <Markdown source={item.private_message.content} />
</p>