<script lang="ts">
    import { page } from '$app/stores'

    import Button from "$lib/components/input/Button.svelte"
    import Card from "$lib/components/ui/Card.svelte"
    
    import { Bookmark, Cog6Tooth, Icon, Inbox, NoSymbol, UserCircle } from "svelte-hero-icons";

    
</script>

<!---Profile Sub-Page Buttons--->
<div class="sticky top-[6.9rem] flex flex-row gap-1 px-2 py-1 w-full bg-slate-50/80 dark:bg-zinc-950/80 backdrop-blur-3xl z-20">
    <Card class="flex flex-row w-full">
        <Button color="tertiary" alignment="left" title="Profile" class="hover:bg-slate-200" href="/profile/user">
            <span class="flex flex-col items-center {$page.url.pathname.startsWith('/profile/user') ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                <Icon src={UserCircle} mini size="18" title="Profile" />
                <span class="text-xs">Profile</span>
            </span>            
        </Button>

        <Button color="tertiary" alignment="left" title="Inbox" class="hover:bg-slate-200" href="/profile/inbox">
            <span class="flex flex-col items-center {$page.url.pathname.startsWith('/profile/inbox') ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                <Icon src={Inbox} mini size="18" title="Inbox" />
                <span class="text-xs">Inbox</span>
            </span>            
        </Button>

        <Button color="tertiary" alignment="left" title="Settings" class="hover:bg-slate-200" href="/profile/settings">
            <span class="flex flex-col items-center {$page.url.pathname.startsWith('/profile/settings') ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                <Icon src={Cog6Tooth} mini size="18" title="Settings" />
                <span class="text-xs">Settings</span>
            </span>            
        </Button>

        <Button color="tertiary" alignment="left" title="Blocks" class="hover:bg-slate-200" href="/profile/blocks">
            <span class="flex flex-col items-center {$page.url.pathname.startsWith('/profile/blocks') ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                <Icon src={NoSymbol} mini size="18" title="Blocks" />
                <span class="text-xs">Blocks</span>
            </span>            
        </Button>

        <Button color="tertiary" alignment="left" title="Saved" class="hover:bg-slate-200" href="/profile/saved">
            <span class="flex flex-col items-center {$page.url.pathname.startsWith('/profile/saved') ? 'text-sky-700 dark:text-sky-500 font-bold' : '' }">
                <Icon src={Bookmark} mini size="18" title="Saved" />
                <span class="text-xs">Saved</span>
            </span>            
        </Button>
    </Card>
</div>