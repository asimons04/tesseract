<script lang="ts">
    import { getClient } from '$lib/lemmy'
    import { load as loadModlog } from '$routes/modlog/+page'
    import { profile } from '$lib/auth'
    import { toast } from '$lib/components/ui/toasts/toasts'
    
    import Button from '$lib/components/input/Button.svelte';
    import Checkbox from '$lib/components/input/Checkbox.svelte';
    import DateInput from '$lib/components/input/DateInput.svelte';
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import ModlogItemList from '$routes/modlog/item/ModlogItemList.svelte'
    import MultiSelect from '$lib/components/input/MultiSelect.svelte';
    import Placeholder from '$lib/components/ui/Placeholder.svelte';
    import Setting from '$routes/settings/Setting.svelte';
    import Spinner from '$lib/components/ui/loader/Spinner.svelte';
    import TextArea from '$lib/components/input/TextArea.svelte';
    import TextInput from '$lib/components/input/TextInput.svelte';

    import { 
        Icon,
        Newspaper,
        Trash
    } from 'svelte-hero-icons'
    import Pageination from '$lib/components/ui/Pageination.svelte';
    
    

    export let data
    
    let modlogDiv:HTMLDivElement
    let modlogLoading = false

    let formData = {
        user: '',
        ban: true,
        expires: '',
        reason: '',
        remove_data: false,
        banning: false
    }

    async function banUnbanUser() {
        
        if (!$profile?.jwt) return
        
        if (!formData.user) {
            toast({
                content: `Please supply a user to ${formData.ban ? 'ban' : 'unban'}.`,
                type: 'warning',
                title: 'No User Provided'
            })
            return
        }

        // Validate date and format into the expected format for Lemmy's API
        let date: undefined | number = undefined
        if (formData.expires != '') {
            date = Date.parse(formData.expires)
            if (Number.isNaN(date) || date < Date.now()) {
                toast({
                    content: `Date is invalid and/or in the past.`,
                    type: 'warning',
                    title: 'Invalid Date'
                })
                
                return
            }
            date = Math.floor(date / 1000)
        }
        
        // Convert a Lemmyverse link to something that can be resolved
        if (formData.user.startsWith('https://lemmyverse.link')) {
            formData.user = formData.user.replace('https://lemmyverse.link/u/', '@')
        }

        formData.banning = true

        try {
            const res = await getClient().resolveObject({
                q: formData.user,
            })

            if (res.person) {
                const banUserRes = await getClient().banFromCommunity({
                    ban: formData.ban,
                    expires: date || undefined,
                    person_id: res.person.person.id,
                    community_id: data.community.community_view.community.id,
                    reason: formData.reason,
                    remove_data: formData.remove_data
                })


                toast({
                    content: `${formData.ban ? 'Banned' : 'Unbanned'} ${res.person.person.name}@${new URL(res.person.person.actor_id).hostname}.`,
                    type: 'success',
                    title: 'Success'
                })

                formData.user = ''
                formData.reason = ''
                formData.expires = ''
                formData.ban = false
                formData.remove_data = false
            } 
            else {
                toast({
                    content: 'Could not find that user.',
                    type: 'warning',
                    title: 'User Not Found'
                })
            }
        } 
        catch (err) {
            toast({
                content: (err as any) ?? `API returned an error when trying to ${formData.ban ? 'ban' : 'unban'} that user.`,
                type: 'error',
                title: 'Error'
            })
        }

        formData.banning = false
        reloadModlog()
    }

    async function reloadModlog() {
        modlogLoading = true
        const modlogSearchURL = new URL('https://localhost')
        modlogSearchURL.searchParams.set('community', data.community.community_view.community.id.toString())
        modlogSearchURL.searchParams.set('page', data.modlog.page.toString())
        
        data.modlog = await loadModlog({url: modlogSearchURL})
        modlogLoading = false
    }
</script>

<svelte:head>
    <title>Community Moderation</title>
</svelte:head>


<MainContentArea>
    <h1 class="font-bold text-2xl">Moderation</h1>
    
    <Setting>
        <span slot="title">Ban/Unban a User</span>
        <span slot="description">
            Use this form to directly ban or unban a user from this community. Direct bans can be useful if there is a known troll 
            posting elsewhere and you want to prevent them from hitting your community. You can also quickly unban a user without having
            to find them in the modlog or locate a submission to find the relevant action button.
        </span>

        <div class="flex flex-row gap-2 pt-4 w-full items-end">
            <TextInput bind:value={formData.user} class="w-full" label="User" required placeholder="@user@example.com, https://example.com/u/user, or https://lemmyverse.link/u/user@example.com" />
            <MultiSelect  options={[false, true]} optionNames={['Unban', 'Ban']} bind:selected={formData.ban} />
        </div>

        <div class="flex flex-col md:flex-row gap-2 w-full">
            <div class="w-full md:w-2/3">
                <TextArea bind:value={formData.reason} rows={3} placeholder="Why are you {formData.ban ? 'banning' : 'unbanning'} this user?" class="w-full" label="Reason"/>
            </div>

            <div class="w-full md:w-1/3">
                {#if formData.ban}
                    <div class="flex flex-col gap-2 w-full">    
                        <DateInput bind:value={formData.expires} label="Ban Expires?"/> 
                        <Checkbox bind:checked={formData.remove_data}>Remove Submissions?</Checkbox>
                    </div>
                {/if}
            </div>
        </div>

        <div class="flex flex-row w-full">
            <Button loading={formData.banning} disabled={formData.banning} color="primary" size="lg" class="w-full flex-shrink-0" on:click={banUnbanUser}>
                <Icon slot="icon" src={Trash} mini size="16" />
                {formData.ban ? 'Ban' : 'Unban'} User
            </Button>
        </div>
    </Setting>

    
    <!---Community Modlog--->
    <Setting>
        <span slot="title">
            <span class="flex flex-row w-full items-center justify-between">
                <span>Community Modlog</span>
                <Button href="/modlog?community={data.community.community_view.community.id.toString()}" title="Full Community Modlog">
                    <Icon src={Newspaper} mini width={18}/>
                </Button>
            </span>
        </span>

        <span slot="description">
            Mini modlog for this community. Use the button to the top right of this panel to access the full-featured modlog.
        </span>
        
        
        <div bind:this={modlogDiv} class="flex flex-col gap-4 mt-2 max-h-[60vh] overflow-y-scroll p-2">
            {#if modlogLoading}
                <span class="mx-auto my-auto">    
                    <Spinner width={64} />
                </span>
            {/if}
            
            {#if data.modlog?.modlog?.length > 0}
                {#each data.modlog.modlog as modlogItem}
                    {#if 
                        [
                            'postRemoval', 'postRestore', 'postLock', 'postUnlock', 'commentRemoval', 'commentRestore', 
                            'ban', 'unban' ,'banCommunity', 'unbanCommunity'
                        ].includes(modlogItem.actionName)
                    }
                        <div class="bg-slate-100 dark:bg-zinc-800 text-black dark:text-slate-100 border border-slate-900 dark:border-zinc-100 p-2 text-sm rounded-md leading-[22px]">    
                            <ModlogItemList bind:item={modlogItem} hideCommunity={true} />
                        </div>
                    {/if}

                {/each}
                
                <!---Spacer for bottommost action menu--->
                <span class="mt-4" />
            {:else}
                <span class="mx-auto my-auto">
                    <Placeholder icon={Newspaper} title="No Results" description="No modlog results returned" />
                </span>
            {/if}
        </div>
        
            
            <Pageination bind:page={data.modlog.page} on:change={(e) => {
                reloadModlog()
                modlogDiv.scrollTo(0,0)
            }}/>
        
    </Setting>
</MainContentArea>