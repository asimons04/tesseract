<script lang="ts">
    import {
        profileData,
        setUserID,
        profile as currentProfile,
        resetProfile,
        deleteProfile,
        moveProfile,
        type Profile,
        profile,
    } from '$lib/auth.js'
    
    
    import {
        DEFAULT_INSTANCE_URL,
        LINKED_INSTANCE_URL,
        instance,
    } from '$lib/instance.js'
    
    import { goto } from '$app/navigation'
    import { userSettings } from '$lib/settings.js'
    import { expoInOut, expoOut } from 'svelte/easing'
    import { flip } from 'svelte/animate'
    import { site } from '$lib/lemmy.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { validateInstance } from '$lib/lemmy.js'

    import Button from '$lib/components/input/Button.svelte'
    import DebugObject from '$lib/components/util/debug/DebugObject.svelte'
    import EditableList from '$lib/components/ui/list/EditableList.svelte'
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import Menu from '$lib/components/ui/menu/Menu.svelte'
    import MenuButton from '$lib/components/ui/menu/MenuButton.svelte'
    import ProfileAvatar from '$lib/lemmy/ProfileAvatar.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte';
    import TextInput from '$lib/components/input/TextInput.svelte'

    import {
        ArrowLeftOnRectangle,
        ArrowUturnLeft,
        BugAnt,
        ChevronDown,
        ChevronUp,
        EllipsisHorizontal,
        Icon,
        PaintBrush,
        Plus,
        Trash,
    } from 'svelte-hero-icons'
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte';
    

    let newInstance: string = $profileData.defaultInstance ?? DEFAULT_INSTANCE_URL
    let loading = false

    async function changeGuestInstance() {
        loading = true
        try {
            const valid = await validateInstance(newInstance.trim(), true)

            if (!valid) {
                throw new Error('Invalid instance')
            }

            toast({
                content: 'Changed guest instance.',
                type: 'success',
                title: 'Succcess'
            })
        } catch (err) {
            toast({
                content: 'Failed to contact that instance URL. Is it down?',
                type: 'error',
                title: 'Error'
            })

            loading = false
            return
        }

        $profileData.defaultInstance = newInstance
        if ($currentProfile && $currentProfile.id == -1) {
            $instance = newInstance
        }
        loading = false
    }

    let debugging = false
    let debugProfile: Profile | undefined = undefined

    // Redirect to login if there are no profiles and Tesseract is configured to be locked to a specific instance
    if (LINKED_INSTANCE_URL && $profileData.profiles.length == 0) {
        goto(`/login`)
    }
</script>

<svelte:head>
  <title>Accounts</title>
</svelte:head>



<DebugObject object={debugProfile?.id == $profile?.id ? $profile : debugProfile} bind:open={debugging} />

<SubNavbar home back toggleMargins toggleCommunitySidebar />

<MainContentArea>
    <FeedContainer>
        {#if $profileData.profiles.length == 0}
            <div class="p-2 flex items-center justify-center">
                <div class="text-slate-600 dark:text-zinc-400 flex flex-col justify-center items-center py-8 gap-4">
                    <div class="flex flex-col items-center">
                        <Icon src={ArrowLeftOnRectangle} size="48" solid />
                        <h1 class="font-bold text-3xl">No accounts</h1>
                    </div>

                    <Button href="/login" size="lg">
                        <Icon slot="icon" src={ArrowLeftOnRectangle} size="16" mini />
                        Log in
                    </Button>

                    <div class="flex flex-row font-normal gap-2">
                        <TextInput label="Guest instance" on:change={changeGuestInstance} placeholder="Instance URL" bind:value={newInstance} disabled={LINKED_INSTANCE_URL != undefined}/>

                        <Button color="primary" class="h-max self-end" size="lg" {loading} disabled={loading || LINKED_INSTANCE_URL != undefined}>
                            Change
                        </Button>
                    </div>
                </div>
            </div>
        {:else}
            <div class="p-2 flex flex-col gap-4">
                <div class="flex flex-row justify-between">
                    <h1 class="text-2xl font-bold">Accounts</h1>
                </div>

                <EditableList let:action on:action={(id) => { deleteProfile(id.detail) }} >
                    {#each $profileData.profiles as profile, index (profile.id)}
                        <div class="flex flex-row gap-2 items-center py-4" animate:flip={{ duration: 250, easing: expoOut }} >
                            <div class="flex items-center gap-2">
                                <div class="relative group flex-col items-center">
                                    <ProfileAvatar {profile} {index} selected={$currentProfile?.id == profile.id} size={24} />

                                    <div
                                        class="absolute top-0 left-0 w-full h-full opacity-0 grid group-hover:opacity-100 z-20 place-items-center
                                        bg-slate-200 dark:bg-zinc-900 border border-slate-300 dark:border-zinc-800 rounded-full transition-all"
                                    >
                                        <Icon src={PaintBrush} mini size="14" />
                                    </div>
                                    
                                    <input type="color" class="opacity-0 absolute top-0 left-0 h-full w-full rounded-full cursor-pointer z-30" bind:value={profile.color}/>
                                </div>

                                <div class="flex flex-col">
                                    <span class="font-bold">{profile.username}</span>
                                    <span class="text-sm text-slate-600 dark:text-zinc-400">
                                        {profile.instance}
                                    </span>
                                </div>
                            </div>

                            <div class="ml-auto" />

                            <Menu alignment="bottom-right" >
                                <MenuButton slot="button" let:toggleOpen on:click={toggleOpen}>
                                    <Icon src={EllipsisHorizontal} mini size="16" slot="icon" />
                                </MenuButton>
                                

                                <MenuButton on:click={() => moveProfile(profile.id, true)}>
                                    <Icon src={ChevronUp} size="16" mini slot="icon" />
                                    Move Up
                                </MenuButton>
                            
                                <MenuButton on:click={() => moveProfile(profile.id, false)}>
                                    <Icon src={ChevronDown} size="16" mini slot="icon" />
                                    Move Down
                                </MenuButton>
                            
                                <MenuButton disabled={!profile.color} on:click={() => (profile.color = undefined)} >
                                    <Icon src={ArrowUturnLeft} size="16" mini slot="icon" />
                                    Reset Color
                                </MenuButton>
                            
                                {#if $userSettings.debugInfo}
                                    <MenuButton on:click={() => {
                                            debugProfile = profile
                                            debugging = !debugging
                                        }}
                                    >
                                        <Icon src={BugAnt} size="16" mini slot="icon" />
                                        Debug Info
                                    </MenuButton>
                                {/if}
                            </Menu>

                            <Button color={profile.id == $currentProfile?.id ? 'primary' : 'secondary'}
                                on:click={async () => {
                                    if (profile.id == $currentProfile?.id) {
                                        setUserID(-1)
                                        await validateInstance($profileData.defaultInstance ?? DEFAULT_INSTANCE_URL, true)
                                    } else {
                                        setUserID(profile.id)
                                    }
                                }}
                                
                            >
                                {profile.id == $currentProfile?.id ? 'Current' : 'Switch to'}
                            </Button>
                        
                            <Button color="danger" class="!p-2" on:click={() => action(profile.id)} >
                                <Icon slot="icon" src={Trash} size="16" mini />
                            </Button>
                        </div>
                    {/each}
                
                    <!---Guest Instance Selection--->
                    <div class="flex flex-row gap-4 items-center py-4">

                        <div class="flex flex-row font-normal gap-2" class:hidden={LINKED_INSTANCE_URL != undefined}>
                            <TextInput placeholder="Instance URL" label="Guest instance"
                                bind:value={newInstance} on:change={changeGuestInstance}
                                disabled={LINKED_INSTANCE_URL != undefined}
                            />
                            <Button color="primary" {loading} disabled={loading || LINKED_INSTANCE_URL != undefined} class="h-8 self-end">
                                Change
                            </Button>
                        </div>

                        <div class="ml-auto" />
                        
                        <Button color={$currentProfile?.id == -1 ? 'primary' : 'secondary'} on:click={async () => {
                                setUserID(-1)
                                await validateInstance($profileData.defaultInstance ?? DEFAULT_INSTANCE_URL, true)
                            }}
                        >
                            {$currentProfile?.id == -1 ? 'Current' : 'Switch to'}
                        </Button>
                    </div>

                    <!--Add more button--->
                    <div class="flex w-full py-4">
                        <Button href="/login" size="lg" class="w-full">
                            <Icon slot="icon" src={Plus} size="16" mini />
                                Add more
                        </Button>
                    </div>
                </EditableList>
            </div>

        {/if}

    </FeedContainer>

    <div class="h-full" slot="right-panel">
        {#if $site}
            <SiteCard site={$site.site_view} taglines={$site.taglines} admins={$site.admins} version={$site.version} />
        {/if}
    </div>
</MainContentArea>


