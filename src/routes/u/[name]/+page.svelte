<script lang="ts">
    import type { UserSubmissionFeedController } from '$lib/components/lemmy/feed/helpers'

    import { page } from '$app/stores'
    import { userSettings } from '$lib/settings.js'

    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte'
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import SiteSearch from '$lib/components/ui/subnavbar/SiteSearch.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import UserSubmissionFeed from '$lib/components/lemmy/feed/UserSubmissionFeed.svelte'
    import UserCardSmall from '$lib/components/lemmy/user/UserCardSmall.svelte';
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte';
    import CollapseButton from '$lib/components/ui/CollapseButton.svelte';
    import CommunityLink from '$lib/components/lemmy/community/CommunityLink.svelte';
    import Markdown from '$lib/components/markdown/Markdown.svelte';
    import { ShieldCheck, UserCircle } from 'svelte-hero-icons';
    
    export let data

    let feedController: UserSubmissionFeedController = {} as UserSubmissionFeedController

</script>

<svelte:head>
  <title>Profile</title>
</svelte:head>

<SubNavbar  back quickSettings toggleMargins toggleCommunitySidebar 
    refreshButton refreshPreventDefault
    on:navRefresh={()=> feedController.refresh(true)}
    
    scrollButtons scrollPreventDefault 
    on:navScrollBottom={() => feedController.scrollBottom() } 
    on:navScrollTop={() => feedController.scrollTop() }

>

</SubNavbar>


<MainContentArea>
    <div class="flex w-full" style="height: calc(100vh - 8rem);">
        <FeedContainer>

            <UserSubmissionFeed bind:controller={feedController} bind:person_name={$page.params.name}  actions >
                
                <div class="flex flex-col mx-auto w-full gap-2 max-w-[820px]" slot="banner" let:user>
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

    <SiteCard site={data.site.site_view} version={data.site.version} taglines={data.site.taglines} admins={data.site.admins} slot="right-panel"/>
</MainContentArea>
