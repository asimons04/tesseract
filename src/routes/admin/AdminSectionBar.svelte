<script lang="ts">
    import { page } from '$app/stores'

    import Button from "$lib/components/input/Button.svelte"
    import Card from "$lib/components/ui/Card.svelte"
    
    import { Cog6Tooth, Icon, ClipboardDocumentCheck } from "svelte-hero-icons";

    
</script>

<!---Profile Sub-Page Buttons--->
<div class="sticky top-[6.9rem] flex flex-row gap-1 px-2 py-1 w-full bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-3xl z-20">
    
    <Card class="flex flex-row mx-auto">
        <Button color="tertiary" alignment="left" title="Configuration" class="hover:bg-slate-200" href="/admin/config">
            <span class="flex flex-col items-center {$page.url.pathname.startsWith('/admin/config') ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                <Icon src={Cog6Tooth} mini size="18" title="Configuration" />
                <span class="text-xs">Configuration</span>
            </span>            
        </Button>

        <Button color="tertiary" alignment="left" title="Applications" class="hover:bg-slate-200" href="/admin/applications">
            <span class="flex flex-col items-center {$page.url.pathname.startsWith('/admin/applications') ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                <Icon src={ClipboardDocumentCheck} mini size="18" title="Applications" />
                <span class="text-xs">Applications</span>
            </span>            
        </Button>
    </Card>
</div>