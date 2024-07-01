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
| 1.4.0             | 0.18.x            | No            | This release drops 0.18.x support.  Can still browse but cannot login or perform any action which requires authentication
| 1.4.0             | 0.19.0-2          | Yes           | Some features, such as post/comment vote views, will be present but broken as those API calls are not present until 0.19.3
| 1.4.0             | 0.19.3            | Yes           | 0.19.3 is the current development target and recommended minimum server version.

#### Sublinks
Will be added once Sublinks is released.

## Feature Highlights
The following features are unique to Tesseract:

### Full Media Support in Feed and Posts 
  - Spotify
  - YouTube/Invidious/Piped
  - Soundcloud
  - Vimeo
  - Bandcamp
  - Odysee
  - [Song Link](https://odesli.co/)
  - Streamable, Imgur, and any source that provides an embed video URL in the metadata now render inline.  
  - Peertube Embeds (new as of 1.3.0).  PT support is kind of cool because you can already follow PeerTube channels in Lemmy. With the addition of support for their embeds, this makes following your favorite creator even easier. Upvotes/downvotes to a Peertube post will federate out to thumbs-up/thumbs-down on PT's side.
  - Any embeddable content that provides a video link in the `embed_video` metadata.

### Community Browser / Enhanced Discovery
  - Browse the communties of other instances and seamlessly load and subscribe to them.  No more of that obnoxious copy/paste, search, wait, search again, subscribe hokey-pokey dance.
  - Post and comment menus let you browse the communities of the originating instance
  - Subscribe to communities on remote instances with one click.  As of 1.3.0, your subscribed state will be reflected when browing remote instances.
  - Note:  This only works for Lemmy instances. Kbin, Mastadon, etc are not currently supported for remote community browsing.  


### Image/Media Proxying and Caching
Privacy conscious users have long requested media be proxied through Lemmy.  While I can't add that to the API, I can add it to the UI.  Additionally, since the media is already flowing through Tesseract, it made sense to optionally cache the proxied media for re-use.

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
Mods/Admins can distinguish and sticky their own comments.  Comments that are distinguished will always display at the top of the comment list regardless of sort order.  

### Keyword Filtering
Sick of hearing about a particular topic?  Add keyword filters to keep posts containg those terms from appearing in your feed.  By default, keywords are compared case-insensitively, checked as whole-words, and only checked for presence within the post title, body, or embed description.  

You can add modifiers to fine tune this somewhat:
- `!term`: Prefixing a keyword with an exclamation mark will compare it as case-sensitve.  Useful for filtering acronyms.
- `^term`: A carat tells the filter to check that the post elements start with the provided term.
- `*term`: An asterisk disabled whole word checking will filter a post if the keyword is contained within other words.

At this time, modifiers cannot be combined. Perhaps that is something that will be implemented later.

### Designed for desktop and mobile.
Install as a PWA on either or just use it through the web.

### Multiple Account Support
You can add multiple accounts and easily switch between them.  Accounts can even be on different instances if the administrator chooses not to lock Tesseract to theirs.

### Multiple Hosting Options
If you host your own Tesseract instance, you can use it as a frontend for any Lemmy instance.
Instance admins can host Tesseract on a subdomain or even replace Lemmy-UI with it.  You can even run it on localhost if you want, though image uploads will not work due to CORS.


### Highly Configurable
- User-configurable image/video sizes in feed and posts
- Full Lemmy server config options.
- Most aspects of the UI can be configured by the end user. Server admins can set default preferences via `env` vars.

### Better Moderation Tools than Lemmy-UI
- Can access moderation actions from the feed _without_ having to click into the post as with Lemmy-UI
- Local instance admins have full moderation control of the instance as with Lemmy-UI
- Modlog support on both desktop and mobile.
- Supercharged modlog with enhanced filtering and quick actions.
- Communities and users have "moglog" links in their action menus.  Those will take you to a pre-filtered modlog for just actions related to them.
- Can simply click "reply with reason" when taking moderation actions to send the user a message with the removal details. Template is user-configurable.

### Multi-Role Developer
Tesseract is maintained by someone who is simultaneously a Lemmy user, administrator, and moderator.  Each of those roles requires different considerations, and Tesseract is being built to accommodate them all.



## Supported Media
For Youtube (and Invidious/Piped), Spotify, Bandcamp, and Soundcloud, you don't need to use any special embed links; just the regular URL from your browser.  Tesseract will take care of generating the embed URLs based on your preferences.

- Odysee videos

- Direct video links (e.g .webm, mp4, etc) will embed a player in the feed/post. Right now, these are not toggleable as most do not have thumbnails and the bare links are ugly AF; they're treated basically like fancy image posts.  However, they only downoad enough to show the first few frames, which is acceptable from a performance/bandwidth perspective.

- YouTube and all known 
[Invidious](https://docs.invidious.io/instances/#list-of-public-invidious-instances-sorted-from-oldest-to-newest) and 
[Piped](https://github.com/TeamPiped/Piped/wiki/Instances) 
links are detected as "Youtube-like" embeddable videos.  These will embed using the user's preferred YouTube frontend which can be configured in settings. Currently, YouTube and Invidious are supported frontends, and the Invidious instance used can be chosen from your settings.  You can even define custom Invididious and Piped instances.

- Vimeo videos are supported with their native URLs (e.g. vimeo.com/{videoID})

- Soundcloud track links will be detected and a player embedded. Playlists don't seem to be supported on Soundcloud's end, so unfortunately, only track links can be embedded.

- Spotify tracks, albums, and playlists will embed a player right in the feed or post.
  - (Optional) To enable full track playback rather than previews, you will need to either allow 3rd party cookies for the Tesseract domain or whitelist cookies for `open.spotify.com`. This is to allow the Spotify iframe to detect your login.
    - On mobile browsers, Spotify will only allow track previews regardless of login state so don't bother allowing 3rd party cookies.
    - With the push to end 3rd party cookies (which is ultimately a good thing since advertisers can't be trusted), playing full tracks may no longer be possible due to not being able to associate the iframe player with your logged-in account.



- Bandcamp tracks and albums.  

- Peertube embeds

- TikTok is not currently supported. I don't have TikTok, and no one has asked for it, so I'm content not supporting that unless there's demand and someone is able to provide me some sample links (I think TT does have an embed API, so at least limited support possible).






## Public Hosted Demo Instance
An open, public demo instance is available at [https://tesseract.dubvee.org](https://tesseract.dubvee.org). Feel free to try it out with your favorite Lemmy instance.  

Ideally, you would either host it yourself and point it to your home Lemmy instance or ask your instance admins to offer it as an alternative frontend. The VPS I have the demo running on is potato-class and unable to handle a massive number of users.


## Self-Hosting
Tesseract is designed to be self hosted.  You can even run it from localhost if you want and connect to any Lemmy instance out there. (Note that image uploads can't work from localhost due to the CORS handler, but everything else will)


### Deploying the Image
Replace `example.com` in the line below with the base URL of your instance.  This example exposes the container's port on `8080` but you can/should change that to whatever port you need or have free on your host.  

Additional environment variables for configuring Tesseract can be found further down in the README.

### Tags Used
The base image is `ghcr.io/asimons04/tesseract`.  Tags are used to specify the version.

`latest` tag will always be to the latest release version.  This is generally safe to use unless you're running a non-standard config or an old Lemmy version.

If you want to run a specific version, they are tagged as `v{version}`  where `{version}` corresponds to the [release branch](https://github.com/asimons04/tesseract/releases).






`docker run -p 8080:3000 -d -e PUBLIC_INSTANCE_URL=example.com ghcr.io/asimons04/tesseract:latest`

### Building From the Repo
1. Clone the repo from a release branch
2. `docker build -t tesseract:latest ./`
3. `docker run -p 8080:3000 -d -e PUBLIC_INSTANCE_URL=example.com tesseract:latest`


### Reverse Proxy Configuration
**Running Tesseract Alongside Lemmy-UI**

Use this example config to get you started if you want to run Tesseract alongside Lemmy-UI (e.g. under a subdomain).  Adjust the `server_name`, SSL cert paths, and `proxy_pass` upstreams with values applicable to your deployment.

```
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


## Configuring
The following environment variables can be set to override the default settings.  Note that all environment variables must be prefixed with `PUBLIC_` to be picked up by SvelteKit.


| Variable                        | Values              | Default Value                          |
| ------------------------------- | ------------------- | -------------------------------------- |
| PUBLIC_INSTANCE_URL             | URL                 | `lemmy.world`                          |
| PUBLIC_LOCK_TO_INSTANCE         | `bool`              | `true` if `PUBLIC_INSTANCE_URL` is set |
| PUBLIC_THEME                    | system\|dark\|light | system                                 |
| PUBLIC_MARK_READ_POSTS          | `bool`              | true                                   |
| PUBLIC_SHOW_COMPACT_POSTS       | `bool`              | false                                  |
| PUBLIC_DEFAULT_FEED_SORT        | `SortType`          | Active                                 |
| PUBLIC_DEFAULT_FEED             | `ListingType`       | Local                                  |
| PUBLIC_DEFAULT_COMMENT_SORT     | `CommentSortType`   | Hot                                    |
| PUBLIC_HIDE_DELETED             | `bool`              | true                                   |
| PUBLIC_HIDE_REMOVED             | `bool`              | false                                  |
| PUBLIC_DISPLAY_NAMES            | `bool`              | true                                   |
| PUBLIC_NSFW_BLUR                | `bool`              | true                                   |
| PUBLIC_OPEN_LINKS_NEW_TAB       | `bool`              | false                                  |
| PUBLIC_ENABLE_EMBEDDED_MEDIA_FEED | `bool`            | true                                   |
| PUBLIC_ENABLE_EMBEDDED_MEDIA_POST | `bool`            | true                                   |
| PUBLIC_YOUTUBE_FRONTEND         | `YouTube`\|`Invidious` | YouTube                             |
| PUBLIC_CUSTOM_INVIDIOUS         | Comma-separated string | ''                                  |
| PUBLIC_CUSTOM_PIPED             | Comma-separated string | ''                                  |
| PUBLIC_ENABLE_USER_MEDIA_PROXY  | `bool`              | false                                  |
| PUBLIC_ENABLE_FEDISEER_BADGES   | `bool`              | false                                  |
| PUBLIC_ENABLE_MBFC_BADGES       | `bool`              | true                                   |
| PUBLIC_STRETCH_CARD_BANNERS     | `bool`              | false                                  |
| PUBLIC_MATCH_XPOST_TITLE        | `bool`              | true                                   |
| PUBLIC_FEATURED_INSTANCES       | Comma-separated string | ''                                  |

See [environment options](docs/EnvironmentOptions.md) for descripions of each.

### Configuration Options for Media Proxying and Caching
Descriptions of the config options and what they do are covered in the [Media Proxy Cache](docs/MediaProxy.md) module documentation.

Variable                            | Value                 | Default                            |
---                                 | ---                   | ---                                |
PUBLIC_ENABLE_MEDIA_PROXY           | `bool`                | false                              |
PUBLIC_MEDIA_PROXY_LEMMY_ONLY       | `bool`                | false                              |
PUBLIC_MEDIA_PROXY_BLACKLIST        | String                | ''
PUBLIC_ENABLE_MEDIA_PROXY_LOCAL     | `bool`                | true                               |
PUBLIC_ENABLE_MEDIA_CACHE           | `bool`                | true                               |
PUBLIC_MEDIA_CACHE_DURATION         | Integer (minutes)     | 720                                |
PUBLIC_MEDIA_CACHE_MAX_SIZE         | Integer (MB)          | 1000                               |
PUBLIC_MEDIA_CACHE_HOUSEKEEP_INTERVAL | Integer (minutes)   | 5                                  |
PUBLIC_MEDIA_CACHE_HOUSEKEEP_STARTUP  | `bool`              | true                               |
PUBLIC_MEDIA_CACHE_KEEP_HOT_ITEMS   | `bool`                | true                               |



The values for `SortType`, `ListingType`, and `CommentSortType` are defined by the lemmy-js-client library.  All of the values are case-sensitive and must match as they are defined in the type definitions of the [lemmy-js-client](https://github.com/LemmyNet/lemmy-js-client)

#### Listing Type
https://github.com/LemmyNet/lemmy-js-client/blob/main/src/types/ListingType.ts

- All
- Local
- Subscribed
- Moderator View (not implemented in Tesseract)

#### Sort Type
https://github.com/LemmyNet/lemmy-js-client/blob/main/src/types/SortType.ts

- Active
- Hot
- New
- Old
- TopDay
- TopWeek
- TopMonth
- TopAll
- MostComments
- NewComments
- TopHour
- TopSixHour
- TopTwelveHour (Not implemented in Tesseract)
- TopThreeMonths (Not implemented in Tesseract)
- TopSixMonths (Not implemented in Tesseract)
- TopNineMonths (Not implemented in Tesseract)
- TopYear (Not implemented in Tesseract)

#### Comment Sort Type
https://github.com/LemmyNet/lemmy-js-client/blob/main/src/types/CommentSortType.ts
- Hot
- Top
- New
- Old (not implemented in Tesseract)
- Controversial (not implemented in Tesseract)


## Support
I created a public Matrix support space you can join.  General discussion, flesh out ideas, or ask for support.  [Tesseract Support](https://matrix.to/#/#tesseract:ptznetwork.org)

There is also a Lemmy community where you can get the latest announcements and post questions related to Tesseract.  Find us at https://dubvee.org/c/tesseract


## Donate
I'm not accepting donations at this time.  