<script lang="ts">
    import type { RegistrationApplicationView } from 'lemmy-js-client'

    import { fade, slide } from 'svelte/transition'
    import { getClient } from '$lib/lemmy.js'
    import { hrColors } from '$lib/ui/colors'
    import { isThrowawayEmail } from '$lib/blacklists'
    import { profile } from '$lib/auth.js'
    import { toast } from '$lib/components/ui/toasts/toasts.js'

    import Badge from '$lib/components/ui/Badge.svelte'
    import Button from '$lib/components/input/Button.svelte'
    import Card from '$lib/components/ui/Card.svelte'
    import CollapseButton from "$lib/components/ui/CollapseButton.svelte"
    import MarkdownEditor from '$lib/components/markdown/MarkdownEditor.svelte'
    import RelativeDate from "$lib/components/util/RelativeDate.svelte"
    import SectionTitle from '$lib/components/ui/SectionTitle.svelte'
    import UserLink from '$lib/components/lemmy/user/UserLink.svelte'

    import { 
        Check, 
        Clipboard as ClipboardIcon, 
        Icon,
        Newspaper,
        Trash,
        XMark 
    } from 'svelte-hero-icons'
    import SettingToggle from '$lib/components/ui/settings/SettingToggle.svelte';

    export let application: RegistrationApplicationView
    
    let applicationState = getApplicationState()
    let applicationDate = new Date(application.registration_application.published)
    
    let action: 'none' | 'approve' | 'deny' = 'none'

    let approving = false
    let denyReason:string
    let createModlogEntry = false
    
    
    
    

    async function review(approve: boolean) {
        if (!$profile?.jwt || !$profile.user) return
        const client = getClient()
        try {
            await client.approveRegistrationApplication({
                approve: approve,
                id: application.registration_application.id,
                deny_reason: !approve ? denyReason : undefined
            })
            
            // If the modlog entry is set OR if approving the account and the user is banned (e.g. from a previous/accidental denial)
            if (createModlogEntry || (approve && application.creator.banned)) {
                await client.banPerson({
                    person_id: application.creator.id,
                    ban: !approve,
                    reason: approve
                        ? `Registration application approved.`
                        : `Registration application denied: ${denyReason ?? 'No reason provided'}`
                })
            }

            toast({
                title: approve ? 'Approved' : 'Denied',
                content: `Successfully ${approve ? 'approved' : 'denied'} ${application.creator.name}'s application.`,
                type: 'success',
            })
            
            // Update the current presentation object
            application.creator_local_user.accepted_application = approve
            application.admin = $profile.user.local_user_view.person
            application.registration_application.deny_reason = denyReason
            
            denyReason = ''
            createModlogEntry = false
        
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
            })
        }
        approving = false
    }
    

    $:  application.admin, application.creator_local_user.accepted_application, applicationState = getApplicationState()

    function getApplicationState() {
        let state = 'pending'
        if (!application.admin) return state
        return application.creator_local_user.accepted_application
            ? 'approved'
            : 'denied'
    }

    
</script>

<div class="flex flex-row w-full" transition:fade>
    
    <!--<CollapseButton icon={ClipboardIcon} bold={!application.admin} truncate={true} class="w-[calc(100%-50px)]" innerClass="!pl-0 ml-[-50px] lg:ml-0" >        -->
    <CollapseButton icon={ClipboardIcon} bold={!application.admin} truncate={true} class="w-full">        
        
        <!---Title Component of Collapse Button--->
        <div class="flex flex-row gap-2 items-start w-full" slot="title" title="{application.creator.name}">
            
            <!---Relative Time the Application Was Submitted--->
            <span class="opacity-70">
                <RelativeDate date={application.registration_application.published} />
            </span>
            
            <!--- Username of the Applicant--->            
            <SectionTitle>
                {application.creator.name}
            </SectionTitle>
            
            <!---Application State Badge--->
            <span class="ml-auto"/>
            {#if applicationState == 'pending'}
                <Badge color="gray" icon={ClipboardIcon} iconSize={16} label='Pending'><span class="hidden sm:flex">Pending</span></Badge>
            {:else if applicationState == 'approved'}
                <Badge color="green" icon={Check} iconSize={16} label='Accepted'><span class="hidden sm:flex">Approved</span></Badge>
            {:else if applicationState == 'denied'}
                <Badge color="red" icon={XMark} iconSize={16} label='Denied'><span class="hidden sm:flex">Denied</span></Badge>
            {/if}
            
        </div>


        <Card class="p-4 flex flex-col gap-2 text-sm">
            
            <!---New User Metadata--->
            <SectionTitle>Application Details</SectionTitle>
            <div class="flex flex-col w-full pl-2 gap-2 lg:flex-row lg:justify-between lg:items-center">
                
                <!---Left Column (datetime, username, app status)--->
                <span class="flex flex-col w-full lg:w-1/2 gap-2">
                    

                    <!---Application Timestamp--->
                    <span class="flex flex-row gap-1 w-full text-xs items-end">
                        <span class="font-bold w-[130px]">Date/Time: </span>
                        
                        <span class="flex flex-row gap-1 w-[calc(100%-130px)]">
                            
                            <time datetime={applicationDate.toLocaleString()}>
                                {applicationDate.toLocaleDateString()} {applicationDate.toLocaleTimeString()}
                            </time>
                            
                            (<RelativeDate date={application.registration_application.published} />)
                        </span>
                    </span>

                    <!--New User Username--->
                    <span class="flex flex-row gap-1 w-full text-xs items-end">
                        <span class="font-bold w-[130px]">Username: </span>
                        
                        <span class="w-[calc(100%-130px)]">
                            <UserLink user={application.creator} avatar={false} showInstance={false} class="-ml-1" />
                        </span>
                    </span>

                    <!---Application State--->
                    <span class="flex flex-row gap-1 text-xs w-full items-end">
                        <span class="font-bold w-[130px]">Status: </span>
                        <span class="capitalize w-[calc(100%-130px)]">
                            {applicationState}
                        </span>
                    </span>



                    
                </span>
                
                <!---Right Column (signup email, email verified, throwaway email indicator)--->
                <span class="flex flex-col w-full lg:w-1/2 gap-2">
                    
                    <!--New User Email-->
                    <span class="flex flex-row gap-1 text-xs w-full items-end">
                        <span class="font-bold w-[130px]">Signup Email: </span>
                        
                        <span class="w-[calc(100%-130px)]">
                            {application.creator_local_user?.email ?? '<None>'}
                        </span>
                    </span>

                    <!--Email Verified-->
                    <span class="flex flex-row gap-1 text-xs w-full items-end">
                        <span class="font-bold w-[130px]">Email Verified: </span>
                        
                        <span class="w-[calc(100%-130px)]">
                            
                            <!---If email was given, indicate whether it has been verified--->
                            {#if application.creator_local_user?.email}
                                { application.creator_local_user.email_verified ? 'Yes' : 'No' }    
                            {:else}
                                N/A
                            {/if}
                        </span>
                    </span>
                    
                    
                    <!---User Used a Throwaway Email Service-->
                    <span class="flex flex-row gap-1 text-xs w-full items-end">
                        <span class="font-bold w-[130px]">Throwaway Email: </span>
                        <span class="w-[calc(100%-130px)]">
                            {#if application.creator_local_user?.email}
                                { isThrowawayEmail(application.creator_local_user.email) ? 'Yes' : 'No' }    
                            {:else}
                                N/A
                            {/if}
                        </span>
                    </span>
                    
                </span>
            </div>

            <hr class="{hrColors}" />
            
            <!---Application Response--->
            <span>
                <SectionTitle>Application Response</SectionTitle>
                <p class="pl-2">{application.registration_application.answer}</p>
            </span>

            <hr class="{hrColors}" />

            
            <div class="flex flex-col w-full pl-2 gap-2 lg:flex-row lg:justify-between lg:items-center">
                
                <!---Left Column: Approving/Denying Admin and Deny Reason (if available)--->
                <span class="flex flex-col w-full h-full lg:w-1/3 gap-2">
                    <!---Admin Who Approved/Denied the Application--->
                    {#if application.admin}
                    <span>
                        <SectionTitle>
                            {application.creator_local_user.accepted_application ? 'Approved' : 'Denied'} by
                        </SectionTitle>
                        <UserLink avatar={false} user={application.admin} showInstance={false} class="pl-2"/>
                    </span>
                    {/if}

                    <!---Deny Reason--->
                    {#if !application.creator_local_user.accepted_application && application.registration_application.deny_reason}
                    <span>    
                        <SectionTitle>Application Denial Reason</SectionTitle>
                        <p class="pl-2">{application.registration_application.deny_reason}</p>
                    </span>
                    {/if}
                </span>


                <!---Right Column: Action Menu--->
                <span class="flex flex-col w-full lg:w-2/3 gap-2">
                    <hr class="lg:hidden {hrColors}" />
                   
                    {#if action == 'none'}
                        <div class="flex flex-col gap-2 w-full" transition:slide>
                            
                            <SectionTitle>Application Actions</SectionTitle>
                            
                            <span class="flex flex-col gap-2 w-full px-8">
                                <Button color="tertiary-border" icon={Check} alignment="left" class="w-full" title="Approve" on:click={() => { action = 'approve' }} >
                                    Approve
                                </Button>

                                <Button color="tertiary-border" icon={XMark} alignment="left" class="w-full" title="Deny" on:click={() => { action = 'deny' }}>
                                    Deny
                                </Button>
                            </span>
                        </div>

                    {/if}

                    <!---Approve Confirmation--->
                    {#if action == 'approve'}
                        <div class="flex flex-col gap-2 w-full" transition:slide>
                            <SectionTitle>Approve Application</SectionTitle>
                            
                            <span class="w-full text-sm p-2">
                                Are you sure you want to approve this registration application?
                            </span>

                            <span class="flex flex-col gap-2 w-full px-8">
                                <!---Return to Main Menu--->
                                <Button color="tertiary-border" icon={XMark} alignment="left" class="w-full" on:click={() => { action = 'none' }} 
                                    title="Return to main menu"    
                                >
                                    Cancel
                                </Button>
                                
                                <!---Approve The Application--->
                                <Button color="tertiary-border" icon={Newspaper} alignment="left" class="w-full" 
                                    title="Approve the application"
                                    loading={approving}
                                    disabled={approving}    
                                    on:click={() => { 
                                        approving = true
                                        review(true).then(() => {
                                            approving = false
                                            action = 'none'
                                        })
                                        
                                    }}
                                >
                                    Approve
                                </Button>

                                <!---Approve and Create an Entry in the Modlog (unban event with preset 'reason')--->
                                <Button color="tertiary-border" icon={Check} alignment="left" class="w-full" 
                                    title="Aprove the application and create a modlog entry along with it"
                                    loading={approving}
                                    disabled={approving}    
                                    on:click={() => { 
                                        approving = true
                                        createModlogEntry = true
                                        
                                        review(true).then(() => {
                                            approving = false
                                            action = 'none'
                                        })
                                        
                                    }}
                                >
                                    Approve + Modlog Entry
                                </Button>
                            </span>
                        </div>
                    {/if}

                    <!---Deny Application Form--->
                    {#if action == 'deny' }
                        <div class="flex flex-col gap-2 w-full" transition:slide>
                            <SectionTitle>Deny Application</SectionTitle>
                            
                            <span class="w-full text-sm p-2">
                                Please provide a reason for denying this application:
                            </span>

                            <SettingToggle bind:value={createModlogEntry} icon={Newspaper} title="Create Modlog Entry"
                                description="When denying, also ban this user from the instance and use the deny reason in the modlog entry."
                            />

                            <MarkdownEditor bind:value={denyReason} images={false} emojis={false} previewButton rows={3}>
                                <!---Pass the action buttons into the markdown editor's action panel--->
                                <div class="flex flex-row items-center gap-2 ml-auto" slot="actions">
                                    <!---Return to Main Menu--->
                                    <Button color="primary" size="lg" icon={XMark} title="Return to Main Menu" on:click={() => action = 'none'}>
                                        Cancel
                                    </Button>

                                    <!---Perform Application Denial--->
                                    <Button color="danger" size="lg" icon={Trash} 
                                        title="Deny the application"
                                        loading={approving}
                                        disabled={approving}
                                        on:click={ () => {
                                            review(false).then(() => {
                                                approving = false
                                                action = 'none'
                                            })
                                        }}
                                    >
                                        Deny
                                    </Button>
                                </div>
                            </MarkdownEditor>
                        </div>
                    {/if}
                </span>
            </div>

        </Card>
    </CollapseButton>
</div>
