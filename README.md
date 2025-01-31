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
| 1.4.0 - 1.4.20     | 0.19.3+           | Yes           | 0.19.3 is the current development target and recommended minimum server version. I have not tested directly against 0.19.4+, but I do not see any breaking changes in the API which should prevent it from working as expected. That said, none of the 0.19.4+ features have been implemented yet.
| 1.4.21+            | 0.19.3+           | Yes           | 0.19.3 is still the current development target.  Some newer API functions are incorporated.

As of 1.4.21, the infrastructure exists so that newer API functions can be added while maintaining compatibility with earlier releases (back to 0.19.3 which is the lowest-supported version).  

Currently, the following > 0.19.3 API features are supported:
- Providing and utilizing alt text for image and direct video posts (0.19.5+)
  - APIs < 0.19.5 will continue to use the post title in place of alt text on images and 0.19.5+ will fall back to the post name if no alt text is provided.
- Hiding posts (0.19.4+)
- Toggling "Show hidden posts" in the feed (0.19.4+)
- Toggiing "Show read posts" in the feed (0.19.6+)
- Togging "Show NSFW posts" in the feed (0.19.6+)

The options will be ignored and UI elements hidden if the currently-connected instance does not support the features.



#### Sublinks
Will be added once Sublinks is released.

## Feature Highlights


### Full Media Support in Feed and Posts 
  - Tidal Tracks/Albums/Playlists (new in 1.4.30)
  - Loops (new in 1.4.21)
  - Peertube
  - Spotify
  - YouTube/Invidious/Piped
  - Soundcloud
  - Vimeo
  - Bandcamp
  - Odysee
  - [Song Link](https://odesli.co/)
  - Streamable, Imgur, and any source that provides an embed video URL in the metadata now render inline.
  
  
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

## Deploying the Image

### Cache Directory (Optional but Recommended)
Tesseract caches certain things to avoid redundant network fetches when possible.  Without a cache mount to the host, this caching will still work by writing to the ephemeral writable layer in the image, but it will not persist after the container is restarted.

Currently, two types of data are cached:
1) [Proxied media](./docs/MediaProxy.md) (proxying and caching must both be enabled before this will be used)
1) Caching lookups for Loops (it maintains a key/value index of "Loop URL" -> "Loop Embed Video URL")

If you want/expect those caches to persist after a container restart, you will need to mount a volume to `/app/cache` inside the container.

You can do this with as either a bind mount or a Docker volume.  If you opt for a bind mount, the folder will need to be owned by UID:GID `1000:1000` 

#### Using a Bind Mount for the Cache Mount
Assumes the host folder `cache` is in the same deploy directory as the `docker-compose.yml` file.

**Shell Commands**

```bash
user@host:/opt/tesseract$ mkdir cache
user@host:/opt/tesseract$ chown 1000:1000 cache

```

**Docker Compose Snippet**

```yaml
services:
  tesseract:
    ...
    volumes:
      - ./cache:/app/cache
```

#### Using a Docker Volume for Cache Mount
While I prefer bind mounts, Docker volumes are easier since you don't have to worry about UID/GID ownership and permissions.  They also make the storage configuration more portable.

This assumes a basic Docker volume managed by Compose.  If you want to do more advanced storage drivers/options, that is outside the scope of this document.  

**See also**:
- [Docker-Compose Volumes](https://docs.docker.com/reference/compose-file/volumes/#driver)
- [Docker Volume Reference](https://docs.docker.com/engine/storage/volumes/)

**Docker Compose Snippet**

```yaml
volumes:
  tesseract-cache:
services:
  tesseract:
    ...
    volumes:
      - tesseract-cache:/app/cache
```



### Tags Used
The base image is `ghcr.io/asimons04/tesseract`.  Tags are used to specify the version.

`latest` tag will always be to the latest release version.  This is generally safe to use unless you're running a non-standard config or an old Lemmy version.

If you want to run a specific version, they are tagged as `v{version}`  where `{version}` corresponds to the [release branch](https://github.com/asimons04/tesseract/releases).

Assuming you're running Tesseract at `/opt/tesseract/`
1) `cd /opt/tesseract`
1) `mkdir cache`
1) `chown 1000:1000 cache`
1) `docker run -p 8080:3000 -d -e PUBLIC_INSTANCE_URL=example.com -v $(pwd)/cache:/app/cache ghcr.io/asimons04/tesseract:latest`

### Building From the Repo
1. Clone the repo from a release branch
2. `docker build -t tesseract:latest ./`
3. `docker run -p 8080:3000 -d -e PUBLIC_INSTANCE_URL=example.com tesseract:latest`


### Example docker-compose.yml
In the docs folder is an example `docker-compose.yml` deployment file.  The only required environment variable is the `PUBLIC_INSTANCE`.  Set any other config variables as desired to override the defaults.

**See Docs for Environment Variables and Explanations**:
- [docker-compose.yml](./docs/docker-compose.yml)
- [Environment Variables](./docs/EnvironmentVariables)
- [Environment Options](./docs/EnvironmentOptions)
- [Media Proxying and Caching](./docs/MediaProxy.md)




### Reverse Proxy Configuration
**Running Tesseract Alongside Lemmy-UI**

Use this example config to get you started if you want to run Tesseract alongside Lemmy-UI (e.g. under a subdomain).  Adjust the `server_name`, SSL cert paths, and `proxy_pass` upstreams with values applicable to your deployment.

```nginx

# Nginx proxy for Tesseract's Proxy Cache
# Adjust max_size from 200m as needed

proxy_cache_path	/etc/nginx/conf.d/proxy_cache levels=1:2 keys_zone=imgcache:10m max_size=200m inactive=720h;
proxy_temp_path		/etc/nginx/conf.d/proxy_cache/tmp;
proxy_cache_key 	"$scheme$request_method$host$request_uri";


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


  # Note: You only need this location if you are utilizing the Tesseract image proxy and cache.  Even then, you don't 
  # strictly need this additional proxy layer, but it will improve performance significantly since Nginx is multi-threaded
  # while NodeJS is not.

  location /image_proxy {
    ## You would probably want to put these proxy options and default headers into an
    ## include file since they're mostly redundant on the two locations. Shown here in 
    ## both for clarity.

    proxy_http_version              1.1;
    send_timeout                    5m;
    proxy_read_timeout              360;
    proxy_send_timeout              360;
    proxy_connect_timeout           360;
    proxy_max_temp_file_size        0;

    # Set headers to send to backend server
    proxy_set_header  Host                  $host;
    proxy_set_header  X-Forwarded-Host      $host;
    proxy_set_header  X-Forwarded-For       $remote_addr;
    proxy_set_header  X-Forwarded-Proto     $scheme;
    proxy_set_header  X-Forwarded-Uri       $request_uri;
    proxy_set_header  X-Forwarded-Ssl       on;


    proxy_pass http://127.0.0.1:8080/image_proxy;
 
    proxy_cache imgcache;   
    ## Adjust proxy validity time from 720 hours accordingly
    proxy_cache_valid 200 720h;
    add_header      X-Proxy-Cache                   $upstream_cache_status;
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