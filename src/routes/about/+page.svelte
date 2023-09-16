<script>
    import Link from '$lib/components/input/Link.svelte'
    import Logo from '$lib/components/ui/Logo.svelte'
    import Application from '../admin/applications/Application.svelte';
</script>

<title>Tesseract | About</title>
<div class="max-w-3xl mx-auto">
    <div class="flex items-center gap-1 mx-auto w-max">
    <Logo width={48} />
        <span class="text-2xl font-bold">Tesseract</span>
    </div>
    <h1 class="text-3xl font-bold leading-8">About</h1>

    <p class="my-3">
        <strong>Tesseract</strong> is a heavily modified fork of Photon that is designed to support media-rich feeds and content.  It was originally 
        my unnamed custom build of Photon before I decided to make it into an official fork.
    </p>
    
    
    
    <h2 class="text-2xl font-bold leading-8 ">Features</h2>
    <ul class="list-disc pl-4 my-3">
        <li>
            Full media support in feed and posts:
            <ul class="list-disc pl-4">
                <li>YouTube/Invidious/Piped</li>
                <li>Soundcloud</li>
                <li>Bandcamp</li>
                <li>More as I think of them or as requested</li>
            </ul>
            <p class="my-2">Users can enable/disable media embeds from their settings.</p>
        </li>
        <li>Optimized for desktop and mobile. All desktop features are available in mobile.</li>
        <li>A more "new" Reddit-like look and feel</li>
        <li>Code syntax highlighting.</li>
        <li>Full admin tools to manage your Lemmy instance</li>
        <li>Extensive configuration options</li>
        <li>Modlog and Moderation Tools</li>
    </ul>

    <h2 class="text-2xl font-bold leading-8">Get Tesseract</h2>
    <!--
    <div class="flex flex-row my-3">
        <div class="flex flex-row flex-wrap">
            <div class="flex-initial">
                <img src="https://y.yarn.co/1ecfce66-a4ec-48de-8516-a7d52478cc2e_text.gif" alt="Verna from '30 Rock' saying 'Where did you get that?'"/>
            </div>

            <div class="flex-initial">
                <img src="https://y.yarn.co/01fce8e0-fbf0-4109-a649-de693986fc88_text.gif" alt="Verna from '30 Rock' saying 'You made it?'"/>
            </div>
        </div>

        <div class="flex flex-row flex-wrap">
            <div class="flex-initial">
                <img src="https://y.yarn.co/eedeeba5-675e-458e-b354-d09bd8ef6336_text.gif" alt="Verna from '30 Rock' saying 'Holy crap!'"/>
            </div>

            <div class="flex-initial">
                <img src="https://y.yarn.co/24a95368-e9b8-40f1-bc97-4863be5f4358_text.gif" alt="Verna from '30 Rock' asking 'Where do I commission one?'"/>
            </div>
        </div>
    </div>
    -->
    
    <p class="my-3">
        The project has a <Link href="https://github.com/asimons04/Tesseract" newtab={true} title="ChangeLog.md" highlight>GitHub page.</Link>
        with more details, a detailed change log, and instructions for deployment..
    </p>
   

</div>


        
    
    

    
        
  
