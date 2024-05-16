<script lang="ts">
    import type { PersonView } from 'lemmy-js-client'
    
    import {
        Cake,
        ChatBubbleOvalLeftEllipsis,
        Icon,
        PencilSquare,
    } from 'svelte-hero-icons'

    import Card from '$lib/components/ui/Card.svelte'
    import FormattedNumber from '$lib/components/util/FormattedNumber.svelte'
    import RelativeDate from '$lib/components/util/RelativeDate.svelte';
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'
    import Avatar from '$lib/components/ui/Avatar.svelte';
    
    export let user: PersonView
</script>

<Card>
    
        
    <div class="flex flex-row gap-2 text-sm max-w-full p-2">
        
        <div class="flex-shrink-0">
            <Avatar width={64} url={user.person.avatar} alt={user.person.name} />
        </div>

        <div class="flex flex-col gap-2">
            <span class="break-words max-w-full w-max text-base font-bold text-sky-700 dark:text-sky-400 hover:underline" >
                <UserLink avatar={false} user={user.person} />
            </span>
            <!---Cake day and post/comment counts--->
            <div class="flex flex-row gap-8 items-center">
                <div class="flex flex-row gap-1 items-center" title="Account Created Date">
                    <Icon src={Cake} width={16} height={16} mini />
                    <span class="capitalize">
                        <RelativeDate date={user.person?.published}/>
                    </span>
                </div>
                
                <div class="flex flex-row gap-1 items-center" title="Post count">
                    <Icon src={PencilSquare} mini width={16} />
                    <FormattedNumber number={user.counts.post_count} />
                </div>

                <div class="flex flex-row gap-1 items-center" title="Comment count">
                    <Icon src={ChatBubbleOvalLeftEllipsis} mini width={16} />
                    <FormattedNumber number={user.counts.comment_count} />
                </div>
            </div>
        </div>
    </div>
    
</Card>
