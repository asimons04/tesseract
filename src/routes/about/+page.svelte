<script>
    import Link from '$lib/components/input/Link.svelte'
    import Logo from '$lib/components/ui/Logo.svelte'
    import Application from '../admin/applications/Application.svelte';
    
    import {get} from 'svelte/store'
    import {site} from '$lib/lemmy'
    let siteinfo = get(site);

    console.log(siteinfo);

</script>

<title>Tesseract | About</title>
<div class="max-w-3xl mx-auto">
    <div class="flex items-center gap-1 mx-auto w-max">
    <Logo width={48} />
        <span class="text-2xl font-bold">Tesseract</span>
    </div>
    <h1 class="text-3xl font-bold leading-8">About</h1>

    <p class="my-3">
        <strong>Tesseract</strong> is a Lemmy client designed for media-rich content and aims to provide a comparable experience to 
        the alien site.  
    </p>

    <p class="my-3">
        
    </p>    
    
       
    <h2 class="text-2xl font-bold leading-8 ">Features Unique to Tesseract</h2>
    
    <ul class="list-disc pl-4 my-3 text-base">
        <li class="mt-2">
            <p class="font-bold">Full media support in feed and posts</p>
            <ul class="list-disc pl-4">
                <li>YouTube/Invidious/Piped</li>
                <li>Soundcloud</li>
                <li>Bandcamp</li>
                <li>Spotify Tracks, Albums, and Playlists</li>
                <li>Vimeo</li>
                <li>Odysee</li>
                <li>Streamable, Imgur, and any source that provides an embed video URL in the metadata</li>
            </ul>
        </li>

        <li class="mt-2">
            <p class="font-bold">Enhanced Community Discovery</p>
            <ul class="list-disc pl-4">
                <li>Browse the communties of other instances and seamlessly load and subscribe to them.  
                    No more of that obnoxious copy/paste, search, wait, search again, subscribe hokey-pokey dance.
                </li>

                <li>Post and comment menus let you browse the communities of the originating instance</li>
            </ul>
        </li>

        <li class="mt-2">
            <p class="font-bold">Image/Media Proxying and Caching</p>
            <p>
                Privacy conscious users have long requested media be proxied through Lemmy.  
                While I can't add that to the API, I can add it to the UI.  Additionally, since the 
                media is already flowing through Tesseract, it made sense to optionally cache the 
                proxied media for re-use.
            </p>
            <ul class="list-disc pl-4">
                <li>Enhance user privacy, reduce bandwidth to other instances, and speed up serving content to your users.</li>
                <li>Can cache any media proxied through it.  Tesseract can act as a caching proxy for your instance as well as cache media originating on other instances as well as outside resources (Giphy, Catbox, Imgur, Yarn, etc).</li>
                <li>Administrators must explicitly enable this module, and users must enable media proxying in their app settings.</li>
                <li>Acts like a CDN in a box. You can even set up regional instances of Tesseract to move the heavy data closer to your users.</li>
            </ul>
        </li>

        <li class="mt-2">
            <p class="font-bold">Fediseer Integration</p>
            <ul class="list-disc pl-4">
                <li>See endorsements, hesitations, and censures given to the instances you're interacting with.</li>
                <li>Optionall show fediseer endorsement badges on posts</li>
            </ul>
            
        </li>

        <li class="mt-2">
            <p class="font-bold">Media Bias Fact Check (MBFC) Integration</p>
            <p>
                Posts with URLs can have a MBFC badge in the corner which will lookup the publisher in the MBFC database and return their bias and credibility information.  
                The MBFC results are also integrated into the reporting and moderation tools.
            </p>
            <p class="font-bold text-sm mt-2">For Users</p>
            <ul class="list-disc pl-4 text-sm">
                <li>Easily see where the news stories in your feed are coming from and what their sources' credibility ratings are.</li>
                <li>Optionally, automatically hide posts that link to non-credible sources.</li>
                <li>Seamlessly report posts that are from non-credible sources while including a copy of the MBFC results.</li>
            </ul>

            <p class="font-bold text-sm mt-2">For Admins/Mods</p>
            <ul class="list-disc pl-4 text-sm">
                <li>Quickly and easily identify and squash posts from disreputable sources.</li>
                <li>MBFC is integrated into the mod tooling allowing you to populate removal reasons / replies with the results of a MBFC lookup.</li>
                <li>Perfect for those who are moderating a news or political community.</li>
            </ul>
        </li>

        <li class="mt-2">
            <p class="font-bold">Distinguished and Sticky Comments</p>
            <p>
                Mods/Admins can distinguish and sticky comments.  Comments that are distinguished will always display at the top of the comment list 
                regardless of sort order.
            </p>

            <p>
                Note that the way distinguished comments are handled only applies to Tesseract.  The comments will be marked as distinguished at the API 
                level, but it's up to individual clients/UIs to handle how to render comments with the distinguished flag set.
            </p>
        </li>



    </ul>
    
    <h2 class="text-2xl font-bold leading-8 ">Additional Features</h2>
    <ul class="list-disc pl-4 my-3">
        <li>Multiple account and multiple instance support.</li>
        <li>Optimized for desktop and mobile. All desktop features are available in mobile.</li>
        <li>A more "new" Reddit-like look and feel</li>
        <li>Code syntax highlighting.</li>
        <li>Full admin tools to manage your Lemmy instance</li>
        <li>Extensive configuration options</li>
        <li>Modlog and Moderation Tools</li>
    </ul>

    <h2 class="text-2xl font-bold leading-8">Get Tesseract</h2>
    
    
    <p class="my-3">
        The project has a <Link href="https://github.com/asimons04/Tesseract" newtab={true} title="ChangeLog.md" highlight>GitHub page.</Link>
        with more details, a detailed change log, and documentation.
    </p>
   

</div>


        
    
    

    
        
  
