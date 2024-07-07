<script>
    import { site } from '$lib/lemmy'

    import FeedContainer from '$lib/components/ui/containers/FeedContainer.svelte';
    import Logo from '$lib/components/ui/Logo.svelte'
    import MainContentArea from '$lib/components/ui/containers/MainContentArea.svelte';
    import Markdown from '$lib/components/markdown/Markdown.svelte'
    import SiteCard from '$lib/components/lemmy/SiteCard.svelte'
    import SubNavbar from '$lib/components/ui/subnavbar/SubNavbar.svelte';

    const content = `
# About

Tesseract ${__VERSION__}, ${__CODENAME__} Class

---

## Overview    

**Tesseract** is a Lemmy client designed for media-rich content and aims to provide a comparable experience to 
the alien site.  The reason it exists is because I wanted to fix a lot of things about Lemmy that annoyed me.  Of all the third
party frontends out there, Photon was the closest but wasn't quite what I wanted.  So, Tesseract was forked and took on a new
life of its own.

I think Photon has adopted some of these, at least YouTube, but I'm unsure if any of the others are supported.  As far as I know, most of these
are still unique to Tesseract.

### Full Media Support in Feed and Posts
- YouTube/Invidious/Piped
- Soundcloud
- Bandcamp
- Spotify Tracks, Albums, and Playlists
- Vimeo
- Odysee
- Streamable, Imgur, and any source that provides an embed video URL in the metadata

### Enhanced Community Discovery
Browse the communties of other instances and seamlessly load and subscribe to them.  No more of that obnoxious copy/paste, search, wait, search again, 
subscribe hokey-pokey dance.  Let Tesseract take care of all that for you.

Post and comment menus let you browse the communities of the originating instance, and the \`/instances\` page also provides links to browse the communities
there.

### Image/Media Proxying and Caching
Privacy conscious users have long requested media be proxied through Lemmy.  The Lemmy devs finally implemented that in 0.19.4, but they did it in a very stupid
way (shocked Pikachu).  Tesseract has has this capability for much longer, and it's implemented in a way that doesn't impact other instances.

If proxying is enabled, the media is already flowing through Tesseract, so it made sense to optionally cache the 
proxied media for re-use.

- Enhance user privacy, reduce bandwidth to other instances, and speed up serving content to your users.
- Can cache any media proxied through it.  Tesseract can act as a caching proxy for your instance as well as cache media originating on other instances as well as outside resources (Giphy, Catbox, Imgur, Yarn, etc).
- Administrators must explicitly enable this module, and users must enable media proxying in their app settings.
- Acts like a CDN in a box. You can even set up regional instances of Tesseract to move the heavy data closer to your users.
- Doesn't federate out the stupid proxied URLs like Lemmy does.

### Fediseer Integration
See endorsements, hesitations, and censures given to the instances you're interacting with.  Currently read-only, but eventually some limited ability
to create endorsements, censures, and hesitations will be added.

### Media Bias Fact Check (MBFC) Integration
Posts with URLs can have a MBFC badge in the corner which will lookup the publisher in the MBFC database and return their bias and credibility information.  
The MBFC results are also integrated into the reporting and moderation tools.

- Easily see where the news stories in your feed are coming from and what their sources' credibility ratings are.
- Optionally, automatically hide posts that link to non-credible sources.
- Seamlessly report posts that are from non-credible sources while including a copy of the MBFC results.
- Quickly and easily identify and squash posts from disreputable sources.
- MBFC is integrated into the mod tooling allowing you to populate removal reasons / replies with the results of a MBFC lookup.
- Perfect for those who are moderating a news or political community.

### Additional Features
- Multiple account and multiple instance support.
- Optimized for desktop and mobile. All desktop features are available in mobile.
- A more "new" Reddit-like look and feel
- Code syntax highlighting.
- Full admin tools to manage your Lemmy instance
- Extensive configuration options
- Enhanced Modlog and Moderation Tools beyond what Lemmy-UI offerse

--- 

## Credits and Acknowledgements
- [Xylight](https://github.com/Xyphyn/photon) for creating Photon.  Tesseract began life as a fork of a very early version of that and likely would not exist (or would exist very differently)
    without that base.
- [Media Bias Fact Check](https://mediabiasfactcheck.com) is an invaluable tool when, if you're like me,
    using Lemmy as a news aggregator.  Through their efforts, Tesseract is able to show credibility badges on news posts to help combat disinformation. I cannot
    thank them enough for their work.
- All of the users on Github and in the Lemmy Admin chat who suggested and tested features.

## Donations
I built Tesseract in my spare time as a hobby, learning excercise for SvelteKit, and to address my own personal annoyances with Lemmy and other
Lemmy UIs.  That said, I do not feel the need to accept donations for its development.

However, if you really want to donate, please consider donating to one of the following:

- [Xylight](https://www.buymeacoffee.com/xylight): They are the author of Photon from which Tesseract was forked who also did a lot of the heavy 
lifting for much of the core.  While I've replaced a lot of it, none of my work would have been possible without theirs.
- [Media Bias Fact Check](https://mediabiasfactcheck.com/support-media-bias-fact-check/): 
Tesseract embeds a subset of a dump of their dataset in itself in order to provide the bias and credibility badges and reports. This dump comes from their browser extension.  Without this,
it would be impossible to have this feature.  MBFC is 100% independent and relies on memberships and donations to do their work. Please consider donating to them so they can continue
the amazing work they do.

---

# Get Tesseract
The project has a [Github page](https://github.com/asimons04/Tesseract) with more details, a detailed change log, and documentation.
`.trim()

</script>

<svelte:head>
    <title>Tesseract | About</title>
</svelte:head>

<SubNavbar home back toggleMargins toggleCommunitySidebar scrollButtons/>

<MainContentArea>
    <FeedContainer>
        <div class="flex items-center gap-1 mx-auto w-max">
            <Logo width={48} />
            <span class="flex gap-4 items-center font-bold text-2xl lg:text-3xl text-center mx-auto">Tesseract</span>
        </div>

        <span class="my-2" />
        <Markdown source={content} />
        
    </FeedContainer>
    
    <div class="h-full" slot="right-panel">
        {#if $site}
            <SiteCard site={$site.site_view} taglines={$site.taglines} admins={$site.admins} version={$site.version}/>
        {/if}
    </div>
</MainContentArea>


        
    
    

    
        
  
