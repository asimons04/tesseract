# Tesseract

Tesseract is a fork of Xylight's Photon and is designed for media-rich feeds and content.

The purpose is to make better use of the available space, leave less dead zones, and allow inline playback of media URLs (YouTube, Spotify, etc).  



## Screenshots
These screenshots show some of the enhancements made to the upstream project. 
_ | _ 
---|---
![Screenshot from 2023-08-31 16-20-07](./screenshots/Tesseract-Screenshot-1.png) | ![Screenshot from 2023-08-31 16-20-07](./screenshots/Tesseract-Screenshot-3.png)
![Screenshot from 2023-08-31 16-20-07](./screenshots/Tesseract-Screenshot-4.png) | ![Screenshot from 2023-08-31 16-20-07](./screenshots/Tesseract-Screenshot-5.png)
![Screenshot from 2023-08-31 16-20-07](./screenshots/Tesseract-Screenshot-2.png) | 


## Roadmap / To Do List
### Infrastructure
1. ~~Add missing route/logic for email verification tokens~~ Done!
1. Audit the Dockerfile to reduce resultant image size.  1.35 GB is ridiculous.
1. Move Invidious instances from YouTube component to a system component
1. Same as above but for Piped


### UI
1. Add tabbed interface to Settings to de-clutter
1. Combine some settings into same section (e.g display names and show instances)
1. Add headings to sidebar sections ("Currently Moderating", "My Subscriptions", etc)
1. Make "Communities I'm Moderating" and "Subscribed Communities" lists collapsible in sidebar
1. Completely remove the random placeholders 
1. Make open/close sidebar button sticky (and possibly move it into the bar itself)
1. Choose a vote button style and commit; remove unused option and its supporting code
1. Add option to open links in new tab/window

### Modlog
1. Enhance filtering beyond just community
1. Collapse sidebar automatically when viewing in table view

### Media Rendering
1. Create dedicated Svelte component for Spotify embeds
1. Allow user selection of which Invidious instance to use (instead of randomly selecting one which has proven problematic (sometimes they're down, increased page load as each domain has to cache its own player, etc).
1. 

## Self-hosting
Tesseract is designed to be self hosted.  There are currently no public instances available, but that may change in the future.


### Running from image
No Docker images exist yet. Build from source and then run.  Example here uses `docker run` but it would make more sense in production to move that to a docker-compose file.
1. Clone the repo from a release branch
2. docker build -t photon:latest ./
3. `docker run -p 8080:3000 -d -e PUBLIC_INSTANCE_URL=example.com photon:latest`

### Configuring default settings

The following environment variables can be set to override the default settings:

| Variable                        | Values              | Default Value                          |
| ------------------------------- | ------------------- | -------------------------------------- |
| PUBLIC_INSTANCE_URL             | URL                 | `lemmy.ml`                             |
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
| PUBLIC_RANDOM_PLACEHOLDERS      | `bool`              | true                                   |
| PUBLIC_ENABLE_EMBEDS            | `bool`              | true                                   |

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
- TopTwelveHour (Not implemented in Photon)
- TopThreeMonths (Not implemented in Photon)
- TopSixMonths (Not implemented in Photon)
- TopNineMonths (Not implemented in Photon)
- TopYear (Not implemented in Photon)

#### Comment Sort Type
https://github.com/LemmyNet/lemmy-js-client/blob/main/src/types/CommentSortType.ts
- Hot
- Top
- New
- Old (not implemented in Photon)
- Controversial (not implemented in Photon)



## Donate
Donate to Xylight, not me.  It's their baby, and I'm just building on top of it. You can donate at [Buy me a Coffee](https://buymeacoffee.com/xylight)

<a href="https://www.buymeacoffee.com/xylight"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=xylight&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff" /></a>
