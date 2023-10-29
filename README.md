# Tesseract

Tesseract is Lemmy client designed for media-rich feeds and content.  It's probably the best Lemmy client no one is using :-P

It started out as my personal, custom build of Photon, but it got exhausting porting over my bells and whistles each release. To that end, I finally decided to make it an official fork.

You can't really call this a Photon fork anymore.  Deep down, yeah, there's still some Photon left, but much of it has been re-implemented as I've added new features and rewritten various components.

The full list of changes can be found in the [change log](./ChangeLog.md).

As of current release, support for 0.19.0 is present and functional.  However, no new 0.19.0 features are implemented in this release as it is still in the backwards compatible channel.


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

### Community Browser / Enhanced Discovery
  - Browse the communties of other instances and seamlessly load and subscribe to them.  No more of that obnoxious copy/paste, search, wait, search again, subscribe hokey-pokey dance.
  - Post and comment menus let you browse the communities of the originating instance


### Image/Media Proxying and Caching
Privacy conscious users have long requested media be proxied through Lemmy.  While I can't add that to the API, I can add it to the UI.  Additionally, since the media is already flowing through Tesseract, it made sense to optionally cache the proxied media for re-use.

- Enhance user privacy, reduce bandwidth to other instances, and speed up serving content to your users.
- Can cache any media proxied through it.  Tesseract can act as a caching proxy for your instance as well as cache media originating on other instances as well as outside resources (Giphy, Catbox, Imgur, Yarn, etc).
- Administrators must explicitly enable this module, and users must enable media proxying in their app settings.
- Acts like a CDN in a box. You can even set up regional instances of Tesseract to move the heavy data closer to your users.

Read more: [Media Proxy/Cache Docs](docs/MediaProxy.md)

### Media Bias Fact Check (MBFC) Integration
Posts with URLs can have a MBFC badge in the corner which will lookup the publisher in the MBFC database and return their bias and credibility information.  The MBFC results are also integrated into the reporting and moderation tools.

**For Users**:
- Easily see where the news stories in your feed are coming from and what their sources' credibility ratings are.  
- Optionally automatically hide posts that link to non-credible sources.
- Seamlessly report posts that are from non-credible sources while including a copy of the MBFC results.

**For Moderators/Admins**:  
- Quickly and easily identify and squash posts from disreputable sources.  
- MBFC is integrated into the mod tooling allowing you to populate removal reasons / replies with the results of a MBFC lookup.  
- Perfect for those who are moderating a news or political community.



### Fediseer Integration
- See any endorsements, hesitations, and censures given to instances you're interacting with.
- Code syntax highlighting in code and inline code blocks.

### Distinguished and Sticky Comments
Mods/Admins can distinguish and sticky comments.  Comments that are distinguished will always display at the top of the comment list regardless of sort order.

The handling of the `distinguished` flag is different in Tesseract than in Lemmy-UI:

**Tesseract**
- Distinguished comments will be given a green background and border
- Distinguished comments are pinned at the top of the comments list.
- Any comment can be distinguished by a mod/admin.

**Lemmy-UI**
- Distinguished comments just have an "admin" badge next to them.   
- Only admin/mod comments can be distinguished with the "Speak as moderator" option. (which is redundant because mod accounts already have moderator badges).  

Note that the way distinguished comments are handled only applies to Tesseract.  The comments will be marked as distinguished at the API level, but it's up to individual clients/UIs to handle how to render comments with the `distinguished` flag set.


## Additional Features
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
- Supercharged modlog with enhanced filtering
- Communities and users have "moglog" links in their action menus.  Those will take you to a pre-filtered modlog for just actions related to them.
- Can simply click "reply with reason" when taking moderation actions to send the user a message with the removal details. Template is user-configurable.

### Committed Developer
Tesseract is maintained by someone who is simultaneously a Lemmy user, administrator, and moderator.  




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



- Bandcamp tracks and albums.  


- TikTok is not currently supported. I don't have TikTok, and no one has asked for it, so I'm content not supporting that unless there's demand and someone is able to provide me some sample links (TT does have an embed API, so at least limited support possible).


## Support
I created a public Matrix support space you can join.  General discussion, flesh out ideas, or ask for support.  [Tesseract Support](https://matrix.to/#/#tesseract-support:ptznetwork.org)

There is also a Lemmy community where you can get the latest announcements and post questions related to Tesseract.  Find us at https://dubvee.org/c/tesseract


## Roadmap
The "to do" and roadmap has been moved to [a dedicated file](/Roadmap.md).

Completed "to do"s have been moved to the [change log](./ChangeLog.md).

The changelog also contains an informal list of items I _hope_ to add to the next few upcoming releases.

## Public Hosted Demo Instance
An open, public demo instance is available at [https://tesseract.dubvee.org](https://tesseract.dubvee.org). Feel free to try it out with your favorite Lemmy instance.


## Self-Hosting
Tesseract is designed to be self hosted.  You can even run it from localhost if you want and connect to any Lemmy instance out there. (Note that image uploads can't work from localhost due to the CORS handler, but everything else will)


### Deploying the Image
Replace `example.com` in the line below with the base URL of your instance.  

Additional environment variables for configuring Tesseract can be found further down in the README.

`docker run -p 8080:3000 -d -e PUBLIC_INSTANCE_URL=example.com ghcr.io/asimons04/tesseract:latest`

### Building From the Repo
1. Clone the repo from a release branch
2. docker build -t tesseract:latest ./
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


  location / {
    proxy_pass http://127.0.0.1:8080;
  }

}
```
**Running Tesseract In Place Of Lemmy-UI**

If you want to run Tesseract in place of Lemmy-UI, just replace the proxy pass that goes to your current Lemmy-UI with the IP/port of Tesseract.



### Configuring default settings
The following environment variables can be set to override the default settings.  Note that all environment variables must be prefixed with `PUBLIC_` to be picked up by SvelteKit.


| Variable                        | Values              | Default Value                          |
| ------------------------------- | ------------------- | -------------------------------------- |
| PUBLIC_INSTANCE_URL             | URL                 | `lemmy.world`                          |
| PUBLIC_LOCK_TO_INSTANCE         | `bool`              | `true` if `PUBLIC_INSTANCE_URL` is set |
| PUBLIC_SSR_ENABLED              | `bool`              | `false`                                |
| PUBLIC_THEME                    | system\|dark\|light | system                                 |
| PUBLIC_DISABLE_MODLOG_USERS     | `bool`              | false                                  |
| PUBLIC_MARK_READ_POSTS          | `bool`              | true                                   |
| PUBLIC_SHOW_INSTANCES_USER      | `bool`              | false                                  |
| PUBLIC_SHOW_INSTANCES_COMMUNITY | `bool`              | true                                   |
| PUBLIC_SHOW_INSTANCES_COMMENTS  | `bool`              | false                                  |
| PUBLIC_SHOW_COMPACT_POSTS       | `bool`              | false                                  |
| PUBLIC_DEFAULT_FEED_SORT        | `SortType`          | Active                                 |
| PUBLIC_DEFAULT_FEED             | `ListingType`       | Local                                  |
| PUBLIC_DEFAULT_COMMENT_SORT     | `CommentSortType`   | Hot                                    |
| PUBLIC_HIDE_DELETED             | `bool`              | true                                   |
| PUBLIC_HIDE_REMOVED             | `bool`              | false                                  |
| PUBLIC_DISPLAY_NAMES            | `bool`              | true                                   |
| PUBLIC_TAG_NSFW_COMMUNITIES     | `bool`              | true                                   |
| PUBLIC_NSFW_BLUR                | `bool`              | true                                   |
| PUBLIC_OPEN_LINKS_NEW_TAB       | `bool`              | false                                  |
| PUBLIC_ENABLE_EMBEDDED_MEDIA_FEED | `bool`            | false                                  |
| PUBLIC_ENABLE_EMBEDDED_MEDIA_POST | `bool`            | true                                   |
| PUBLIC_YOUTUBE_FRONTEND         | `YouTube`\|`Invidious` | YouTube                             |
| PUBLIC_CUSTOM_INVIDIOUS         | Comma-separated string | ''                                  |
| PUBLIC_CUSTOM_PIPED             | Comma-separated string | ''                                  |
| PUBLIC_ENABLE_USER_MEDIA_PROXY  | `bool`              | false                                  |
| PUBLIC_ENABLE_FEDISEER_BADGES   | `bool`              | false                                  |
| PUBLIC_ENABLE_MBFC_BADGES       | `bool`              | true                                   |

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

## Screenshots
These screenshots are quite out of date, but they'll give you an idea (haven't had time to replace them yet).  You can also see it live at https://tesseract.dubvee.org.
_ | _ 
---|---
![YouTube videos playing inline](./screenshots/Tesseract-Screenshot-1.png) YouTube videos playing inline | ![Beehaw c/Music as it was meant to be](./screenshots/Tesseract-Screenshot-3.png) Beehaw c/Music as it was meant to be
![Post view with comments and sidebars](./screenshots/Tesseract-Screenshot-4.png) Community sidebar added to post view.| ![Feed view with cards](./screenshots/Tesseract-Screenshot-5.png) Post cards are much more Reddit-like
![Spotify Playlist Embed](./screenshots/Tesseract-Screenshot-2.png) Spotify playlist embedded| ![Desktop PWA](./screenshots/Tesseract-Screenshot-6.png) Running as a desktop PWA

## Donate
Donate to Xylight, not me.  It's their baby, and I'm just building on top of it. You can donate at [Buy me a Coffee](https://buymeacoffee.com/xylight)

<a href="https://www.buymeacoffee.com/xylight"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=xylight&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff" /></a>
