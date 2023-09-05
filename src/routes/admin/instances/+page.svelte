<script lang="ts">
    import { profile } from '$lib/auth.js'
    import { isAdmin } from '../admin'
    import { goto } from '$app/navigation'
    import { toast } from '$lib/components/ui/toasts/toasts.js'
    import { getClient } from '$lib/lemmy.js'

    import Button from '$lib/components/input/Button.svelte'
    import Checkbox from '$lib/components/input/Checkbox.svelte'
    import SelectMenu from '$lib/components/input/SelectMenu.svelte'
    import TextArea from '$lib/components/input/TextArea.svelte'
    import TextInput from '$lib/components/input/TextInput.svelte'
   
    
    import type { EditSite, Instance } from 'lemmy-js-client'
    import type { PageData } from './$types.js'


    export let data: PageData;
    
    const formData: Omit<EditSite, 'auth'> | undefined = data.site
        ? {
            blocked_instances: data.site.federated_instances.blocked.map(
                (i:Instance) => {
                    return i.domain;
                }
            ).sort().toString().replace(/,/g,',\n'),

            allowed_instances: data.site.federated_instances.allowed.map(
                (i:Instance) => {
                    return i.domain;
                }
            ).sort().toString().replace(/,/g,',\n'),

        }
        : undefined
    
    

    async function save() {
        if (!$profile?.jwt) {
            toast({
                content: "Not authorized",
                type: 'error',
            })   
            return
        }

        saving = true
        const { jwt } = $profile
        
        const strToArray = (str:string) => {
            if (str.trim() == "") { return [] };
            return str.replace(/\n/g, '').split(',');
        }
            

        try {
            await getClient().editSite({
                auth: jwt,
                allowed_instances: strToArray(formData.allowed_instances),
                blocked_instances: strToArray(formData.blocked_instances),
            })
            toast({
                content: 'Updated your site.',
                type: 'success',
            })
        } catch (err) {
            toast({
                content: err as any,
                type: 'error',
            })
        }

        saving = false
    }

    let saving = false

</script>

<svelte:head>
  <title>Administration | Instance Management</title>
</svelte:head>

<form class="flex flex-col gap-4" on:submit|preventDefault={save}>
    <h1 class="font-bold text-2xl">Instance Management</h1>
    <p class="text-sm mb-1">
        Manage which instances yours federates with.  Please note that these lists are mutually exclusive.  Sites on the "Blocked Instances" list will be prohibited from 
        interacting with your local instance.  Conversely, sites in the "Allowed Instances" list will be the ONLY instances yours communicates with, and the block list
        will be ignored.
    </p>

    <p class="text-sm mb-1">
        Lists are comma-separated and can have a newline between entries. For now, the commas are required between hostnames, but the newlines are optional.
    </p>


    {#if formData}
        <div class="flex flex-row flex-wrap w-max-full">
            <div class="w-1/2">
                <TextArea 
                    bind:value={formData.blocked_instances} 
                    label="Blocked Instances" 
                    rows=15
                    spellcheck="false"
                />
            </div>
                
            <div class="w-1/2">
                <TextArea 
                    bind:value={formData.allowed_instances} 
                    label="Allowed Instances" 
                    rows=15
                    spellcheck="false"
                />
            </div>
        </div>
        
    {/if}

    <Button color="primary" size="lg" loading={saving} disabled={saving} submit>
        Save
    </Button>
</form>


