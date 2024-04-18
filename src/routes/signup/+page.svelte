<script lang="ts">
    import Button from '$lib/components/input/Button.svelte'
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte';
    import Logo from '$lib/components/ui/Logo.svelte';
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import SidebarFooter from '$lib/components/ui/SidebarFooter.svelte';
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
    
    import { goto } from '$app/navigation'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { DEFAULT_INSTANCE_URL } from '$lib/instance.js'
    import { validateInstance } from '$lib/lemmy.js'
  
    let instance: string = ''
    let validating: boolean = false
    
    async function validate() {
        if (instance != '') {
            validating = true
            if (await validateInstance(instance.trim())) {
                goto(`/signup/${instance}`)
            } else {
                toast({
                    content: 'Could not contact that instance URL',
                    type: 'error',
                    title: 'Error'
                })
            }
            validating = false
        }
    }
  </script>
  
<svelte:head>
<title>Sign Up | Choose Instance</title>
</svelte:head>
  
  
<SubNavbar home back/>

<MainContentArea>
    <FeedContainer>
        <span class="mx-auto">
            <Logo width={128} />
        </span>

        <h1 class="font-bold text-2xl">Sign Up: Select An Instance</h1>
        <p class="text-sm">
            This installation of Tesseract is configured to allow connections to any Lemmy instance.  Enter the domain of the
            instance you want to sign up with and then click "go".
        </p>

        <form class="flex flex-col lg:flex-row gap-4 lg:items-end" on:submit|preventDefault={async () => { validate() }} >
            <TextInput bind:value={instance} label="Instance URL" required placeholder={DEFAULT_INSTANCE_URL} focus={true}
                on:input={() => {
                    instance = instance.toLowerCase().replaceAll(' ', '')
                }}
            />
            <Button submit color="primary" size="lg" class="h-10" loading={validating} disabled={validating} >
                Go
            </Button>
        </form>
    </FeedContainer>

    <SidebarFooter autohide={false} />
</MainContentArea>
