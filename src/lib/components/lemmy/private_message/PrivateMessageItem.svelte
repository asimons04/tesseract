<script lang="ts">
    import type { PrivateMessageView } from 'lemmy-js-client'

    import { hrColors } from '$lib/ui/colors';

    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
    import SettingToggle from '$lib/components/ui/settings/SettingToggle.svelte';
    import { Photo } from 'svelte-hero-icons';

    export let item: PrivateMessageView
    export let read: boolean = false

    let showImages: boolean = false
</script>


<!---Message Header--->
<div class="flex flex-col text-sm w-full truncate  items-center gap-1 {read ? 'opacity-80' : ''}">
    
    <div class="flex flex-row w-full gap-4 items-center">
        <span class="w-[5ch] font-bold">From:</span>
        <span class="w-full">
            <UserLink avatar={false} user={item.creator} />
        </span>
    </div>

    <div class="flex flex-row w-full gap-4 items-center">
        <span class="w-[5ch] font-bold">To:</span>
        <span class="w-full">
                <UserLink avatar={false} user={item.recipient} />
        </span>
    </div>

    <div class="flex flex-row w-full gap-4 items-center">
        <span class="w-[5ch] font-bold">Date:</span>
        <span class="w-full">
            {new Date(item.private_message.published).toLocaleString()}
        </span>
    </div>

    {#if item.private_message.content.includes('![')}
    <SettingToggle 
        title="Show Images"
        description="Inline images in DMs are disabled by default for privacy. To load images, use the toggle to enable them for this message only."
        icon={Photo}
        bind:value={showImages}
    />
    {/if}
</div>

<hr class="{hrColors}" />

<!---Message Body--->
<p class="text-sm py-2">
    <Markdown source={item.private_message.content} noImages={!showImages} />
</p>