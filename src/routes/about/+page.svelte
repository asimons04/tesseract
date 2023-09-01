<script>
  import Link from '$lib/components/input/Link.svelte'
  import Logo from '$lib/components/ui/Logo.svelte'
    import Application from '../admin/applications/Application.svelte';
</script>

<title>Tesseract | About</title>
<div class="max-w-xl mx-auto">
    <div class="flex items-center gap-1 mx-auto w-max">
    <Logo width={48} />
        <span class="text-2xl font-bold">Tesseract</span>
    </div>
    <h1 class="text-3xl font-bold leading-8">About</h1>
    <p class="my-3">
        <strong>Tesseract</strong> is a fork of Xylight's <a href="https://github.com/Xyphyn/photon" target="_blank" title="Photon">Photon</a> 
        and is designed for media-rich feeds and content.
    </p>
    
    <h2 class="text-2xl font-bold leading-8">Why Fork Photon</h2>
    <p class="my-3">
        Photon is great, and I've contributed code and donations to it (and will continue to do so), but the dev and I have very different 
        visions as far as what we want in a Lemmy client.  I'm going for a full, fat experience with all the bells and whistles as far
        as media and presentation are concerned.
    </p>
    
    <h2 class="text-2xl font-bold leading-8">How does Tesseract differ from Photon?</h2>
    <p>Right now, only minimally, but also substantially in terms of qualify of life features that I want in a Lemmy frontend.</p>
    
    <p>
        I fully admit that I'm standing on the shoulders of giants here, but as time progresses, I hope to make this client my own
        with unique features and enhancements tailored to the evolving landscape of the Lemmy ecosystem.
    </p>
    
    <h3 class="text-xl font-bold leading-8">Features Unique to Tesseract</h3>
    <ul class="list-disc pl-4 my-3">
        <li>Inline media players for Youtube and Spotify (more coming eventually)</li>
        <li>More focus on images in feed and post view.</li>
        <li>A more "new" Reddit-like look and feel</li>
        <li>For a full list, please see the <Link href="https://github.com/asimons04/Tesseract/blob/main/ChangeLog.md" newtab={true} title="ChangeLog.md" highlight>change log</Link>.</li>
    </ul>

    <h2 class="text-2xl font-bold leading-8">Roadmap</h2>
    <p>
        There are a few things I have in mind to start with, but only a few are fully fleshed out as far as the implementation goes:
    </p>

    <ul class="list-disc pl-4 my-3">
        <li>Adding a search field to the top navbar for quick searching.</li>
        <li>
            For the rest, see the <Link href="https://github.com/asimons04/Tesseract/blob/main/README.md" newtab={true} title="README.md" highlight>README.md</Link>
            on the GitHub page.
        </li>
    </ul>

    <h2 class="text-2xl font-bold leading-8">Support/Contributions</h2>
    <p>
        If you happened to stumble upon this project and feel like you want to make a contribution,
        please consider donating to the original dev, Xylight, as I do not wish to receive any funding
        for my work on this fork.  
    </p>
    
    <ul class="list-disc pl-4 my-3">
        <li>
            <Link href="https://buymeacoffee.com/xylight" newtab={true} title="Donate to Xylight" highlight>Donate to Xylight</Link>
        </li>
    </ul>
</div>


        
    
    

    
        
  
