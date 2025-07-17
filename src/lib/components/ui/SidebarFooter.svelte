<script lang="ts">
    import { inDarkTheme, theme } from '$lib/ui/colors.js'
    
    import Link from '$lib/components/input/Link.svelte'
    import Logo from '$lib/components/ui/Logo.svelte'
    import { Icon, Moon, Sun } from 'svelte-hero-icons';

    export let autohide:boolean = true
    
    let darkTheme = inDarkTheme()
    $: $theme, darkTheme=inDarkTheme()
</script>

<div class="{autohide ? 'hidden xl:flex' : 'flex'} w-full justify-between mt-auto">
    <span class="flex flex-row gap-2 text-xs font-normal items-center">
        <Logo width={40} />
        <span class="flex flex-col gap-0">
            <span class="font-bold">Tesseract</span>
            <!-- svelte-ignore missing-declaration -->
            <span>v{__VERSION__} ({String(__CODENAME__)})</span>
        </span>
    </span>

    <span class="flex flex-row gap-4 items-center">
        <button title="Theme"
            on:click={ (
                //@ts-ignore
                e
            ) => {
                e.stopPropagation();
                $theme = inDarkTheme() ? 'light' : 'dark'
            }}
        >
            <Icon mini width={24} src={darkTheme ? Sun : Moon} />
        </button>
               
        <Link href="https://github.com/asimons04/Tesseract/" newtab={true} title="Github">
            <Logo url="/img/github.svg" width={24} />
        </Link>
    </span>

</div>