<script lang="ts">
    
    import { profile } from '$lib/auth'
    import { userSettings } from '$lib/settings'
    
    import CollapseButton from '$lib/components/ui/CollapseButton.svelte'
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte';
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte';
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import Markdown from '$lib/components/markdown/Markdown.svelte'

    import UserSubmissionFeed from '$lib/components/lemmy/feed/UserSubmissionFeed.svelte'
    import UserCardSmall from '$lib/components/lemmy/user/UserCardSmall.svelte'
    
    
    
    import { HandRaised, ShieldCheck, UserCircle } from 'svelte-hero-icons';
    import ProfileMenuBar from '../ProfileMenuBar.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte';
    import UserCard from '$lib/components/lemmy/user/UserCard.svelte';
    import Placeholder from '$lib/components/ui/Placeholder.svelte';
    import type { UserSubmissionFeedController } from '$lib/components/lemmy/feed/helpers';
    

    //export let data
    let feedController: UserSubmissionFeedController
</script>

<svelte:head>
    <title>Profile {$profile?.user ? `| ${$profile.user.local_user_view.person.display_name ?? $profile.user.local_user_view.person.name}` : ''}</title>
</svelte:head>

<SubNavbar home back quickSettings toggleCommunitySidebar toggleMargins 
    refreshButton refreshPreventDefault
    on:navRefresh={()=> feedController.refresh(true)}    

    scrollButtons scrollPreventDefault 
    on:navScrollBottom={() => feedController.scrollBottom() } 
    on:navScrollTop={() => feedController.scrollTop() }

/>

{#if $profile?.user}
    <MainContentArea>
        
        <ProfileMenuBar />

        <div class="flex w-full" style="height: calc(100vh - 12rem);">
            <FeedContainer>

                <UserSubmissionFeed bind:controller={feedController} bind:person_id={$profile.user.local_user_view.person.id} snapshotValidity={5} actions >
                    
                    <!---Add the User's Profile Card, About Me, and List of Communities they Moderate Above the Feed--->                    
                    <div class="flex 2xl:hidden flex-col mx-auto w-full gap-2 max-w-[820px]" slot="banner" let:user>
                        {#if user}
                            
                            <UserCardSmall person_view={user.person_view} />
                            
                            <!---Person Bio--->
                            {#if user.person_view.person.bio}
                                <CollapseButton icon={UserCircle} title="About Me" expanded={false}>
                                    <Markdown source={user.person_view.person.bio} />

                                    <!---List of Communities Moderated--->
                                    {#if user.moderates?.length > 0}
                                        <span class="text-sm font-bold">Moderates:</span>
                                        {#each user.moderates as community}
                                            <CommunityLink community={community.community} avatar class="p-1"/>
                                        {/each}
                                    {/if}
                                </CollapseButton>
                            {/if}
                        {/if}
                    </div>

                </UserSubmissionFeed>
            </FeedContainer>
        </div>

        <UserCard slot="right-panel" moderates={$profile.user.moderates} person={
                {
                    person: $profile.user.local_user_view.person,
                    is_admin: $profile.user.local_user_view.local_user.admin,
                    counts: $profile.user.local_user_view.counts
                }
            }
        />

    </MainContentArea>
{:else}
    <div class="flex w-full h-full">    
        <Placeholder icon={HandRaised} title="Not Logged In" description="You must be logged in to access this section" class="mx-auto"/>
    </div>
{/if}



