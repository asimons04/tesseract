# Tesseract

Tesseract is a fork of Xylight's Photon and is designed for media-rich feeds and content.

The UI changes are to make better use of the available space, leave less dead zones, and allow a richer, more immersive experience.

The full list of changes can be found in the [change log](./ChangeLog.md).

## Known Issues
You'll see a setting to open posts or links in new tabs.  Those are decorative at this point and haven't been implemented in most places yet.  They default to off, so if you do change those, don't expect anything to happen yet.

Spotify embeds are ugly, but it's Spotify's fault for not making their embed player properly scale with the viewport. There's a "to do" item and plan to address that.



## Roadmap / To Do List
### Infrastructure
1. [X] Add missing route/logic for email verification tokens 
1. [X] Audit the Dockerfile to reduce resultant image size.  1.35 GB is ridiculous.
    - Down to 337 MB!
1. [ ] Move Invidious instances from YouTube component to a system setting
1. [ ] Same as above but for Piped
1. [ ] Move is[Image|Video|YouTube] and postType helper functions from `ui/images.ts` to the `components/lemmy/post/helper.ts` library.
1. [ ] Consider a complementary backend server to add additional functionality such as saving settings to DB, keeping a cache of communities/instance details for Explore features, etc.


### UI
1. [X] Add tabbed interface to Settings to de-clutter
    - Tabling this for now. Reorganized the settings page to make it more compact and removed some options I've defaulted off and plan to remove.
1. [X] Combine some settings into same section (e.g display names and show instances)
1. [X] Add headings to sidebar sections ("Currently Moderating", "My Subscriptions", etc)
1. [X] Make "Communities I'm Moderating" and "Subscribed Communities" lists collapsible in sidebar
1. [X] Completely remove the random placeholders 
1. [ ] Make open/close sidebar button sticky (and possibly move it into the bar itself)
1. [ ] Choose a vote button style and commit to it; remove unused option and its supporting code
1. [ ] Add option to open links in new tab/window
    - WIP:  Added preliminary support by adding additional attributes to the `Link` component. Added target and title attributes. Added settings option and defaults to enable instances of `Link` to take the user's preferred same/new tab setting into account.
1. [ ] Add option to hide deleted comments and logic to implement that
1. [ ] Community Discovery:  Expand functionality of "Explore" to show a list of the linked instances. Selecting an instance will poll its communities and render a list you can subscribe to if logged in.
1. [ ] Add inline search/filter for subscribed communities.

### Modlog
1. [ ] Enhance filtering beyond just community
1. [ ] Collapse sidebar automatically when viewing in table view

### Media Rendering
1. [ ] Create dedicated Svelte component for Spotify embeds
    -  The sizing and CSS for the YouTube iframe was designed for embedded content that is responsive and fills the viewport. Spotify's embed's unfortunately don't and they look ugly as hell. I believe they'll shrink but not expand beyond a certain point, so I think a dedicated component will solve that.
1. [ ] Allow user selection of which Invidious instance to use (instead of randomly selecting one which has proven problematic (sometimes they're down, increased page load as each domain has to cache its own player, etc).
1. [ ] Add support embedding Vevo videos


## Public Hosted Demo Instance
An open, public demo instance is available at [https://tesseract.dubvee.org](https://tesseract.dubvee.org). Feel free to try it out with your favorite Lemmy instance.


## Self-Hosting
Tesseract is designed to be self hosted.  You can even run it from localhost if you want and connect to any Lemmy instance out there.


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
    proxy_pass http://127.0.0.1:8081;
  }

  # This path needs to exist so CORS headers can be relaxed for image uploads to be able to
  # function; Tesseract will proxy the requests through that to the actual backend.
  
  location /cors/ {

    # At a minimum, it is required to pass the Host header since that will need to be further 
    # passed to the lemmy backend

    proxy_http_version                      1.1;
    proxy_set_header  Host                  $host;

    # These are the response headers that will be returned on the preflight checks; required to 
    # allow multiple, arbitrary instances to be used with Tesseract without having to have too 
    # permissive a CORS policy for all routes.
    
    add_header      Access-Control-Allow-Credentials        'true';
    add_header      Access-Control-Allow-Origin             '*';
    add_header      Access-Control-Allow-Methods            'GET,OPTIONS,PATCH,DELETE,POST,PUT';
    add_header      Access-Control-Allow-Headers            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version';
    proxy_pass      http://127.0.0.1:8081;

  }

}
```
**Running Tesseract In Place Of Lemmy-UI**

To do:  I currently have this running on my instance but need to de-tangle the Nginx config into a proper example.  It's not much different than above, and with the addition of the /cors/ path shown above, you can just point the `proxy_pass` for lemmy-ui to Tesseract.



### Configuring default settings
The following environment variables can be set to override the default settings.  Note that all environment variables must be prefixed with `PUBLIC_` to be picked up by SvelteKit.


| Variable                        | Values              | Default Value                          |
| ------------------------------- | ------------------- | -------------------------------------- |
| PUBLIC_INSTANCE_URL             | URL                 | `beehaw.org`                           |
| PUBLIC_LOCK_TO_INSTANCE         | `bool`              | `true` if `PUBLIC_INSTANCE_URL` is set |
| PUBLIC_SSR_ENABLED              | `bool`              | `false`                                |
| PUBLIC_THEME                    | system\|dark\|light | system                                 |
| PUBLIC_EXPANDABLE_IMAGES        | `bool`              | true                                   |
| PUBLIC_MARK_READ_POSTS          | `bool`              | true                                   |
| PUBLIC_REVERT_VOTE_COLORS       | `bool`              | false                                  |
| PUBLIC_SHOW_INSTANCES_USER      | `bool`              | false                                  |
| PUBLIC_SHOW_INSTANCES_COMMUNITY | `bool`              | true                                   |
| PUBLIC_SHOW_INSTANCES_COMMENTS  | `bool`              | false                                  |
| PUBLIC_SHOW_COMPACT_POSTS       | `bool`              | false                                  |
| PUBLIC_DEFAULT_FEED_SORT        | `SortType`          | Active                                 |
| PUBLIC_DEFAULT_FEED             | `ListingType`       | Local                                  |
| PUBLIC_DEFAULT_COMMENT_SORT     | `CommentSortType`   | Hot                                    |
| PUBLIC_HIDE_DELETED             | `bool`              | true                                   |
| PUBLIC_HIDE_REMOVED             | `bool`              | false                                  |
| PUBLIC_FULL_WIDTH_LAYOUT        | `bool`              | false                                  |
| PUBLIC_EXPAND_SIDEBAR           | `bool`              | true                                   |
| PUBLIC_DISPLAY_NAMES            | `bool`              | true                                   |
| PUBLIC_NSFW_BLUR                | `bool`              | true                                   |
| PUBLIC_NEW_VOTE_BUTTONS         | `bool`              | false                                  |
| PUBLIC_ENABLE_EMBEDS            | `bool`              | true                                   |
| PUBLIC_YOUTUBE_FRONTEND         | YouTube\|Piped\|Invidious | YouTube                            |

The values for `SortType`, `ListingType`, and `CommentSortType` are defined by the lemmy-js-client library.  All of the values are case-sensitive and must match as they are defined in the type definitions of the [lemmy-js-client](https://github.com/LemmyNet/lemmy-js-client)

#### Listing Type
https://github.com/LemmyNet/lemmy-js-client/blob/main/src/types/ListingType.ts

- All
- Local
- Subscribed
- Moderator View (not implemented in Photon)

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
These screenshots show some of the enhancements made to the upstream project. 
_ | _ 
---|---
![YouTube videos playing inline](./screenshots/Tesseract-Screenshot-1.png) YouTube videos playing inline | ![Beehaw c/Music as it was meant to be](./screenshots/Tesseract-Screenshot-3.png) Beehaw c/Music as it was meant to be
![Post view with comments and sidebars](./screenshots/Tesseract-Screenshot-4.png) Community sidebar added to post view.| ![Feed view with cards](./screenshots/Tesseract-Screenshot-5.png) Post cards are much more Reddit-like
![Spotify Playlist Embed](./screenshots/Tesseract-Screenshot-2.png) Spotify playlist embedded| ![Desktop PWA](./screenshots/Tesseract-Screenshot-6.png) Running as a desktop PWA

## Donate
Donate to Xylight, not me.  It's their baby, and I'm just building on top of it. You can donate at [Buy me a Coffee](https://buymeacoffee.com/xylight)

<a href="https://www.buymeacoffee.com/xylight"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=xylight&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff" /></a>
