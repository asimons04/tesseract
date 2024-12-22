# Tesseract
# About
Tesseract is a Sublinks/Lemmy client designed for media-rich feeds and content.  

In addition to the user experience, care has also been taken to enhance the default experience for moderators and instance admins. 

The full list of changes can be found in the [change log](./ChangeLog.md).

### API Compatibility
As of version 1.4.0, the required minimum server version is 0.19.0.  The recommended server version is 0.19.3 as some features require the new API calls that were introduced between 0.19.0 and 0.19.3.

If you want to run Tesseract and are still on an 0.18.x instace, you will need to pull an image from the 1.3.0 series or build from the newest 1.3.x branch.

#### Lemmy
| Tesseract Version | Lemmy API Version | Compatible?   | Notes |
| ---               | ---               | ---           | ---   |
| 1.2.9.x           | 0.18.x            | Yes           | 
| 1.2.9.x           | 0.19.x            | Yes           | Auth and basic user/mod functionality only. Admin functions inaccessible due to detection bug.
| 1.3.0             | 0.18.x            | Yes           | Last version to support 0.18.x
| 1.3.0             | 0.19.x            | Yes           | Auth, instance block, admin functions, and cursor pagination supported.  Admin detection bug fixed.
| 1.3.x             | 0.18.x            | Yes           | 1.3.x is the maintenance series for 1.3.0. It will be limited to bugfixes. No features are likely to be backported from 1.4.0
| 1.4.0             | 0.18.x            | No            | This release drops 0.18.x support.  Can still browse but cannot login or perform any action which requires authentication. Browsing is also limited to just the first page as the old, offset-based pagination is no longer used, and 0.18.x does not support page cursors.
| 1.4.0             | 0.19.0-2          | Yes           | Some features, such as post/comment vote views, will be present but broken as those API calls are not present until 0.19.3
| 1.4.0 - 1.4.x     | 0.19.3+           | Yes           | 0.19.3 is the current development target and recommended minimum server version. I have not tested directly against 0.19.4+, but I do not see any breaking changes in the API which should prevent it from working as expected. That said, none of the 0.19.4+ features have been implemented yet.



#### Sublinks
Will be added once Sublinks is released.

## Feature Highlights
The following features are unique to Tesseract:

### Full Media Support in Feed and Posts 
  - Loops (new in 1.4.21)
  - Spotify
  - YouTube/Invidious/Piped
  - Soundcloud
  - Vimeo
  - Bandcamp
  - Odysee
  - [Song Link](https://odesli.co/)
  - Streamable, Imgur, and any source that provides an embed video URL in the metadata now render inline.  
  - Peertube.  PT support is kind of cool because you can already follow PeerTube channels in Lemmy. With the addition of support for their embeds, this makes following your favorite creator even easier. Upvotes/downvotes to a Peertube post will federate out to thumbs-up/thumbs-down on PT's side, and comments will at least federate to PT.
  
### Community Browser / Enhanced Discovery
  - Browse the communties of other instances and seamlessly load and subscribe to them.  No more of that obnoxious copy/paste, search, wait, search again, subscribe hokey-pokey dance.
  - Post and comment menus let you browse the communities of the originating instance
  - Subscribe to communities on remote instances with one click.  As of 1.3.0, your subscribed state will be reflected when browing remote instances.
  - **Note**:  This only works for Lemmy instances. Kbin, Mastadon, etc are not currently supported for remote community browsing.  


### Image/Media Proxying and Caching
Privacy conscious users have long requested media be proxied through Lemmy.  While Lemmy did finally add that to the server process, I am not at all happy with the way it was implemented.

Additionally, if proxying is enabled, the media is already flowing through Tesseract, it makes sense to optionally cache the proxied media for re-use.

Media proxying is disabled by default both at the server level and in user settings.  In order to enable it, the admin needs to set the environment variable to enable proxying, caching, or both (caching is ignored if proxying is disabled).  Additionally, users would need to go into Settings -> Media and enable use of the proxy/cache.  See the docs, linked below, for instructions on configuring this module.

- Enhance user privacy, reduce bandwidth to other instances, and speed up serving content to your users.
- Can cache any media proxied through it.  Tesseract can act as a caching proxy for your instance as well as cache media originating on other instances as well as outside resources (Giphy, Catbox, Imgur, Yarn, etc).
- Administrators must explicitly enable this module, and users must enable media proxying in their app settings.
- Acts like a CDN in a box. You can even set up regional instances of Tesseract to move the heavy data closer to your users.

Read more: [Media Proxy/Cache Docs](docs/MediaProxy.md)

### Media Bias Fact Check (MBFC) Integration
Misinformation is rampant on the internet, and the Fediverse is, perhaps, more susceptible to it due to its open and distributed nature.  To help combat this, Media Bias Fact Check has been integrated into the UI.

Posts with URLs are checked against the MBFC dataset.  If a record is found, an MBFC badge will be added in the corner. Clicking the badge brings up an abridged report for the publisher containing their credibility, factual reporting history, and bias information; a link to the full report is also provided.  The MBFC results are also integrated into the reporting and moderation tools.

**For Users**:
- Easily see where the news stories in your feed are coming from and what their sources' credibility ratings are.  
- Optionally, automatically hide posts that link to non-credible sources.
- Seamlessly report posts that are from non-credible sources while including a copy of the MBFC results.

**For Moderators/Admins**:  
- Quickly and easily identify and squash posts from disreputable sources.  
- MBFC is integrated into the mod tooling allowing you to populate removal reasons / replies with the results of a MBFC lookup.  
- Perfect for those who are moderating a news or political community.



### Fediseer Integration
See any endorsements, hesitations, and censures given to instances you're interacting with.

### Syntax Highlighting
Code syntax highlighting in code and inline code blocks.

### Distinguished and Sticky Comments
Mods/Admins can distinguish and sticky their own comments (used to be any comment, but _thanks_ Lemmy devs, for breaking that).  Comments that are distinguished will always display at the top of the comment list regardless of sort order and have a green highlight effect.  

### Keyword Filtering
Sick of hearing about a particular topic?  Add keyword filters to keep posts containg those terms from appearing in your feed.  By default, keywords are compared case-insensitively, checked as whole-words, and only checked for presence within the post title, body, or embed description.  

You can add modifiers to fine tune this somewhat:
- `!term`: Prefixing a keyword with an exclamation mark will compare it as case-sensitve.  Useful for filtering acronyms.
- `^term`: A carat tells the filter to check that the post elements start with the provided term.
- `*term`: An asterisk disables whole word checking and will filter a post if the keyword is contained *within* other words.

At this time, modifiers cannot be combined. Perhaps that is something that will be implemented later.

### Alternate Sources Menu
As a media-savvy individual, I'm highly against posting archive links as the canonical links for news posts.  You have no idea where the headline comes from, and it's kind of like "trust me, bro".  It also breaks the MBFC integration, so there's also that.  I believe it is important to always have the source of a headline clearly and easily visible when browsing news/politics communities to help combat the spread of dis/misinformation (among other valid reasons).

That said, I get that some people prefer archived copies for various reasons.

So, I'm flipping the way Lemmy UI does it on its head.

All link posts will have a dropdown menu next to the link which contains alternate links to the post URL from Ghost Archive, 12ft.io, and Archive Today.  

For Youtube, Invidious, and Piped URLs, the dropdown will instead have links for the canonical YouTube video and both Invidious and Piped links.  The Invidious/Piped links will point to your preferred instance of each as defined in the app settings.

*Please* stop commenting 'Paywalled' when someone shares a news post  :)


### Designed for desktop and mobile.
Install as a PWA on either or just use it through the web.

### Multiple Account Support
You can add multiple accounts and easily switch between them.  Accounts can even be on different instances if the administrator chooses not to lock Tesseract to theirs.

### Multiple Hosting Options
If you host your own Tesseract instance, you can use it as a frontend for any Lemmy instance.
Instance admins can host Tesseract on a subdomain or even replace Lemmy-UI with it.  You can even run it on localhost if you want.


### Highly Configurable
- Full Lemmy server config options (up to 0.19.3, anyway).
- Most aspects of the UI can be configured by the end user. Server admins can set default preferences via `env` vars.
- Lots of config options available to the user to fine-tune many aspects of the UI.

### Better Moderation Tools than Lemmy-UI
- Can access moderation actions from the feed _without_ having to click into the post as with Lemmy-UI (at least as of 0.19.3)
- Local instance admins have full moderation control of the instance as with Lemmy-UI
- Modlog support on both desktop and mobile.
- Supercharged modlog with enhanced filtering and quick actions.
- Communities and users have "moglog" links in their action menus.  Those will take you to a pre-filtered modlog for just actions related to them.
- Can simply click "reply with reason" when taking moderation actions to send the user a message with the removal details. Template is user-configurable.

### Multi-Role Developer
Tesseract is maintained by someone who is simultaneously a Lemmy user, administrator, and moderator.  Each of those roles requires different considerations, and Tesseract is being built to accommodate them all.


## Public Hosted Demo Instance
An open, public demo instance is available at [https://tesseract.dubvee.org](https://tesseract.dubvee.org). Feel free to try it out with your favorite Lemmy instance.  

Ideally, you would either host it yourself and point it to your home Lemmy instance or ask your instance admins to offer it as an alternative frontend. The VPS I have the demo running on is potato-class and unable to handle a massive number of users.


## Self-Hosting
Tesseract is designed to be self hosted.  You can even run it from localhost if you want and connect to any Lemmy instance out there. (Note that image uploads can't work from localhost due to the CORS handler, but everything else will)

---

### Deploying the Image

### Tags Used
The base image is `ghcr.io/asimons04/tesseract`.  Tags are used to specify the version.

`latest` tag will always be to the latest release version.  This is generally safe to use unless you're running a non-standard config or an old Lemmy version.

If you want to run a specific version, they are tagged as `v{version}`  where `{version}` corresponds to the [release branch](https://github.com/asimons04/tesseract/releases).


`docker run -p 8080:3000 -d -e PUBLIC_INSTANCE_URL=example.com ghcr.io/asimons04/tesseract:latest`

### Building From the Repo
1. Clone the repo from a release branch
2. `docker build -t tesseract:latest ./`
3. `docker run -p 8080:3000 -d -e PUBLIC_INSTANCE_URL=example.com tesseract:latest`


### Example docker-compose.yml
Below is an example `docker-compose.yml` deployment file.  The only required environment variable is the `PUBLIC_INSTANCE`.  Set any other config variables as desired to override the defaults.

**See Docs for Environment Variables and Explanations**:
- [Environment Variables](./docs/EnvironmentVariables)
- [Environment Options](./docs/EnvironmentOptions)
- [Media Proxying and Caching](./docs/MediaProxy.md)

```yaml
services:
  tesseract:
    image: ghcr.io/asimons04/tesseract:v1.4.21
    environment:
      # The domain of Tesseract's 'default' instance. This is the only required config variable
      - PUBLIC_INSTANCE_URL=lemmy.world
      
      # By default, Tesseract locks itself to the configured instance. To allow users to add accounts from other instances, set this to false.
      - PUBLIC_LOCK_TO_INSTANCE=false
      
      # Feed, feed sort, and comment sort settings
      - PUBLIC_DEFAULT_FEED=All
      - PUBLIC_DEFAULT_FEED_SORT=Scaled
      - PUBLIC_DEFAULT_COMMENT_SORT=Top

      # Default to Dark Theme instead of "System"
      - PUBLIC_THEME=dark

      # Media Proxying
      # Enable the media proxying module and make it available for use.  It is disabled by default.
      - PUBLIC_ENABLE_MEDIA_PROXY=true
      
      # List of domains that should not be proxied (content reasons, because they won't work with the proxy, etc)
      - PUBLIC_MEDIA_PROXY_BLACKLIST=mintboard.org,iili.io,img.shields.io
      - PUBLIC_ENABLE_MEDIA_PROXY_LOCAL=true
      
      # Pre-set the "Use media proxy" setting for all users.  If set to false (default), users will need to go into Settings->Media to enable image proxying.
      - PUBLIC_ENABLE_USER_MEDIA_PROXY=true

      # Media Caching; disabled by default. Enabled and configured here.
      - PUBLIC_ENABLE_MEDIA_CACHE=true
      - PUBLIC_ENABLE_MEDIA_CACHE_LOCAL=true
      - PUBLIC_MEDIA_CACHE_DURATION=4320
      - PUBLIC_MEDIA_CACHE_KEEP_HOT_ITEMS=true
      - PUBLIC_MEDIA_CACHE_MAX_SIZE=500
      - PUBLIC_MEDIA_CACHE_HOUSEKEEP_INTERVAL=5
      - PUBLIC_MEDIA_CACHE_HOUSEKEEP_STARTUP=true
      
      # List of Invidious/Piped domains which should be used for detection. See docs/CustomYoutubeFrontends.md for more in fo.
      - |-
        PUBLIC_CUSTOM_INVIDIOUS=
          i.devol.it,
          piped.adminforge.de
      
      # List of instances that will be pre-populated into the instance selector on the community explorer page. The default instance is included by default and does not need to be listed here.
      - |-
        PUBLIC_FEATURED_INSTANCES=
          lemmy.world,
          mander.xyz,
          programming.dev,
          lemm.ee,
          lemmy.ca,
          lemmy.cafe,
          literature.cafe,
          sh.itjust.works,
          lemmy.blahaj.zone,
          slrpnk.net,
          startrek.website,
          beehaw.org,
          sopuli.xyz,
          lemmy.zip
    
    # Tesseract uses /app/cache inside the container to persist lookups and for the media cache. This will work without a volume, but anything cached will not persist after the container is restarted.
    
    # Note:  The host directory must be owned by UID/GID 1000.
    volumes:
      - ./cache:/app/cache
    
    # Bind to localhost:8081 instead of the container's default port of 3000
    ports:
      - 127.0.0.1:8081:3000
    restart: "always"

```


### Reverse Proxy Configuration
**Running Tesseract Alongside Lemmy-UI**

Use this example config to get you started if you want to run Tesseract alongside Lemmy-UI (e.g. under a subdomain).  Adjust the `server_name`, SSL cert paths, and `proxy_pass` upstreams with values applicable to your deployment.

```nginx
server {
  listen 80;
  server_name tesseract.example.com;
  location / {
    return 301 https://$host$uri?$args;
  }
}

server {
  listen 443            ssl http2;
  server_name           tesseract.example.com;
  ssl_certificate       /etc/letsencrypt/live/tesseract.example.com/fullchain.pem;
  ssl_certificate_key   /etc/letsencrypt/live/tesseract.example.com/privkey.pem;
  ssl_dhparam           /etc/nginx/tls/dhparams.pem;

  ssl_protocols         TLSv1.2 TLSv1.3;
  ssl_session_cache     shared:SSL:10m;
  ssl_session_timeout   15m;

  gzip on;
  gzip_types text/css application/javascript text/javascript image/svg+xml application/json;
  gzip_vary on;


  location / {
    proxy_set_header  Host                  $host;
    proxy_set_header  X-Forwarded-Host      $host;
    proxy_set_header  X-Forwarded-For       $remote_addr;
    proxy_set_header  X-Forwarded-Proto     $scheme;
    proxy_set_header  X-Forwarded-Uri       $request_uri;
    proxy_set_header  X-Forwarded-Ssl       on;

    # Update this to match the IP/port you are mapping from Docker.
    proxy_pass http://127.0.0.1:8080;
  }

}
```
**Running Tesseract In Place Of Lemmy-UI**

If you want to run Tesseract in place of Lemmy-UI, just replace the proxy pass that goes to your current Lemmy-UI with the IP/port of Tesseract.  Be sure to keep the conditionals that separate the ActivityPub ld+json out to the API's container.




## Support
I created a public Matrix support space you can join.  General discussion, flesh out ideas, or ask for support.  [Tesseract Support](https://matrix.to/#/#tesseract:ptznetwork.org)

There is also a Lemmy community where you can get the latest announcements and post questions related to Tesseract.  Find us at https://dubvee.org/c/tesseract


## Donate
I'm not accepting donations at this time.  