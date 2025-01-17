<script lang="ts">
    export let url: string
    export let extraParams:string = ''
    export let title:string = ''

    // Generate the embed URL for the given post URL
    function generateEmbedURL(postURL:string) {
        let embedURL:string
        let trackID: string
        
        // e.g. https://open.spotify.com/embed/track/2RUs0cO0KpvuZJ0J4hqFFC
        if (postURL.startsWith('https://open.spotify.com/embed')) {
            embedURL = postURL
            return embedURL
        }

        if (postURL.startsWith('https://open.spotify.com/track')) {
            trackID = new URL(postURL).pathname.replace('/track/','');
            embedURL = `https://open.spotify.com/embed/track/${trackID}?theme=0&height=100%`
            return embedURL
        }

        if (postURL.startsWith('https://open.spotify.com/playlist')) {
            trackID = new URL(postURL).pathname.replace('/playlist/','');
            embedURL = `https://open.spotify.com/embed/playlist/${trackID}?theme=0&height=100%`
            return embedURL
        }

        if (postURL.startsWith('https://open.spotify.com/album')) {
            trackID = new URL(postURL).pathname.replace('/album/','');
            embedURL = `https://open.spotify.com/embed/album/${trackID}?theme=0&height=100%`
            return embedURL
        }

        if (postURL.startsWith('https://open.spotify.com/episode')) {
            trackID = new URL(postURL).pathname.replace('/episode/','');
            embedURL = `https://open.spotify.com/embed/episode/${trackID}?theme=0&height=100%`
            return embedURL
        }
    }

    let embedURL = generateEmbedURL(url)

    let height = embedURL && (embedURL.includes('/track') || embedURL.includes('/episode/'))
            ? 'h-[352px]'
            : 'h-[500px]'
</script>

<!---Generate a custom IFrame Since Spotify's Player isn't Responsive--->
<div class="overflow-hidden  relative bg-slate-200 dark:bg-zinc-800 rounded-2xl max-w-full {height}">
    <div class="overflow-hidden  relative bg-slate-200 dark:bg-zinc-800 p-1 rounded-2xl max-w-full">
        <div class="ml-auto mr-auto w-full">
            <div class="flexiframe-container rounded-2xl max-w-screen {height} mx-auto">
                <iframe 
                    class="flexiframe"
                    src="{embedURL}?{extraParams}" 
                    allow="accelerometer; fullscreen; encrypted-media; gyroscope; picture-in-picture" 
                    loading="lazy"
                    allowfullscreen
                    height="500"
                    title="Spotify: {title}"
                >
                </iframe>
            </div>
        </div>
    </div>
</div>


<style>
    .flexiframe-container {
        position: relative;
        overflow: hidden;
        padding-top: 56.25%;
    }

    .flexiframe {
        position: absolute;
        top: 0;
        left: 0;
        height: 491px;
        width: 100%;
        border:0;
    }
</style>