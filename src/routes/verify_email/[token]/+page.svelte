<script lang="ts">
    import { goto } from '$app/navigation'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    
    export let data;
    
    if (!data ) {
        toast({
            content: "Something went wrong while verifying your token.",
            type: 'warning'
        });
        goto('/');
    }

    if (!data.success) {
        toast({
            content: "Invalid token",
            type: 'error',
        });
        goto('/');
    }
    
</script>

<title>Email Verification</title>

{#if data.success}
<div class="max-w-xl mx-auto">

    <h1 class="text-3xl font-bold leading-8">Email Verification Successful</h1>
    
    <p class="my-3">
        Your email address has been successfully verified. 
    </p>

    <h2 class="text-2xl font-bold leading-8">What Now?</h2>
        
    <p class="my-3">
        If you did not have to fill out an application to register, you are now good to go and can <a href="/login" title="Login">log in</a>.  
    </p>
    
    <p class="my-3">
        If your instance requires a registration application, you will need to wait to be approved by an admin. The turnaround time for this step can vary from instance 
        to instance.  Once you are approved,  you should receive an approval email.  At that time, you may log in.  
    </p>

    <p class="my-3">
        Due to Lemmy server limitations, rejected applications are not notified.  Many instances have an out-of-band process for notifying applications 
        of rejections, but it is not automated or standardized within Lemmy.
    </p>
</div>

{/if}