<script lang="ts">
    import { goto } from '$app/navigation'
    import { page } from '$app/stores'
    import { profile, deleteProfile, setUserID, type Profile } from '$lib/auth.js'
    import Button from '$lib/components/input/Button.svelte'
    import ProfileAvatar from '$lib/lemmy/ProfileAvatar.svelte'
    import {Icon, Trash} from 'svelte-hero-icons'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    export let prof: Profile
    export let index: number

    let switching: boolean = false
</script>

<Button
    color="tertiary"
    alignment="left"
    loading={switching}
    loaderWidth={20}
    title={prof.username ?? prof.user?.local_user_view.person.name}
    on:click={
        async (e) => {
            e.stopPropagation();
            
            switching = true

            if ($profile?.id == prof.id) {
                await setUserID(-1)
            } else {
                await setUserID(prof.id)
            }

            await goto($page.url, {
                invalidateAll: true,
            })

            switching = false

        }
    }
    class="w-full {$profile?.id == prof.id ? 'font-bold' : ''}"
>
    
    <ProfileAvatar profile={prof} {index} selected={$profile?.id == prof.id} slot="icon" />
    
    <span class="flex flex-col gap-0">
        {prof.username ?? prof.user?.local_user_view.person.name}
        <span class="text-slate-500 dark:text-zinc-400 font-normal text-xs">
            {prof.instance}
        </span>
    </span>
    
    <span class="ml-auto">
        <Button on:click={(e) => {
                    e.stopPropagation();
                    toast({
                        type: 'warning',
                        title: "Confirm Account Removal",
                        content: "Are you sure you want to delete this profile?",
                        action: () => deleteProfile(prof.id)
                    })
                }}
                size="sm"
                color="danger"
                title="Logout / Delete Profile"
            >
                <Icon slot="icon" src={Trash} size="11" mini/>
        </Button>
    </span>
    


</Button>
