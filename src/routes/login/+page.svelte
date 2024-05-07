<script lang="ts">
    

    import Button from '$lib/components/input/Button.svelte'
    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte';
    import Link from '$lib/components/input/Link.svelte';
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
                goto(`/login/${instance}`)
            } else {
                toast({
                    content: 'Could not contact that instance URL',
                    type: 'error',
                    title: 'Error'
                })
            }
            validating = false
        }
        else {
            goto(`/login/${DEFAULT_INSTANCE_URL}`)
        }
    }
  </script>
  
<svelte:head>
    <title>Login | Choose Instance</title>
</svelte:head>
  
  
<SubNavbar home back/>

<MainContentArea>
    <FeedContainer>
        <span class="mx-auto">
            <Logo width={128} />
        </span>

        <h1 class="font-bold text-2xl">Login: Select An Instance</h1>
        <p class="text-sm">
            This installation of Tesseract is configured to allow logging into any Lemmy instance.  Enter the domain of the
            instance you want to log into and then click "go".
        </p>

        <form class="flex flex-col lg:flex-row gap-4 lg:items-end" on:submit|preventDefault={async () => { validate() }} >
            <TextInput bind:value={instance} label="Instance URL" placeholder={DEFAULT_INSTANCE_URL}
                on:input={() => {
                    instance = instance.toLowerCase().replaceAll(' ', '')
                }}
            />
            <Button submit color="primary" size="lg" class="h-10" loading={validating} disabled={validating} >
                Go
            </Button>
        </form>

        <p class="text-sm">
            Don't have an account?  <Link highlight href="/signup">Sign up</Link>
        </p>

    </FeedContainer>

    <SidebarFooter autohide={false} />
</MainContentArea>
