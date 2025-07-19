<script lang="ts">
    import type { Community } from "lemmy-js-client"

    import { EXTREMIST_COMMUNITIES } from "$lib/blacklists"
    import { deleteProfile } from "$lib/auth"
    import { goto } from "$app/navigation"
    import { hrColors } from "$lib/ui/colors"
    import { profile } from "$lib/auth"
    import { subscribe } from '$lib/components/lemmy/community/helpers'

    import Placeholder      from "$lib/components/ui/Placeholder.svelte"
    import Button           from "$lib/components/input/Button.svelte"
    import Card             from "$lib/components/ui/Card.svelte"
    import CommunityLink    from "../community/CommunityLink.svelte"
    import Modal            from "$lib/components/ui/modal/Modal.svelte"

    import { ArrowRightOnRectangle, ExclamationCircle, Rss, Trash } from "svelte-hero-icons";

    let unsubscribing = false
    
    async function unsubscribe(community:Community) {
        try {
            unsubscribing = true
            // Send true since it expects the current follow state and will apply the opposite
            await subscribe(community, true, false)
            unsubscribing = false
        }
        catch {
            unsubscribing = false
        }
    }
    
    async function unsubscribeAll() {
        const communities = $profile?.user?.follows?.filter( (c) => { return EXTREMIST_COMMUNITIES.includes(c.community.actor_id) })
        if (communities && communities.length > 0) {
            for (let i=0; i<communities.length; i++) {
                await unsubscribe(communities[i].community)
            }
        }
    }
</script>

<Modal open={true} noClose icon={ExclamationCircle} title="Access Denied" width="max-w-4xl">

    <div class="flex flex-col p-2  my-auto w-full">
        
        <Card elevation={0} class="p-2">
            <Placeholder
                title="Tesseract Will Not Tolerate Extremism" 
                description="You are subscribed to one or more communities that are dedicated to 
                    advocating, promoting, endorsing, and/or praising extremism, violence, and/or vigilante justice." 
            />
        </Card>
        
        
        <span class="my-2" />

        
        <span class="flex flex-col gap-2 my-2 text-sm">
            <p>Neither Tesseract nor its developers will knowingly facilitate extremism nor any advocacy thereof.</p>
            <p class="font-bold">To continue using Tesseract with this account, you must unsubscribe from the following communities:
        </span>
        
        <div class="flex flex-col gap-1 w-[90%] mx-auto max-h-[50vh] overflow-y-auto">
            {#each $profile?.user?.follows?.filter( (c) => { return EXTREMIST_COMMUNITIES.includes(c.community.actor_id) }) ?? [] as badComm (badComm.community.id) }
                <Card elevation={0} class="p-2">
                    <span class="flex align-center w-full text-xs lg:text-sm xl:text-base">
                        <CommunityLink avatar avatarSize={24} community={badComm.community} />
                    </span>
                </Card>

                <hr class="{hrColors} my-1" /> 
            {/each}
        </div>

        <span class="flex flex-col gap-2 my-2 text-sm">
            <p>
                You are free to remain subscribed to these communities, but 
                you will need to logout and find another app. Tesseract will not be used
                to facilitate extremism.
            </p>

            <p>
                By clicking "continue", you agree to allow Tesseract to unsubscribe you from the communities listed above. 
            </p>
        </span>
    </div>

    <span class="flex flex-row gap-2 w-full justify-between" slot="buttons">
        <Button color="danger" size="lg" icon={Trash} title="Logout" on:click={() => {
                if ($profile?.id) {
                    deleteProfile($profile.id)
                    goto('/accounts')
                }
            }}
        >
            Logout
        </Button>

        <Button color="info" size="lg" icon={ArrowRightOnRectangle} 
            title="Continue"
            loading={unsubscribing} disabled={unsubscribing}
            on:click={async () => await unsubscribeAll()}
        >
            Continue
        </Button>
    </span>
</Modal>