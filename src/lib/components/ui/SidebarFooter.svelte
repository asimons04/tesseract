<script lang="ts">
    import Link from '$lib/components/input/Link.svelte'
    import Logo from '$lib/components/ui/Logo.svelte'

    export let autohide:boolean = true
</script>

<div class="{autohide ? 'hidden xl:flex' : 'flex'} w-full justify-between mt-auto">
    <span class="flex flex-row gap-2 text-xs font-normal items-center">
        <Logo width={40} />
        <span class="flex flex-col gap-0.5">
            <span class="font-bold">Tesseract</span>
            <span>v{__VERSION__}</span>
        </span>
    </span>

    <span class="flex flex-row gap-4 items-center">
        <Link href="https://dubvee.org/c/tesseract" newtab={true} title="Lemmy">
            <Logo url="/img/lemmy.svg" rounded={false} width={24}/>
        </Link>
        
        <Link href="https://matrix.to/#/#tesseract:ptznetwork.org" newtab={true} title="Matrix">
            <Logo url="/img/matrix.svg" rounded={false} width={24}/>
        </Link>
        
        <Link href="https://github.com/asimons04/Tesseract/" newtab={true} title="Github">
            <Logo url="/img/github.svg" width={24} />
        </Link>
    </span>

</div>