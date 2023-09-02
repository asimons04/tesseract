# Tesseract

Tesseract is a fork of Xylight's Photon and is designed for media-rich feeds and content.

The purpose is to make better use of the available space, leave less dead zones, and allow inline playback of media URLs (YouTube, Spotify, etc).  



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

### Modlog
1. [ ] Enhance filtering beyond just community
1. [ ] Collapse sidebar automatically when viewing in table view

### Media Rendering
1. [ ] Create dedicated Svelte component for Spotify embeds
    -  The sizing and CSS for the YouTube iframe was designed for embedded content that is responsive and fills the viewport. Spotify's embed's unfortunately don't and they look ugly as hell. I believe they'll shrink but not expand beyond a certain point, so I think a dedicated component will solve that.
1. [ ] Allow user selection of which Invidious instance to use (instead of randomly selecting one which has proven problematic (sometimes they're down, increased page load as each domain has to cache its own player, etc).
1. [ ] Add support embedding Vevo videos

## Self-hosting
Tesseract is designed to be self hosted, but there is a pubic instance available at https://tesseract.dubvee.org


### Notes
Right now, Tesseract only works as-is at the apex Lemmy domain (in place of Lemmy-UI).  I'm working through some funkyness with the CORS interactions and am going to need to clean up some of the way that path is handled before I re-enable it.  

While you can run Tesseract under any subdomain you want and connect to any instance you want, image uploads will only work against the configured one _and_ if it's at the APEX domain.

### Workaround for Running Under a Subdomain
If you want to run Tesseract at a subdomain and have working image uploads to your instance, you'll need to add an extra location block in your reverse proxy so that the `/pictrs` path hits the Lemmy backend.

```
location ^~ /pictrs {
    # Set this to the largest file size you want to allow users to be able to upload
    client_max_body_size  150k;

    proxy_http_version 1.1;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;

    proxy_pass "http://lemmy-be";
}
```
The `client_max_body_size` shown in the Nginx config above is abnormally small.  This is what I use to limit uploads to my instance so that pretty much all but the smallest images will be rejected.  Since I still want users to be able to set avatar images, I can't disable the path completely.  

You will want to adjust this value in the example to suit your needs.


### Deploying the Image
Replace `example.com` in the line below with the base URL of your instance.  

Additional environment variables for configuring Tesseract can be found further down in the README.

`docker run -p 8080:3000 -d -e PUBLIC_INSTANCE_URL=example.com ghcr.io/asimons04/tesseract:latest`

### Building from the Repo
1. Clone the repo from a release branch
2. docker build -t tesseract:latest ./
3. `docker run -p 8080:3000 -d -e PUBLIC_INSTANCE_URL=example.com tesseract:latest`

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
