<script lang="ts">
    import { goto } from "$app/navigation"
    import { instance } from "$lib/instance"
    
    import Placeholder from "$lib/components/ui/Placeholder.svelte"
    import Button from "$lib/components/input/Button.svelte"
    import Card from "$lib/components/ui/Card.svelte"
    
    import { ArrowLeftOnRectangle, Identification, ServerStack, User } from "svelte-hero-icons";
</script>

<Card class="flex flex-col p-4 mx-auto my-auto">
    <Placeholder icon={User} title="Private Instance" description="This is a private instance, and you must be logged in to see content." />
    <span class="mt-4" />
    
    <div class="flex flex-row gap-4 w-full">
        <Button color="info" class="mx-auto" icon={Identification} size="lg" on:click={() => goto(`/signup/${$instance}`)} >
            Sign Up
        </Button>
        
        <Button color="info" class="mx-auto" icon={ServerStack} size="lg" on:click={() => goto(`/site/${$instance}`)} >
            Site Info
        </Button>

        <Button color="info" class="mx-auto" icon={ArrowLeftOnRectangle} size="lg" on:click={() => goto(`/login/${$instance}`)} >
            Login
        </Button>
    </div>
</Card>