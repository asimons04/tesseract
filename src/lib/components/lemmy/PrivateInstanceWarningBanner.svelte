<script lang="ts">
    import { goto } from "$app/navigation"
    import { instance } from "$lib/instance"
    
    import Placeholder from "../ui/Placeholder.svelte";
    import Button from "../input/Button.svelte";
    
    import { ArrowLeftOnRectangle, Identification, User } from "svelte-hero-icons";
</script>

<div class="flex flex-col mx-auto my-auto">
    <Placeholder icon={User} title="Private Instance" description="This is a private instance, and you must be logged in to see content." />
    <span class="mt-4" />
    
    <div class="flex flex-row gap-4 w-full">
        <Button color="info" class="mx-auto" icon={Identification} size="lg" on:click={() => goto(`/signup/${$instance}`)} >
            Sign Up
        </Button>
        
        <Button color="info" class="mx-auto" icon={ArrowLeftOnRectangle} size="lg" on:click={() => goto(`/login/${$instance}`)} >
            Login
        </Button>
    </div>
</div>