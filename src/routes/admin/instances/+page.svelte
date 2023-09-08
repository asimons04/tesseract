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
    import Setting from '$lib/components/ui/Setting.svelte'
    
    import type { EditSite, Instance } from 'lemmy-js-client'
    import type { PageData } from './$types.js'


    export let data: PageData;
    
    const formData: Omit<EditSite, 'auth'> | undefined = data.site
        ? {
            blocked_instances: data.site.federated_instances.blocked.map(
                (i:Instance) => {
                    return i.domain;
                }
            ).sort().toString().replace(/,/g,'\n'),

            allowed_instances: data.site.federated_instances.allowed.map(
                (i:Instance) => {
                    return i.domain;
                }
            ).sort().toString().replace(/,/g,'\n'),

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
            // Reject empty strings
            if (str.trim() == "") { return [] };
            
            // Convert non-empty string into array, convert newlines into commas, remove scheme and slashes
            let arr:Array<String> =  
                str.replace(/\n/g, ',') // Convert newlines into commas
                .replace(/https:/g, '') // Remove https
                .replace(/http:/g, '')  // Remove http
                .replace(/\//g,'')      // Remove all /'s
                .replace(/"/g, '')      // Remove quotation marks
                .replace(/'/g, '')      // Remove single quotes
                .split(',');
            
            // Deduplicate and sort the array of instances
            let uniqArr:Array<String> = [...new Set(arr)].sort();
            
            // Remove empty string elements and trim whitespace from each domain entry
            let trimmedArr:Array<String> = [];
            for (let i=0; i< uniqArr.length; i++) {
                
                let item:String = uniqArr[i].trim();
                
                if (item.length > 0) {
                    trimmedArr.push(item);
                }

            }
            
            trimmedArr.sort();
            
            return trimmedArr;
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
    {#if formData}
    <h1 class="flex flex-row justify-between">
        <span class="font-bold text-2xl">Instance Management</span>
        <Button color="primary" loading={saving} disabled={saving} submit>
            Save
        </Button>
    </h1>

    <Setting>
        <span slot="title">Blocked / Allowed Lists</span>
        <span slot="description">
            Manage which instances yours federates with.  Please note that these lists are mutually exclusive.  Sites on the "Blocked Instances" list will be prohibited from 
            interacting with your local instance.  Conversely, sites in the "Allowed Instances" list will be the ONLY instances yours communicates with, and the block list
            will be ignored.  Domains can be added one per line and/or you can drop in a comma-delimited list.
        </span>

        <div class="flexrow">
            <div class="flexcol mt-4">
                <TextArea 
                    bind:value={formData.blocked_instances} 
                    label="Blocked Instances" 
                    rows=15
                    spellcheck="false"
                />
            </div>
                
            <div class="flexcol mt-4">
                <TextArea 
                    bind:value={formData.allowed_instances} 
                    label="Allowed Instances" 
                    placeholder="If you are operating in 'blocklist' mode, this box should remain empty"
                    rows=15
                    spellcheck="false"
                />
            </div>
        </div>
    </Setting>
    {/if}
</form>


