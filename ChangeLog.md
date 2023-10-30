# Changelog
All major/minor changes between releases will be documented here.  


## Immediate Roadmap:

- Create an instance-specific `/about/{instance} page that will render just the site info that is typically in the sidebar
- (0.19.x) Switch pagination param from `page={n+1}` to `page_cursor={x}`
    - Has `next_page` but not cursor for current page.  Probably need to track these to enable returning to previous page.
    - Waiting on 0.19.0 to stabilize a bit more before starting this
    - _May_ wait until after 0.19 is released since the current `page={n}` will be supported.  This will allow better testing against my own instance.

- (0.19.x) Add `scaled` sort option to dropdowns
    - Will add in first 0.19.0-specific release.  


- (0.18.x and 0.19.x) Add Instances list
    - Add handler to make each instance in the list clickable to load the site info, their local communities, etc.
    - In the community list for the instance, add handler to search the community to view content/subscribe.

- To do: When browsing remote communities, add additional validation step to see if the community you're browsing is blocked by your instance.  Since the API calls to browse those are coming from the client, you can end up browsing and trying to resolve communities your instance will not allow.  By cross-referencing against the `blocked` instance list for your site, a warning can be shown.

## 1.2.8.98
### MBFC Module Updates
- Added ability for authenticated users to report a post from the MBFC result window. Report template will contain an abridged version of the MBFC results.

- Created user option to hide posts that are from "Low Credibility" sources.
  - Applies to main feed and community feed.  Intentionally not applied to user profile post lists, though you will still see the "Low Credibility" badge.

- Moved lookup process higher up in the post flow so that MBFC results are attached to post objects, pre-render, for filtering purposes.
  - Applied to main feed communtiesand community feed at `/c/[name]`
  - If MBFC data is not provided in feed data for posts, will fallback to direct lookup on a post-by-post basis (e.g. posts at `/u/[name]`)

- As always, thank you `worldnews@lemmy [dot] [machine learning]` for being a complete dumpster fire of shit sources. You've been really helpful in testing the functionality, efficacy, and necessity of this module.


### Bugfixes
- Added rule to image proxy handler to exempt image URLs that are already re-written for the proxy.
- Removed transition animation on posts in feed.  Caused too many problems with restoring the feed position on return and provided too little benefit.

### Inline Video Updates and Bugfixes
- Added option to loop videos (inline videos and Invidious are all that are supported by their respective APIs -- YT supposedly does, but doesn't honor the URL param)
- Capped height to `80vh` to better contain portrait-oriented videos
- Adding missing background container to match other post styles.
- Note:  webm videos are not working in iOS but mp4 do.  God I hate Apple.

### YouTube
Cleaned up YouTube/Invidious/Piped renderer 

### UI Tweaks
- Forced posts into compact view in report modals (similar to remove modals for mods/admins)
- Put post/comment content inside a `pointer-events-none` classed div to avoid any accidental clicks into potentially problematic content.
- Increased icon size in modal titles
- Restored Hide/Delete post options for regular users since apparently they _can_ see those posts.
- Tweaked layout of compact posts
  - Added crossposts list to compact posts
  - Moved compact post renderer to dedicated component
  - Added fully-collapsed post body with expansion button
- Added checkbox to confirm report is being made in good faith to report submission form.




## 1.2.8.97
### UI Tweaks
- Removed user, user modlog, and community links from Post actions menu since they're redundant or only useful for mods. The post action menu was getting a little crowded in some cases.
  - The user/community links can be accessed from the post header by clicking/tapping on their names
  - The user modlog is really only useful for mods/admins, and it also exists in the moderation menu
- Hide downvote button on posts/comments if not logged in (was simply disabled)
  - Upvote buttons remains visible but disabled to indicate the number is the post/comment score.
- Hide reply button on posts/comments when not logged in or if post is locked. (Was visible but disabled)
- Fixed annoying gap between username and post time when post header reflows to mobile

### MBFC Is Now Fully Client-Side
Moved all of the MBFC lookups client-side.  This made several things feasible which have been implemented:
- Only posts with sources that have a record in the dataset will show the MBFC badge. Eliminates "dead" badges on posts that either do no apply to MBFC checking or do not have a record.

- Badges are now color-coded depending on the MBFC credibility score

- I left the server API handler (`/tesseract/api/mbfc/lookup`) in place as I may have a future use for it.  The data file used for the API lookup is the same one that's served to clients for local lookups.

- Updated MBFC dataset to latest export from their browser extension repo.



## 1.2.8.96

### Bugfixes
- Had a `setInterval` where I should have had `setTimeout` in step to auto-focus the comment field when you hit 'reply' on a post. (facepalm)

### Modal Changes
- Replaced title slot with a property variable
- Added property variable to supply an icon
- Changed class of close button to be less intense
- Decreased font size of title (2xl -> xl)
- Added icons to report, ban, and remove modals
- In moderation modals, moved the reason fields above the post content
- Reduced dead space in moderation modals


### MBFC Component Refinements
1) Added additional aliases to supplement the dataset's built-in alias list for detecting sources by domain (e.g. `bbc.co.uk` -> `bbc.com`, `finance.yahoo.com` -> `news.yahoo.com`, etc)
2) Added color-coded badges to MBFC results
    - Green check for highest credibility and factual reporting
    - Amber check for medium / mixed levels of credibility / factual reporting
    - Red exclamation triangle for low credibility, low factual content, or for disreputable sourcs
    - Bias rating is a green check for left-center, center, right center, and pro-science. Yellow check for satire, left and right bias, and red exclamation for questionable sourcing and conspiracy/pseudoscience label.

### Moderation Tools
1) Integrated the Media Bias Fact Check component into the mod tooling.  If you are community moderator or instance admin, there are now options in the MBFC window to automatically populate a removal/purge reason based on the MBFC results.  Should be useful for mods of news/politics communities.  i.e. If MBFC throws red flags for an article post source, you can click "Remove" right from the MBFC screen to load an abridged MBFC report into the removal modal.

2) Forced posts into compact mode when rendering in remove/purge modal.

### On-Screen Navigation Bars
1) The on-screen navigation bars (Return to feed, scroll to bottom, scroll to top) have been removed and replaced with the sticky navbar used elsewhere.  The same functionality is there, just packaged differently.
2) Removed option to show/hide navigation bar since this version is less intrusive and matches the rest of the UI

### UI Tweaks
1) Decreased size of post titles in feed on small width displays (other screen sizes unchanged)





## 1.2.8.95

## New Features
### Media Bias Fact Check Integration
Media Bias Fact Check (MBFC for short) is a non-profit organization that studies and rates the biases of various news outlets.

This release of Tesseract adds an internal API to lookup domains against an export of the MBFC data to return the bias, credibility, factual reporting rating, and questionable tags for a supplied news source (specified by their domain name).

When enabled, a "MBFC" badge will appear in non-media posts with URLs.  Clicking it will bring up a report if the source is found in the dataset.

**Note**: Existing users need to manually enable this feature.  It is located in App Settings -> Posts -> Media Bias Fact Check Badges

The default setting can be defined by the Tesseract administrator by setting the `PUBLIC_ENABLE_MBFC_BADGES` environment variable. The default is `true` so if you do not want this feature to be enabled by default, set this to `false`.



#### API Endpoint

`/tesseract/api/mbfc/lookup?domain={domain}`

MBFC does not have an official API, nor can I "find" an unofficial one; I also refuse to write a scraper.  However, they do have an [offical browser extension](https://github.com/drmikecrowe/mbfcext) that packages an export of a subset of their data as a JSON file with an MIT license.  I can work with that.

I wrote a server-side handler to lookup domains from that file and return a report to the request.  All lookups done via Tesseract are through this endpoint, so there are no 3rd party API calls being performed.

The dataset is loaded from [https://github.com/drmikecrowe/mbfcext](https://raw.githubusercontent.com/drmikecrowe/mbfcext/main/docs/v5/data/combined.json)

Currently, I just pull the latest version from that repo and bulid it into Tesseract on each release.  I'm planning to implement a server-side task to periodically pull the latest automatically. 

#### MBFC To-Do List
- Add an internal updater so the MBFC data can be updated in-situ without waiting for the latest Tesseract release to bundle a new version.

- Since the dataset is already in JSON, consider moving it to a client-side object for lookups.
  - Pro: Would allow realtime badges without incurring an API call to the Tesseract server for each lookup
  - Pro:  Badge would only show on posts where the source has a record
  - Pro: Can set user-defined filters for credibility ratings to hide posts from disreputable sources
  - Yeah, that last one settles it.  On one of the next few releases, I'm going to rework MBFC to be client-side.  The data doesn't change incredibly often, so it doesn't need to be _super_ fresh to be useful.  Just need to serve the data JSON from the static directory and have the server update and rotate that file.


### Search Page Enhancements
- [Bugfix] Added conditional to the `resolveObject` call so it only calls that endpoint if the keyword starts with a `!` or `@` indicating a federated community or user search.
- Can add a user filter to restrict the keyword search to posts/comments made by a particular user
  - Since the search needs the `person_id` and not the username, the auto complete box will fill in with their ID.  This is normal until I write a handler to display the user name+domain while keeping the person_id value under the hood.

- Added community filter to restrict the keyword search to posts/comments within a particular community
- Added new breadcrumb-style toolbar to search page
- Hid search in navbar when on `/search` page to avoid confusion/clutter

## Other Changes
- Breadcrumb menus are now sticky.
- Fix scroll offset to account for new sticky navbars
- In small width/mobile view, hid "card/compact" switcher instead of page since there's only room for so much; page turned out to be more useful
- Reimplemented `fixLemmyEncodings()` to correctly render more HTML entities (e.g. `&amp;` -> &, `&nbsp;` -> `' '`, etc)


## 1.2.8.94
### Changes
- Added a bit of bottom padding to crosspost container
- Removed logo and "Frontpage" header from main page.
  - Replaced with {ListingType} > {SortType} > {PageNumber}
- On main page, site card now reflows to the top like the community pages do
- Changed centering method on site/community/user card stats row
- Clicking "reply" in a post will automatically focus the text area input
- Replaced old Select menus from top of post/community/user pages with newer menus
  - Added pagination to this section (will likely have to reimplement after 0.19.0 releases change to cursors vs page numbers)
- Added search field to navbar and hid "Search" button when it is visible (large width and above). Below that, the search is hidden and the old search button is revealed.



## 1.2.8.93
### Bugfixes
- Fix regression where allowed/blocked instances were not sorted

### Changes
- Decrease opacity of user/site/community cards from 90 to 85% to make banners more apparent.
- Remove background around post body container div; text is now "flat" against the card background.
- Aligned "Crossposts" item with the rest of post.
- Reduced gap between post action bar and bottom of post content.
- Hid comment text input by default. You now need to click "Reply"on the post.
- Moved edit/preview and submit buttons into comment editor box.
- "Expand/collapse" preview text buttons are a little more narrow now
- Spruced up MarkdownEditor component's built-in preview.





## 1.2.8.92
Note:  1.2.8.91 was not released as a standalone version and was only used internally.

### Admin Panel
- Added panel to adjust rate limits
- Provided inline documentation for rate limit buckets
- Added panel to set, replace, and clear the site logo and banner
- Can now remove site icons and/or banners if you want.

### Site, Community, and User Cards
If instances, communities, or users have banners configured, they will be used as the semi-transparent background image in site/community/user cards.

**Note**:  You will need to enable this in Settings.

### Bugfixes
- Added filter to image proxy URL rewriter to exempt local `blob:` URLs from being re-written.
- Fixed dark mode divider color in `EditableList` component.


## 1.2.8.9
### 0.19.0 Support Update
Have tested against the latest 0.19.0-rc.3 and everything still seems to be working.  The only breaking change of concern is the way the auth token is sent.  As before, Tesseract is still using the 0.18.x `lemmy-js-client` patched to send the auth via header and does not have access to any of the new API features.  

I'll likely keep Tesseract in "backwards-compatible" mode until 0.19.0 is officially released, has a proper shakedown, and I upgrade my own instance to it.  That will allow me to do deeper testing and work on the admin tools side of things as well.

Life happenings have not allowed me time to stand up a 0.19 test instance as of yet, so I'm relying on Voyager to be my testing server.

#### Release Plan
Once 0.19 is released, for safety purposes, I will temporarily stop tagging images with `:latest`.

Versions working in backwards-compatible mode will be tagged `:latest-18` and versions that only support 0.19.0+ will be tagged `:latest-19`

Once 0.19.0+ hits critical mass, I will resume tagging `:latest` which will point to the 0.19-only version.  For those still on 0.18.x, you'll need to use the `:latest-18` tag.

### Enhancements
#### Admin Panel
The admin panel has had a similar rewrite similar to the application settings panel.  Much more organized, options are more descriptive, and the entire interface is easier to use on mobile.
- Moved instance management (add/block) from `/admin/instance` into `/admin/config/` in the Federation section.
- Moved admin team management from `/admin/team` into `/admin/config` in the "Admin Team" section.
- Moved tagline management from `/admin/taglines` into `/admin/config` in the "Taglines" section.




### Misc Changes
- [Settings] Moved "Comment Sort Direction" option from "Feed" section to "Posts" section in Settings.
- [Settings] Unique icons for a few settings
- [Markdown] Left-aligned text in markdown table headers and added bottom border
- [Settings] Fix typo in feed settings
- [Settings] Hide "Moderation" settings if not a mod or admin
- [Settings] Hide "hide removed / hide deleted" options if not a mod or admin (regular users can't see deleted/removed content anyway)




## 1.2.8.8

### New Features
#### Keyword Filtering
Sick of hearing about a particular topic?  Add keyword filters to keep posts containg those terms from appearing in your feed.  By default, keywords are compared case-insensitively, checked as whole-words, and only checked for presence within the post title, body, or embed description.  

You can add modifiers to fine tune this somewhat:
- `!term`: Prefixing a keyword with an exclamation mark will compare it as case-sensitve.  Useful for filtering acronyms.
- `^term`: A carat tells the filter to check that the post elements start with the provided term.
- `*term`: An asterisk disables whole word checking will filter a post if the keyword is contained within other words.

At this time, modifiers cannot be combined. Perhaps that is something that will be implemented later.

Post filtering is available for the main feed and within communities.

### Enhancements
#### UI Refinements
- Removed excess margin between "expand" button and bottom of preview text in feed.
- Spotify embeds for albums and playlists are now taller and easier to navigate
- Reduced gap between post metadata, URL, and body.
- Added user setting to truncate post URLs down to just the domain for rendering. Can change this behavior in settings.
- Added user setting to collapse/expand cross post list by default
- Hide "card/compact" switcher in small width to keep from overflowing. The fact it stayed inline was mostly just my testing device being unique.

#### Settings Control Panel
The settings control panel has had a complete overhaul and is no longer a total fustercluck.  
- Looks much more sleek and modern
- Easier to use on mobile
- Much more organized
- More options now hide when unavailable due to a dependency being disabled or unavailable.

### Bugfixes
- The Svelte native restore of scroll position wasn't always returning to the correct position in the feed when returning from viewing a post.  Overrode Svelte behavior and am now handling this manually in some cases and with the default Svelte behavior in others.
- Fixed where Mod badges weren't showing in post views as after the component breakout/refactor; moderator object wasn't passed through intermediary component.
- Added some missing error handling to a few post fetches.

### Misc
- Added additional Invidious instance: `yt.whateveritworks.org`


## 1.2.8.7

### New Features
#### Distinguished and Sticky Comments
Mods/Admins can now distinguish comments.  Comments that are distinguished will always display at the top of the comment list regardless of sort order.

The handling of the `distinguished` flag is different in Tesseract than in Lemmy-UI:

**Tesseract**
- Distinguished comments will be given a green background and border
- Distinguished comments are pinned at the top of the comments list.
- Any comment can be distinguished by a mod/admin.

**Lemmy-UI**
- Distinguished comments just have an "admin" badge next to them.   
- Only admin/mod comments can be distinguished with the "Speak as moderator" option. (which is redundant because mod accounts already have moderator badges).  

Note that the way distinguished comments are handled only applies to Tesseract.  The comments will be marked as distinguished at the API level, but it's up to individual clients/UIs to handle how to render comments with the `distinguished` flag set.

**Limitations for Sticky Behavior**

Comments that aren't loaded on initial fetch will not be stickied at the top.  This has to do with the max comment depth that is fetched; loading too many layers up front, when there are lots of comments (>100), causes noticeable delay in page loading.  As such, if you want to sticky a comment, make sure it is a top-level comment.  Otherwise, the comment will be shown as distinguished when that part of the tree is loaded, but it won't be stickied at the top.

### Bugfixes
- Missed a width setting in Spotify renderer when I refactored the user settings a while back.
- Previewing empty comment text area no longer soft errors saying it failed to render the markdown.
- Removed `Cache-Control` response header from image proxy response. Was having random problems with images from some instances. 

### Misc Enhancements
- Moved more elements into discrete Svelte components
- More post components are now loaded on demand. Reduces overhead by not loading post components (video player, etc) that aren't needed for particular posts.
- "Expand" button on post text preview in feed is now same color as card.
- Site logo in site cards are no longer "circle"-ified 

## 1.2.8.6
### Enhancements
Most are under the hood, but put more pieces into discrete components and re-implemented the post renderers using the new components.  

Polished a few areas of the UI:
- The comment counts, reload, and sort buttons above the comment reply text field are now more streamlined.
- Post views (`/post/{instance}/id`) are standardized to just be a bigger version of the card view you see in the feed.  Less custom code to worry about.
  - Increased margin in post view by 5%
- Crosspost links are standarized between feed and post view.
- Card view in feed is now all components rather than custom coding.  
  - Compact view is up for a refresh next.
  - Known "bug":  Compact view does not show crossposts, and any cross-posts are hidden.  Will address somehow when compact view gets a refresh.
  - With those refactors in place, a new view type such as "list" can be easily implemented
- "Jump to comment" button in profile view is now an icon


### Bugfixes
#### Crosspost Detection
Fixed crosspost rollup algorithm.  Was only fuctional for one crosspost; any more would be treated as unique.  

Crosspost detection also compares the post title in addition to the URL. Lemmy-UI only compares the URL.  Adding the post title to the comparison catches more spam.  Yes, spam.


#### Crosspost Loading / PostMeta Reactivity
There were a few variables that weren't reactive in the PostMeta component. This caused the community and post creator to not change when clicking a crosspost link when viewing a post.





## 1.2.8.5
### Bugfixes
- Fix x-overflow in markdown render divs

### Enhancements and Bugfixes
- Users now have the option to display Fediseer badges on posts. Defaults to off.  
- Added censure and hesitation evidence to data shown in Fediseer popup
- Fixed overflow for community names in community browser.
- Hide theater mode button when screen width makes it useless

- Removed granular options to show the instances for communities/users/posts.  It's now one toggle:  on or off.

- Hid badge text on posts when viewing in small width displays.  Shows icon only.  (e.g. Saved, Featured, Deleted, Removed, etc)

- Post time and score reflow below post author when viewing on small width displays.

- See less duplicate posts in the feed!  Posts in the feed with the name title and/or URL will roll up into a single post with a "Crossposts" list at the bottom.  The older post will be the one shown with the newer one being shown as a cross post link.  This is similar to how Lemmy-UI does this in the feed except Tesseract also shows the comment count for the crosspost.
  - Since the API doesn't provide any cross-post information when listing posts (only when viewing a single post), only posts on the same page will be rolled up.  So if there's a duplicate set of posts, but they're on different pages, you'll potentially see both individually - one on each page.  There's no way around that until/unless the API provides cross post information in the post list response.


## 1.2.8.4
### Enhancements
- When showing embedded description when there is no post body, run it through the same truncation/expansion process as the post body preview.
- Non-HTTPS YouTube links are now detected.  Converted to HTTPS upon render.

### Additional Media Support
Sources that provide an embed video URL, such as Imgur, Streamable, etc will now render that inline as a video. 

## 1.2.8.3
### Enhancements
- Added "Return to Top" button to pagination bar
- Added user option to set the number of posts shown per page
  - Note that more posts may take longer to be retrieved from your home instance.
- Refined scroll into view when expanding/collapsing posts and post body contents. Much less "jumpy" now.
- Comment action and moderation buttons are to the right similar to posts
- Added debug info button to comments.
- Tweaked compact post layout
- Increased community avatar size from 24 to 36px in post headers

### Bugfixes
- Youtube component now shows parameters in link
- Fixed bug with `end` parameter not detecting 



## 1.2.8.2
Emergency release to fix bug that went undiscovered during beta testing.
### Bugfix
- Fixed case where cache module was counting its base directory as an item and doubling the reported size.  
- Fixed case where cache module was including its base directory in the eviction method.


## 1.2.8.1
### Additional Media Support
- **[Odysee]** Addded support for Odysee embeds. Odysee is a YouTube-like video platform with blockchain or something.  I dunno.  I've seen video links for those, and they have an embed API.  Tesseract now supports it. 
- **[YouTube]** Youtube-style post links are now re-written to use your preferred frontend.  For example:
  - If a post is a YouTube video link, and your YT frontend is Invidious, the post's YouTube link will be re-written to match your selected Invidious instance.
  - If a post is an Invidious/Piped link, and your YT frontend is YouTube, you'll see a YouTube link
  - Comment links to YouTube (etc) are not currently re-written.  Will implement that at some point.
- **[SongLink]** Song and Album links by `odesli.co`.  Provides links to media from various sources (Apple Music, Spotify, YT, Pandora, Deezer, etc).
  - Will default to a YouTube embed if available.  Otherwise, album art and a list of sources.
  - Because the Youtube embed is provided by their API, Tesseract cannot route it through your preferred YouTube frontend.

### Enhancements
- If there is an embed description for a post and no post body text, show the embed description instead. 



## 1.2.8
Most updates are under the hood and to the server-side handlers to support media proxying and an associated caching layer.  Also re-implemented the image upload proxy.

### CORS Location in Reverse Proxy is No Longer Needed
I did a rewrite of the image upload proxy in this version, and the updates there have made the `/cors/` location and its headers unnecessary.  

The `location /cors/ {` section in your reverse proxy config can be safely removed as of this release.


### Media Proxying and Caching
Tesseract can now proxy and cache post thumbnails, images, avatars, and inline post/comment images through the server hosting the UI.  Any image or direct-link video (webm, mp4, etc) can also be proxied/cached, including those hosted through Imgur, Tenor, Giphy, Catbox, etc.

This feature is disabled by default and must be explicitly enabled both by the administrator and each user.  

#### Advantages to Proxying/Caching
- Enhanced user privacy
- Quicker loading of images
- Reduces traffic to other Lemmy instances and hosting services by fetching media once and serving it from cache.

#### Disadvantages
- Increased bandwidth usage
- Increased processing by the UI server

For proxy cache documentation and more details, [see the docs page for the media proxy/cache module](docs/MediaProxy.md)

### Fediseer
- Fediseer queries are now cached for one hour in memory.
- Fixed unhandled error if Fediseer API call fails
- Added 10s fetch timeout on each Fediseer lookup
- If Fediseer fetch fails, do not cache unsuccessful lookups

### Bugfixes and Enhancements
- [Bugfix] Fixed garbled code block and inline code when inside a block quote
- [Bugfix] Fixed wonky rendering of bullet lists, especially nested lists.
- [Bugfix] Not a Tesseract bug, but added a shim to replace `&amp;` and `&lt;` in posts/comments because of Lemmy's overzealous sanitization.
- [Bugfix] Fixed bug with inline videos (.webm, .mp4, etc) sometimes not rendering in iOS
- [Enhancement] Site icon and name now load in navbar when not locked to an instance (formerly was the app icon and instance domain only)
  - Now works for guest instances and switches when you change
- [Enhancement] Admins can now [supplement the internal list of Piped and Invidious instances](docs/CustomYoutubeFrontends.md). Useful if you run into Invidious/Piped links that are not being detected or want to supply a custom Invidious instance to use as the YouTube frontend.
  

## 1.2.7
### Fediseer Integration
There is now a section within the post and comment actions menu contextually relevant for the instance the post belongs to.  

Currently, there are two functions:

#### Fediseer
This has been on the backburner for a while, but finally glad to have initial support.  Fediseer is a chain of trust and reputation management system for the Fediverse.  You can learn more about Fediseer on [its website](https://dbzer0.com/blog/overseer-a-fediverse-chain-of-trust/).

In a nutshell, verified instance administrators can "endorse" other instances to show that they're known and trusted.  In addition to endorsements, instance admins can issue "censures" and "hesitations" along with reasons and supporting evidence.  

For example, if an instance is known to harbour hate speech, trolls, spammers, bigotry, or other undesirable content, instance admins can "censure" that instance.  A censure is basically a notice; it's there to inform you and nothing more.  A "hesitation" is similar to a censure but less severe.

These tools can help instance adminsitrators take preventative action and give a heads up to any unsavory instances.  

I know I've explained Fediseer poorly, but that's the gist of it.  Please read their website for more details on how it works.

Currently, support is limited to public endpoints only.  Eventually, I would like for admins to be able to endorse, censure, or guarantee other instances all from within Tesseract, but that is still a ways off.

#### Browse Communities
This will take you to `/communities/{instance}` and show you the communities belonging to that instance.  From there, you can browse their communities and subscribe to them if you like.

### Modlog Tweaks
- Combined mod action, content, and reason into one column.

### Misc Enhancements
- Added "Browse communities" and instance-specific menu section to post actions
- Removed max height class on post action menu to accommodate incoming features.
- Removed unnecessary heading in post moderation menu
- Added "ban" function to post moderation menu
- Reorganized moderation and post action menus
- Added admin function to hide/unhide communities

---

## 1.2.69.2
### Bugfixes
- Disabled `data-sveltekit-preload-data="hover"` globally as it was causing too many unnecessary API calls with too little benefit.
    - Removed individual overrides that were suppressing that.

- Moved user and community action menus up to the community/user display name div
    - Long usernames, especially with long instance domains, were pushing the action menu outside of the card

- Clicking "theme" in profile menu will keep menu from closing (for quick toggling)

### Enhancements
- Added "About" community modal to remote instance community lists. 
- Modal close button is now `primary` color making it easier to see

## 1.2.69.1
### Bugfixes
- Accidentally had `text-xl` at too large a font size.
- Added missing `5xl` through `9xl` font sizes (weren't in use, but would have thrown an error if they ever were since I'm overriding the Tailwind defaults).
- Throw warning if trying to auto resolve unknown community when not logged in.


## 1.2.69
This release has three _big_ quality of life enhancements:
- Can browse communities of other instances
- Automatically resolve unknown communities
- Dynamic modlog filtering


### Community Discovery
#### Browse Communities by Instance
Initial support for community browsing by instance!  This is a feature I've wanted to add for some time, and I've finally added preliminary support for it. There is now a sub-path under `/communities` that will show the communities of any instance. 

From the Explore / Communities page, enter the base domain of the instance you want to browse and hit the "browse" button. 

Clicking a community will automatically resolve it from its home instance (if not already known to yours) and show you a preview.  This is basically a shortcut to searching for it and works the same way.  From the community page, you can then subscribe if it interests you.  No more copy/pasting community links and doing manual searches!  Yay!


**Limitations**:

Of course every new feature can't come without _some_ limitations.  These are pretty much all API-related and are limited by the way the API works.  I don't think I can reasonably work around this without some kind of backend component for Tesseract, and that's outside the scope of the project for the time being.

- You cannot one-click subscribe, at least not yet.  You have to click into the community to resolve it and _then_ subscribe from the community page. Still, better than the old copy, paste, search, resolve, subscribe method.

- There is no way to mark/omit communities on that instance you are already subscribed to.  I _may_ be able to work around that within the limitations of the API, but right now, it's just a raw list of local communities on the target instance.

- Sometimes no posts are returned.  This also happens when searching for a new community and no initial batch of posts are returned, so it's some issue with Lemmy API (it also happens in Lemmy-UI which means it's not a frontend bug).


#### Communities Now Automatically Resolve
Previously, if you clicked a community link, such as `!food@beehaw.org` or `https://{instance}/c/{community}` but the community is not already known, Tesseract would show an error saying the community is not found. You would then have to manually search for the community to view it.  We can do better than that.

Now, if a community is not known to your instance and you try to view it at `/c/community@instance`, it will automatically search/resolve in the background and load the initial batch of posts.  It will obviously take a bit longer to load the community page, and a toast message should pop up to inform you of such.


### UI
- Ever so slightly increased `xs`, `sm`, and `base` font sizes to accommodate my old people eyes on high DPI displays.
- Added tooltip to `FormattedNumber` component to show the raw value on mouseover
- Dark mode menus are a little darker for better contrast

### Modlog Enhancements
- You can now apply moderator, moderatee, and community filters in the modlog.  Just click the plus/minus to add/remove them to the filter query.
    - Table view only for now (so only really works on desktop)
    - Can still filter by action type/community/moderator/moderatee in card view, though
    - May not be practical to add +/- filter buttons to cards anyway
- Added search filter for `mod_id` to allow filtering by moderator
- Added autocomplete searches for moderator and moderatee

### Components
- Expanded `ObjectAutoComplete` to support person searches.

### Bugfixes
- Fixed nonstandard width/margins of post feed in `/u/[name]` and `/profile/user` routes.
- Overrode `on:mousemove`, `on:touchmove`, and `on:touchstart` event handlers on `UserLink` and `CommunityLink` components.  Those were causing background fetches for user and community info
    - Particularly problematic now that auto-resolve communities has been implemented. Was background-resolving any community you moused over.
- Removed overzealous auto focus on `/communities` search input (annoying on mobile)
- Fixed bug where subscribe to community closed menu and blocked thread with no indication of activity.

## 1.2.68

### Added preliminary support for 0.19.0
1.2.68 is compatible with both 0.18.x and 0.19.0.  The current support has limitations, though.  It is still using the 0.18.x lemmy-js-client with patches to corrrectly authenticate against the 0.19.0 API as well as handle both date formats (with and without timezones).  

So, while it works for both 0.18.x and 0.19.x, none of the new 0.19.x API calls/features are available.

#### Future Releases
Please note that the plan is to still have separate versions of Tesseract for 0.18.x and 0.19.x.  Thus far, I'm not thrilled with the extra baggage it would entail to provide backwards compatibility and selectively disable 0.19-specific features. 

The basic 0.19.x support in this (and future Tesseract 1.2.x releases) will only be to provide a transition period until instances are widely on 0.19+.

The 1.3.x releases of Tesseract will only support 0.19.0+ versions of the Lemmy API.


### Enhancements
#### Form Fields
First form element now auto-focuses where applicable.
- Instance selector input for `/login`, `/forgot_password`, and `/signup`
- Search box for `/communities`
- Username field on `/login/[instance]` and `/signup/[instance]`
- Email field on `/forgot_password/[instance]`
- Title on `/create/post`


#### Community Card
- Added remove/restore community actions to the community card 
- Action menu now visible at all screen widths
- Removed buttons for sub/unsub, block, community settings, and modlog in favor of moving those to the action menu

#### User Cards
- Added modlog button to filter modlog for just actions against that user.  Uses include:
    - See why they were banned
    - Look for other actions against them to determine appropriate future mod actions
- Removed admin menu (shield button under 'block') and moved admin options (currently just 'ban') to user action menu.
- Removed buttons to message/block user and folded those into the user menu.

#### Modlog
- Can now specify `other_person_id` URL parameter to filter for a specific user.


### Bugfixes
- Fixed condition where if community block call fails, community won't erroneously be marked as blocked in the UI
- Disabled "create post", "block community", and "subscribe" buttons in community action menu when community is removed.
  - Really only affects admins since regular users can't see the removed communities, but still a bug needing fixed
  - Apparently blocking a removed community, at least as an admin, still blocks the community even though the API returns 404 (0.18.5, anyway)
- Removed unneeded menu toggle click event from "Reports" button in navbar. 


## 1.2.67

### Bugfixes
- Rolled back default communities list from Local to All
- Removed 3rd party API call to Dicebear for initials avatars on communities and using internal JS library
    - Not really a bug, but I _hate_ relying on 3rd party APIs for things that should be handled internally.
- Fixed full-width multiselect widget that got borked in 1.2.65
    - Added `fullWidth` parameter to make them full-width where desired.
- Fixed bug where searching for a community would not take you back to page 1 and left you stranded until clearing the `page=` URL parameter.

### Polish/Refinements
- Added `tailwindcss/forms` to the project and removed some explicit form element classes in favor of using Tailwind native



## 1.2.66
This release would have been more significant, but I wasted like 3 hours fighting Lemmy's stupid API.

### Polish/Refinements
- Standardized headings in `/profile` section
- Rearranged `/profile/settings` page to make better use of space
- Made `select` menus properly light/dark mode, gave them icons and labels, and set them to full width of container.
- Hid option dropdowns on user profile pages when there are no submissions


### Community Explorer
- Added site sidebar to community page
- Added additional community info to list items (creation date, NSFW tag, indicator if community is mod-post only).
- Re-aligned selectors and search bar
- Communities are now sortable*
- Default view is now "local"

\* _Sort of_.  Lemmy's API is fucking stupid in so many ways.  One such way is when listing communities, the sort types are the same as for Posts (new, old, hot, active, etc) instead of _contextually useful_ sort types like alphabetically  ascending/descending, number of posts/comments/subscribers, etc. 

I tried to work around that and just pull a full list and sort/cache it client-side.  Well, their dumbass API says "nope, fuck you".  Listing communities has a hard limit of 50, so you have to pull them in batches and paginate.  The end result is that each _page_ of 50 results is alphabetized or sorted as selected.

 I also _tried_ to hack around that by calling the community list endpoint recursively, and it worked until scaled to Lemmy World size.  It's not feasible to recursively pull 560-some pages of 50 communities each, sort them, and then render.  Half of those are just communities people have created to squat on and have no content, but I digress.
 
 Any further enhancements will have to wait until Lemmy's community list API is less fucking stupid and when I'm less grouchy.






## 1.2.65
This release focus mostly on refactoring, cleanup, and organizing the profile section.

### Bugfixes
- Accidentally had duplicate `id` on both post card and video embed. Gave videos unique `id`.

### Enhancements
- Vimeo embeds can now autoplay in posts if you have that option enabled (default is off)
- "Saved" posts are now under your profile section. Removed old `/saved` route.
- "Inbox" is now under the profile section. Removed old `/inbox` route.
- All sub-pages in the profile section now have a common layout with your user info in the sidebar
- Created new `UserCard` component to reduce redundant code.



## 1.2.64.1
### Bugfixes
- Fixed bug where sometimes community sidebar is hidden on mobile and is unable to be restored
- Changed all the multi-select buttons to dropdowns to save some space on mobile

### Sidebar Refinements
Still not sure this is how I want it, but it's a step in the right direction.
- Made admin and moderator lists collapsible (collapsed by default).


## 1.2.64
### Bugfixes
- Post links in compact view were not respecting "open links in new tab" preference.
- Made sure moderation menu was always one spot to the left of post action menu
    - Caused issues on mobile where the mod menu opened too far to the left.
- Fixed bug inherited from upstream that threw an error when refreshing profile page.

### Changes
#### Moderator and Admin Visibility
The current implementation is probably not how these will stay, but I did want to at least get them up there and plumbed in.  I'll likely polish the way they're rendered to be a little less "list" like.

- Moderators are now listed in the community sidebar.  

- Community moderators now distinguished in comments

- Moderators are distinguised in post headers in `/post/{instance}/{postID}` pages.

- Feed does not currently show mod badges.  The community moderators are not returned in the `/api/v3/post/list` call, and it's not really worth it to do a separate call for each post that's returned to get those to add the badges. 
    - Looking at Lemmy-UI, it doesn't apply badges in the feed either, likely for the same reason.

- Admins are now visible in the site sidebar

**Note**: I don't think it's been explicitly stated, but the "Admin" badge only shows for admins local to the instance you're logged into. 

#### Community Card (Mobile View)
Removed the individual buttons for the community actions and put them into a menu in the card.







## 1.2.63.1
Happy Friday.  This is just a tiny point-release to fix a few bugs that got overlooked in the last release.  Hoping to step away for the weekend, so wanted to get this out to fix the annoyances I noticed in 1.2.63.

Have a great weekend.

### Bugfixes
- Fixed bug with post preview so that it always previews in "post" mode rather than "feed" mode (compact is never used in "post" view).  
- Fixed bug where YouTube-style embed URLs were sometimes generated with a double slash (e.g. `/embed//{videoID}`).  YouTube didn't care about that, but Invidious was throwing an uncessary and unwarranted tantrum over something that it should have just handled.


### UI Changes
- In compact view, clicking the thumbnail (or thumbnanil placeholder) will expand the compact post into a card post.




## 1.2.63
This branch kind of got away from me, so I should probably have bumped the version a bit more than 0.0.1.  

### Bugfixes
- Restoring post from draft now sets the community correctly.
- Disabled post and comment vote buttons for guest/unathenticated users.
- Fixed bug with form submission getting stuck if there was any kind of error during the POST.

### Enhancements
- Debounced the community filter search box.  Now faster and more efficient.
- Added browser-agnostic clear button to community filter and changed it to a regular text input.  Firefox, I love you, and you're perfect, but why the hell do you _still_ not have a native "clear" button on search input types??

### Additional Media Sources/Formats
- Added support for Vimeo embeds

### New Features
### Compact Post Expansion
You can now expand/collapse individual compact posts into cards as you scroll. Kind of the best of both worlds, especially if you have media enabled in the feed. 

### See Full Post Body Text in the Feed
In "Card" view mode, if a post has a body content of more than 120 characters (the current cutoff point for the preview), it will now present an "expand" option to see the full post body right in the feed. 

You can even mix and match those in one post.  If you're scrolling in compact mode and see a post that interests you, you can expand it into a card for more details and then expand the fulltext.  All from the feed.

### Theater Mode
The "theater mode" experimental feature is now available by default.  Theater mode will hide both left and right sidebars, expand the video card to fit the space, and center the video player in the window.  It is available for Youtube*, Vimeo, and inline video posts.  Clicking it again will restore the window to normal.  You can also move the sidebars back manually if you want.  This feature is available in the feed and when viewing a post.

I don't know why I added that.  I guess if you want the video bigger but don't want to commit to fullscreen?  Anyway, it's there. 

*Includes Invidious/Piped


### UI Tweaks
- Removed borders around comment vote buttons (now matches post vote buttons)
- Post create/edit form has cancel button (if `lastSeenCommunity` is set)
- Removed borders around `tertiary`-classed buttons to flatten them.
    - Navbar buttons
    - Post/comment action menu buttons
    - Post/comment moderation menu buttons
    - Comment reply
    - Sidebar expand/collapse buttons
    - On-screen navigation buttons in post view ("return to feed", "scroll to top/bottom")
- Added toast messages to comment save and share actions to indicate they've done something.
- Decreased size of profile delete buttons in account submenu
- Post action and moderation menus open to the side. Again.  I just can't deal with them opening below and always having to scroll down.  There's got to be some way to prevent the clipping when they open `top-right` near the top of the screen.
- Added directional arrows to pagination buttons



## 1.2.62
One major enhancement, lots of tweaks, and several bugfixes.  The bugfixes were adjacent to the feature enhancement which is why they're so specific.

### Post Creation and Editing
I've completely overhauled the post creation/editing process, specifically previewing your submission.  Instead of simply rendering the markdown in the post body, it will run the post draft through the full `Post` rendering stack and show you exactly what it will look like (assuming you're posting an image or embeddable media).

The post form is also much more accommodating with more room to see what you're actually typing.  

#### Known Issues
**Bandcamp**: Because Bandcamp embeds do not have a 1:1 relationship between the URL you share and the URL used for embeds, they rely on Lemmy backend retrieving the page metadata to grab the embed URL.  Because of this, previewing a post with a Bandcamp URL will not show the player.  

**New Article Posts**: Previewing a new post will not show the article thumbnail as it doesn't exist yet (that is retrieved by Lemmy on the backend _after_ the post is submitted.

I can hack around those by fetching that metadata in the UI, but I'm not sure if that's worth doing or not.  For now, noting these as known issues/limitations.

### Crossposts
I forget which version I changed this in, and I forgot to document it, but the crosspost behavior is now slightly different.

Before it would quote `>` each line.  I personally hate that since it also messes with the paragraph spacing in various Lemmy frontends.  So, I put a stop to that in Tesseract.  It will still add `cross-posted from : {original post}` at the top, but the rest of the post body will be unquoted.


### UI Tweaks
- Modal can now be specified to be full screen height.  Particularly helpful for editing posts so the markdown editor isn't like 3 lines.
- Reduced length of post body preview text in feed from 350 characters to 120.
- Moved "submit" button for new posts/post edits to top-right instead of the bottom.
- Increased comment edit textarea to 15 rows. Was getting a bit claustrophobic.
- Post action and mod menus now open bottom-right again (was top-right).  I keep moving these to make it easier to do mod work on mobile. Bottom-right always makes you have to scroll down, but top-right sometimes goes offscreen if the post is near the top of the screen.  I haven't tried bottom-right since I shrank the menu items, so hopefully that helps.

### Community Page
- Continued work on refining community page reflows
- Buttons are now `primary` (white in dark mode, black in light mode). 
- Adjusted centering on community dates/counts in card
- Moved all community action buttons into card when sidebar reflows
- On reflow, community card mostly matches the width of the posts.


### Bugfixes
- Fix bug where "NSFW" flag was not read into post edit form (always defaulted to false).
- Fixed bug where post flags (saved, deleted, nsfw, featured) were not reactive and only appeared if the page was refreshed.
  - To do: "Removed" badge is still being obstinate, though.
- The "Share" and "Mark as Read/Unread" post actions now pop up a toast to let you know they've done something.
- Fixed bug where editing a post wouldn't reflect without a page reload.


## 1.2.61
Mostly a lot of little stuff in this release.

### Bugfixes
- Fixed bug where community description was not changing when switching between communities without a full page refresh.
- Fixed the hack I had to put in place to make sub-menus possible.  Menus now close when expected and stay open when they should (no more hacks needed)

### Community Pages
- Moved community settings and community modlog buttons into the community card rather than below.
- Community card sidebar now reflows above the posts on `/c/{community}` rather than hiding in a modal.  The community description is hidden in mobile view, though.
  - Added "Info" button in community card mobile view to show the community details/info/rules. Hidden when sidebar is available. 

### Account Management
Added account delete buttons to the account drop down in the profile menu.  

### UI Tweaks
- Right-hand sidebars hide at larger breakpoint
- Tweaked margins a bit
- Tweaked max-width of sidebar at various breakpoints
- Changed selectors for feed source and sort to be single element dropdowns


### Modlog Related Updates
When you click the "modlog" button from within a community, it will filter the modlog for that.  It will also adjust the modlog page title and heading to reflect the selected community as well as hide the community filter search.





## 1.2.6
This is a fairly major update, though you probably wouldn't notice at first glance.

Completely re-implemented the way posts are rendered.  If nothing looks different, then I have succeeded.

The only noticable difference is "Compact" view has had a complete refresh (which is why I had to re-implment everything else).  It may be subtle, but it does look a lot better and is more flexible should I want to change it later.

A "list" view was requested, but I think that conflicts with one of the project's goals.  Doing a proper list view would not work well on mobile, and desktop-mobile feature partity is a priority.  To that end, I think "compact" view is about as small as I want to implement for the time being.  I'm also really tired, and just the thought of implementing another view and plumbing it in makes my headache even worse.

### Other Updates
- Added margins to Reports, Saved, and Search views 
- Added Cards/Compact view switcher to Reports, Saved, and Search views
- Put in a replace for `&amp;` in community names in the sidebar, community header, and community cards to show an ampersand.
  - Lemmy's overzealous escaping is getting on my nerves. This will do for now.
  - Need to move to utility function and also do the same in markdown for `&lt;` and `&gt;`
- There is now a "Community Modlog" button in the community sidebar.  It will load the modlog filtered for that community.

#### NSFW Community Tagging
Added an optional (default on) "NSFW" tag that will show on communities marked NSFW.  Shows in the sidebar list (when expanded) and in the community header when browsing a particular community.

To disable by default, set the `PUBLIC_TAG_NSFW_COMMUNITIES` environment variable to `false`.  Users can also adjust the behavior by unchecking that option in the app settings.

### Bugfixes
- Fixed bug where some links weren't getting the proper tooltips set
- Fixed a few more NSFW blur inconsistencies
- Loading a post always loads the full-res version now.  On mobile, the post was grabbing the low res thumbnail source instead of the full res one. 
- Pretty sure I fixed all the bugs introduced with the post render revamp. Have tested thoroughly, and I think they're all squashed.





## 1.2.59
- Moved "Accounts" menu and account switcher from sidebar to profile menu.
  - The "Accounts" button in the profile menu now opens a sub-menu to either manage or switch between accounts.
- Changed default config option for "expand moderating list" to false since "subscribed" and "moderating" lists are now mutually exclusive. Prevents inconsistent behavior on first load.


## 1.2.58.1
### Out of Band Release / Bugfix
Markdown component was getting an unhandled error _sometimes_ and killing the rest of the thread.  Added try/catch to handle it gracefully.


## 1.2.58
### Sidebar Enhancements
Gotta say, I've been putting the community filter off for a while, but I'm glad I finally implemented this.  Such a quality of life improvement.

- Added community filtering in the sidebar.  You can now filter your subscribed communities for quick access.
- When collapsing/expanding "Subscribed" or "Moderating" lists in sidebar, they're now mutually exclusive.  If subscribed is open, moderating will close, and vice-versa.  
- Added indent to community list
- Fixed subscription count badge contrast in light mode


### Components
- Added input type "search" support to `TextInput` component.
- To do:  Manually implement a "clear" button for the search field because Firefox still does not support that natively :sigh:



## 1.2.57
### Password Reset Handler Part II
I wrote the part to _send_ the password reset email, but forgot to write the hanlder to validate the token and _set_ the new password.  That has been added, and password reset functionality is now 100%. 

Last remaining item for account management is normal password change.



### UI Refinement
Nothing groundbreaking but quite a few UI tweaks that add up to a lot:

- Moderation and post action buttons now open to the left of the button instead of above/below.
- Added site logo and name to top of legal page and front page
- Legal page is now instance specific
- Removed some excessive padding to make page cleaner
- Added "scroll to top/bottom" buttons above/below posts along with "return to feed" button.
- Made the above mentioned navigation bars optional. Default is off.

- Fixed "bouncy" collapse/expand button right-hand sidebar

- Added slight margins to `/post` view
- Capped the width of posts/comments in `/saved` lists until I figure out what I want to do there. Looks much cleaner.

- Profile menu now shows your display name instead of username (username if you haven't set display name)

- Removed Modlog and Admin links from sidebar and navbar, respectively. Both are now located in profile menu.

- Menus are more compact now

- You can toggle light/dark mode by clicking the Theme button in the profile menu




### New Configuration Options
#### Disable Modlog for Regular Users
This setting controls whether regular users will see the Modlog button in the UI.

Note that the modlog API endpoint does not require authentication.  This _will not_ prevent a determined user from looking at your modlog.  If you are also running Lemmy-UI, they can also just view the modlog there.  

To use this option, add an environment variable called `PUBLIC_DISABLE_MODLOG_USERS=true` .  If omitted, it will be treated as `false` (default behavior), and modlog button will be visible to all.

There is no way to set this via the UI as all data stored is local.

#### Accessibility Buttons
You can now change whether the "Back to feed", "jump to bottom", "jump to top" buttons are shown.  These are useful in some cases, clutter in others.  You can now turn them off in your app settings.


### Security
Tightened up routes that take the current instance into account.

If Tesseract is admin-locked to a specific instance, routes like `/legal/{instance}`, `/forgot_password/{instance}`, etc were already properly working against the admin-defined instance, but the URL still showed whatever instance the user provided. Now, there is a redirect to `/{page}/{defined_instance}` to remove any ambiguity.

For example, in prior release, if you browsed to `/signup/lemmy.world` but Tesseract was locked to, say, `lemmy.ml`, the signup page would have all of the details for `lemmy.ml` and you would be signing up against that, but the URL would show `lemmy.world`.  

While this didn't cause any technical problems, it could be ambiguous or confusing as to where you're signing up.  Now, under the same configuration, if you browsed to `/signup/lemmy.world`, it would redirect you to `/signup/lemmy.ml`.



## 1.2.56
### Added Support for Bandcamp Embeds
Bandcamp links are now recognized. Just drop the link to the album/track page from your browser. 

Their embed player just does not scale well.  Had to go with their smallest player option and hack it together with the thumbnail image provided by Lemmy (with a hefty helping of `margin-top` abuse along the way).  The important part is that it is responsive up to their player's maximum size (128x627 px) and doesn't show a bunch of ugly white space when scaled beyond that.  This is "good enough" in that it looks acceptable on desktop while also scaling down for mobile.  Not what I had in mind when I started this, but it's the least-awful way I've been able to achieve what I set out to do.  Seriously, their embed player _sucks_.

I think that's all for this release.  I had backburnered adding support for Bandcamp because I knew their player was going to be a challenge, but this was ridiculous and involved re-evaluating expectations multiple times and finally hacking something together.

Y'all better use this. lol



## 1.2.55
### Bugfixes and Optimizations
- Fixed bug with `/login`, `/forgot_password`, and `/signup` where they were sometimes not detecting the specified instance. 

- Fixed bug that allowed logging in or signing up to other instances when Tesseract is configured to be locked to a specific one
  - Not really a security issue, per se, but an issue nonetheless

- Removed some more unused `import`s in several components to reduce overhead

- Removed `validateInstance` from the login submit function since it's pre-validated before the page is rendered (if the instance is invalid, the login page will throw a controlled 500 error because it couldn't fetch the site name/logo).

- Fixed another `select` grey on white bug that only existed in Chrome(ium).

### UI Enhancements
- Added "Return to Feed" and "Scroll to Top" buttons to the bottom of post page (below comments)
- Can now toggle between compact post and cards from the feed, community feed, and profile view.
- Option buttons on top of feed/community/user pages are now less intense




## 1.2.54
### Bugfixes and Such
#### Signup Process
Fixed two bugs with the signup process:

The submit function assumed a JWT was returned on successful signup.  If email verification and/or applications are required, no JWT is returned.  That was causing an erroneous "Invalid credentials" error toast to pop up even if the signup was otherwise successful.
 
 Second, upon successful signup, the signup page just left you there with the submit button spinning.  This is due to the above expectation of a JWT that was not issued.  It now redirects you to the homepage.

 #### Email Verification
 There weren't any bugs to fix, but I made the process cleaner as well as created a landing page explaining the next steps to the user.  This is mostly to reduce confusion in the lag between "email is verified" and application is approved; users often try to log in and cannot until they are approved.

 #### Forgot Password
 Added error checking/handling to the `getSite` call that happens in the background

### Sidebar Enhancements
Reimplemented the way the community sidebars are collapsed/shown.  
- The button is now part of the sidebar (rather than at the top of the post).  
- Sidebar can be collapsed in the feed and post views.  
- Site sidebar can also be collapsed now
- Put site and community icons, names/addreses, and stats in cards (similar to how profile views now are).


## 1.2.53
This is a pretty feature-ful update.

### Accounts Mangement
- If Tesseract is locked to a particular instance, and there are no accounts setup yet, it will take you straight to `/login` and bypass `/accounts`.
- Hid references to setting guest instance if Tesseract is locked to the one configured by the admin (formerly, those were simply disabled form elements)
- Login button in sidebar now goes to `/login` (if not locked to instance) or `/login/{instance}` if instance locked

### Login Page
- Login page no longer asks for domain.  Added an interstitial page where it asks for your instance (like `/signup`).
- Login page now shows the site icon and name for the site you are logging into.


### Implementing Some Missing Features
#### Legal Page
The admin-defined `legal_information` is now rendered on a page at `/legal` like in Lemmy-UI

#### Password Recovery
- Password reset functionality has been added at `/forgot_password`. 
- Added "Forgot password" link to the login page

### UI
- Decreased sidebar width to 18%.
- Trying to make the width configurable in a way that sticks, but efforts to date have been problematic.
- All account pages (signup, login, and forgot password) now show the instance logo and title at the top to make it more clear which instance you're working with.
- Window title now reflects the Lemmy instance you're connected to.




## 1.2.52
### Sidebar Improvements
- Removed the hacks I had to make the sidebar behave; added a missing `flex flex-col` class to the community list container div to resolve.
- Community icons are now visible again when sidebar is collapsed.  Whoo hoo!
- Removed up/down arrows that used to collapse the accounts/moderating/subscribed sections. The header/button now performs that role.
- All sidebar buttons now have tooltips. Makes it much, _much_ easier to use while collapsed, especially to switch between accounts.

### Bugfixes
- Fixed unhandled exception in date handling component
- Removed "+Z" from a function that takes the date from the API, creates a date object, and passes it to a function that returns a relative date (e.g. 1 mo ago). API may be sending an incorrectly formatted time, but it works fine without the timezone and there's an upcoming fix to send the proper timestamp. 


## 1.2.51
### Security
Added and tuned CSP directives

### Sidebar Updates
- Accounts section is now collapsible
- Accounts button now toggles the expand/collapse of that section
- Moved button that takes you to `/accounts` to a button _within_ the collapsible section. Renamed to "Manage Accounts"
- Turned `Moderating` and `Subscribed` headers into buttons which expand/collapse those sections.  Looks a lot sleeker
  - Up/down arrows to the right of those are now redundant.  Considering removing them.




## 1.2.50
### Bugfixes

- Fixed NSFW blur not applying to compact view in feed (cards were fixed in 1.2.42)

- Updated comment vote arrows to match those used for posts. Left borders around those (for now?)


## 1.2.49

### Feed
- Increased gap between posts a bit
- Increased margins in post to give them more of a card feeling. 
- Increased default feed image size to extra large to account for the increased margins. Only the default setting was changed. Existing preferences will take precedence.
- Default option for "Fade title of read posts" changed to false. Again, existing preferences will take precedence.

### Posts
- Changed vote button design and flattened it and the comment button
- Limited YT-style videos to 88% viewport width even when "full-width" is selected. This keeps them from getting too large with both sidebars collapsed (would often get cropped by the navbar).
- 

## 1.2.48

### Infrastructure
Cleaned up the custom types defined in `lib/components/lemmy/post/helper.ts` and used in most `Post` components.

### Feed and Post Image Sizes 
The options for setting the image and video sizes are more sane now.  Instead of images vs videos, it's now feed versus post.  All media in the feed will be sized based on your "feed" setting, and all media in posts will be sized according to your "post" image size selection.

**Notes**:
  - Since the setting structure changed, inserted a migration step which _should_ negate having to flush LocalStorage because of this.
  - If the app fails to load and/or has errors in the console, flush local storage.

### Code Syntax Highlighting
Added additional setting to enable syntax highlighting for inline code.  Note that this depends on highlighting being enabled in code blocks. It's not currently bound to the state of that option.

### Experimental Features
Added support for experimental features that are disabled by default but can be enabled by the user. In the settings panel, there's a checkbox to "Enable experimental features" which will enable them all.

**Theater Mode**

When opening a post that contains a YouTube video, there is a button next to the post actions that will enter "Theater Mode".  It works similarly to YouTube's in that it hides both sidebars and scrolls the video fully into view.  Kind of a pseudo-fullscreen.  I don't know why I spent an hour and a half implementing this since the actual fullscreen button is like 10 freaking pixels away, but it's there. I guess it could be useful if the video has fullscreen option disabled for embeds. 

## 1.2.47

### Bugfixes
- Fixed bug introduced in 1.2.46 that caused the user/community/site sidebars to grow far too large when the window size reduces.
  - Backported to 1.2.46 and re-released

### UI
Trying to elimiate more dead space, or at least make it less apparent.
- User/community/site sidebars stay open for a greater range of screen width.

- Added margins to post feed cards

- Refined user card in profiles. Now always shows their display name (when available) and their @{user}@{domain} fully-qualified name below that.

### Modlog
- Added more specific action details to modlog:
  - Temporary vs Permanent instance/community bans are now indicated along with the expiry date for temp bans.
  - Reworked column widths for better display
  - Added instance to the moderator names



## 1.2.46
This release has a lot of under-the-hood updates.  


### Settings 
Cleaned up unused settings values and combined related ones into objects.  I did this not because it was easy, but because I _thought_ it would be easy.  

The configuration object that's saved to LocalStorage has had a big cleanup.  If you have existing settings, you'll notice that some options are not set correctly after updating to this release.  

It is advised to either clear your LocalStorage or at least go into your Tesseract app [settings](/settings), reset them to default, and reconfigure to your liking.


The following `env` vars have been removed:
- `PUBLIC_EXPANDABLE_IMAGES`
- `PUBLIC_REVERT_VOTE_COLORS`
- `PUBLIC_FULL_WIDTH_LAYOUT`
- `PUBLIC_EXPAND_SIDEBAR`
- `PUBLIC_NEW_VOTE_BUTTONS`

You may safely remove those from your `docker-compose.yml` or however you were passing them to Tesseract.

### Sidebar Update
Ok, so the sidebar is a bit of a rework-in-progress.  It needs to be totally re-written to do what I want it to do, and I don't have time for that right at this moment.  However, there were some quality-of-life improvements that I _did_ want to implement, so it's in kind of a hybrid state right now.

- `Moderating` and `Subscribed` lists are still collapsible as before, but they're limited in height to the screen height; the sidebar no longer scrolls beyond the viewport height.  
  - Each of those sections now scrolls independently.
  - Changed the way the communities were hidden so it's much faster now.

- When the sidebar is collapsed, instead of the community icons remaining, they're hidden now (this is the hacky fix to make it sort-of do what I want without the full re-implementation that it needs).

- The open/close state of the `Moderating` and `Subscribed` lists is now saved to LocalStorage and will persist.

- The ugly subscription counts I had in place are now less-ugly badges.

### Modlog
- Added `expires` to `ModLog` interface for `mod_ban` and `mod_ban_from_community` and added "Expires on M/D/YYYY" to "Action" column in table view and below the Action in card view.

- Limited "Content" column to only show the first 120 characters of the removed content; table mode only. Card view will still show the full content.

### Moderation
- Ban modal now uses a date picker instead of having to type in the date in the correct format. Still optional, and omitting the date results in a permanent ban as before.


### ~~Experimental: Initial Markdown Emoji Support~~
Note: This has been removed from this release.

I had used `markdown-it-emoji` to add emoji support to the markdown editor, but it is incompatible with Lemmy-UI as it only _renders_ emoji codes but does not replace the text with the emoji unicode characters.  

Next attempt will likely use emoji picker or something that will drop in the actual unicode characters to maintain compatibility with other Lemmy frontends.





## 1.2.45
- User profiles rolled up into nice badges

- Grabbing larger thumbnail for user profile images; keeping same size.  Avatars were fuzzy at 48x48.  Still renders as 48x48 but with a {width*2} thumbnail size (128).

- Inline images in posts/comments can be disabled. Post images will still show, but any inline images in the post body or comment markup (e.g. `![Alt Text](https://example.com/image.png)`) can be configured not to expand inline and show a link instead.  Good for bandwidth-conscious usage.

### Bugfixes
- Fixed white on grey `<option>` values in theme selection menu (Chrome[ium] only).


## 1.2.44

### Posts/Comments
- Code blocks now support code syntax highlighting.  You can toggle this behavior from the app settings. Default is on.
- Removed "new" vote design and supporting code
- Removed "revert vote color" option.  Upvotes are blue, downvotes are red. This isn't Reddit; deal with it.

### YouTube Support
- Fixed bug where `m.youtube.com` was omitted from the detection function.

### Misc
- Addressed a few more a11y warnings.
  - Fixed '`<iframe>` element requires `title` attribute' in YouTube, Spotify, and Soundcloud components
  - Cleaned up [Settings](/settings) page to match format used in [Admin](/admin)

- Profile pages now show user's combined post/comment score

### Infrastructure
- Finally got rid of that `images.ts` file and moved all of those post helper functions into `helpers.ts`
- Added proper PostView types where I was formerly using `Object` types.
- Documented a few env var config options I neglected to do earlier

## 1.2.43
### Media 
- You can now set your preferred size for post images and media (videos, Spotify embeds, etc).  Your selection will be used as the maximum size. Note that it will not scale an image larger than the source.  You can set separate preferences for images and videos/embeds.

    - Embedded videos in the feed are sized according to your image size preference. 
    - Embedded videos when viewing the post are sized according to your video size preference.

- Added `end` time support for YouTube-like embeds.  In addition to the `start` parameter that was already supported, you can specify `end` in the YouTube URL to set a preferred stop time, in seconds, from the start of the video.

- Added option to enable autoplay for YouTube videos when opening posts (not available in feed for obvious reasons)

### Post Cards
- Standardized 1px margin around post images (same as used with embeds) for consistent layout.

### Action Menus
- Action menus now appear above the button rather than below. Should make it easier to use mod tools when on mobile. No more constant downscrolling to get to the options!

### Sidebars
- Removed 'About' from sidebar. Still acccessible from profile menu
- Community sidebar can now be minimized when viewing posts

### More NSFW Blur Fixes
- Fixed another broken NSFW blur with post image thumbnails.


## 1.2.42
### NSFW Blur Fixes
- Fixed bug with NSFW blur applying to the post instead of the feed. Not sure if inherited from parent project or introduced in the fork; all testing was done against an instance that did not allow NSFW and with the profile option to "Show NSFW content" disabled. 
  - Updated testing scenarios to account for NSFW content.
- NSFW blur now applies to embedded content.  If "Blur NSFW" is enabled, embeded content marked NSFW will instead show a thumbnail in the feed, regardless of embed media settings, and the thumbnail will be blurred. Clicking into the post will show the embed (if that option is enabed).
- Changed verbiage for "Blur NSFW" setting to indicate it only applies to the feed. Content will not be blurred in the post.

## 1.2.41
### Admin Panel
- Put config sections into `<Setting>` cards to give it better spacing and more contrast on `/admin/config` and `/admin/instances` pages.
- Moved `Setting.svelte` component from `routes/settings` to `lib/components/ui`



## 1.2.4
### Media Handling
- Updated YouTube component to recognize and embed YouTube Shorts links :sigh:

### Admin Panel
- Added option to enable/disable captcha and set the difficulty level
- Rearranged layout
- Moved "Save" button to upper-right corner rather than bottom
- Options not applicable to the "registration mode" selection will be hidden.

  


## 1.2.3
### Modlog Tweaks
- In table view: Combined "Content" and "Link" columns to reduce table width.
- In card view: Added background div to cards for some contrast and put `<hr>` below the community info.
- In both: Updated `<Link` elements to use the user's "open in new tab" preference.

### Feed Tweaks
- Post body preview now renders the markup instead of the inline code.

### Settings
- Added toggle to set preference for showing the modlog in card view

### Admin Panel
 - Changed layout to make editing sidebar and legal info easier.

### Markdown Editor
  - Bound markdown preview container divs to TextArea rows*24 to keep them the same size (unless resized :sigh:)

### Layout
  - Moved Modlog button out of the site card and into the sidebar and nav bar


## 1.2.2
No user-facing changes in this release. Updated project dependencies to use latest versions explicitly. 
 - @sveltejs/kit from 1.24.0 to 1.24.1
 - @sveltejs/adapter-auto from 2.0.0 to 2.1.0
 - @types/markdown-it" from 12.2.3 to 13.0.1
 - autoprefixer from 10.4.14 to 10.4.15
 - postcss from  8.4.24 to 8.4.29
 - svelte-check from 3.0.1 to 3.5.1
 - tailwindcss from 3.3.2 to 3.3.3
 - tslib from 2.4.1 to 2.6.2
 - typescript from 5.0.0 to 5.2.2
 - vite from 4.3.0 to 4.4.9
 - vitest from 0.33.0 to 0.34.3
 - @dicebear/core from 6.0.4 to 7.0.1
 - @dicebear/initials from 6.0.4 to 7.0.1
 - lemmy-js-client from 0.18.0-rc.2 to 0.18.3-rc.3
   - Current is 0.19.0-rc.8 but it fails spectacularly (which I expected). Assuming that's because it's written against the upcoming 0.19.0 backend which has incompatible API changes. Will have to keep an eye on this and start testing against 0.19.0 RC as soon as it's available.
 

## 1.2.1
- Fixed bug introduced in 1.1.81 which disabled spellcheck by default for text areas. Should have been default `true` and only disabled where desired (e.g. allowed/blocked instances lists)

### Managing instances is now easier than ever (even in Lemmy-UI)
I think the current implementation is probably the best compromise between the current Lemmy-UI itemized list and the old Lemmy-UI text field as it allows both mass edits as well as easy ability to find/remove individual entries.  It also sorts them alphabetically which is incredibly convenient.  

  - Added dedupe logic on submission of blocked/allowed instances. Will remove duplicates to prevent API error and make it easier to import new items to the lists.
  - You can add one per line (no comma necessary) and/or drop in a comma-delimited list of domains; it will handle both.
  - You can drop in the base URL with the scheme and slashes, and it will filter those out automatically.
  
  - Stripped out empty entries (e.g. if you have an extra newline in the instance list) so those don't get sent to the API).
  - Fixed bug where not all schemes and slashes were being removed.
  - Increased text area and preview pane sizes.
    - To do:  Modify components so a desired size can be programmatically set (e.g. different sizes for posts vs comments)


## 1.2.0
No new features but updated to Svelte 4.2.0 and SvelteKit 1.24.0 which required some refactoring in quite a few places.

## 1.1.81
- Added link back to the community main page from the community sidebar. 
- Improved UI for managing instances. Is now a text area with one domain per line.  

## 1.1.8

### Instance Management
- You can now manage blocked/allowed instances from the admin panel.  

### Admin Panel
- Fixed broken checkbox toggle for "Enable NSFW" option. It was missing the `bind`.

That's all for 1.1.8.



## 1.1.71
- Added another wrapper div around embedded iframes to give uniform margins. Looks a lot cleaner, especially on mobile (top/bottom were consistent, but left/right sometimes went to zero).


## 1.1.7
Enabling embedded media is more granular now.  This is particularly helpful when running on mobile where you may not want to embed every YouTube video in the feed but still want to view it without leaving the app.  

I added a migration step to update the old, all-or-nothing boolean toggle to the more granular version. To keep the change from being shocking, the migration will enable both feed and post embeds to match the old behavior if media embeds were enabled already.

If you currently have embedded media disabled, you will not notice any changes.

The default behavior has also changed:  By default, media embeds are disabled in the feed and enabled in posts. You can change this in the settings.

### Changes to Media Embeds
You can now select whether media should be enabled in feeds or posts separately.

**If disabled in the feed and disabled in posts:**
  - Thumbnail will be shown in both locations and the link will go to the external content (optionally in a new tab if you have that preference set).
  - This is the same behavior as unchecking "Enable embedded content" in the previous release.

**If disabled in the feed and enabled in posts (new default behavior):**
  - Thumbnail will be shown and will link to the post; media will be embedded in the post.  

**If enabled in feed and disabled in posts:**

That's a weird choice, but I gotchu fam.

  - Media will embed in the feed. The link will take you to the external content (optional in a new tab if you have that preference set)
  - Clicking into the post will show a thumbnail image

This is the only change in this release.    



## 1.1.5

- Added support for Soundcloud track embeds

- Bumped version signficantly considering the amount of code that has been reworked since the last release. 


## 1.1.21

- Re-enabled the /cors/ image upload handler.  Turns out there was simply an undocumented reverse proxy config that needed to be in place for the `/cors/` path.  Updated Readme documentation with a sample Nginx config.

- Stood up an open, public instance at https://tesseract.dubvee.org so people can see it live.

- Cleaned up my rats nest of a build environment.

- Completely reimplemented the embedded video handling, and it's so much cleaner now.  Has a list of Piped and Invidious instances used to detect YouTube-style links to determine if a post should render as an embedded video.  Supports all of the public [Invidious](https://docs.invidious.io/instances/#list-of-public-invidious-instances-sorted-from-oldest-to-newest) and [Piped](https://github.com/TeamPiped/Piped/wiki/Instances ) instances as sources.
  - Removed Piped support for embedded players.  Many don't work with iframes or are too slow. 
  - You can select your preferred YouTube frontend in the settings.  Default is YouTube.  Setting to Invidious will allow you to select an instance from the dropdown menu to use.
      - To do:  Allow user-defined Invidious URL

- Added dedicated component for Spotify so the player is appropriately sized and scaled. 

- If "Enable embedded content" is disabled, YouTube, etc posts will show the thumbnail instead of rendering as a bare link post.  Looks much better.

- Links should now open in new tab if you have the preference set. Any I missed can be considered a bug that should be reported.

- Hid setting to "Open posts in a new tab" since the functionality is not yet implemented beyond storing the state of the setting.  Considering whether or not this is something to just scrap.

- Bumped version again to 1.1.4 after today's updates so far


## 1.1.14
- Removed code for the random placeholders in input fields and associated settings

- Considering rebranding again from Tesseract to Tachyon to reflect the project's *Photon*ic legacy.

- Added action buttons above posts to return to the feed and reload the comments

- Added tooltip support to buttons. Added tooltips to post action buttons.

- Removed click binding on modal background blur div. I've accidentally clicked out of an edit SOO many times because of that. Modals must now be explicitly closed via the 'X' in the corner or via button action.

- Increased modal size to 4xl

- Removed max-w-full from comment container in components/lemmy/comment/Comment.svelte to keep community sidebar from overflowing sometimes.

- Adding "Moderating" and "Subscribed" headings to community lists in sidebar.  Made them collapsible.

- Decreased maximum width of sidebar from 25% to 20%


## 1.1.5
- Began initial fork work

- Rebranded with new name and logo. Keeping base version of upstream project and incrementing it separately.

- Added missing route and logic for `/verify_email` so that admins can use Tesseract as their default UI without relying on Lemmy-UI to handle email verifications during signup (needs cleanup, but works and is secure).

- Rewrote Dockerfile to be a two-stage build on the `node:20-alpine` base.  Reduced resultant image size by ~400%

```
tesseract              010c0f9a8fdc   33 seconds ago   337MB
ghcr.io/xyphyn/photon  bf93f0193414   24 hours ago     1.35GB
```

- Removed `/cors/{instance]` path on upload image handler since it is not needed when operating at same domain as Lemmy BE. This probably broke non-instance specific usage, so probably need to define that via server setting.

- Added additional Invidious instances to select as YouTube frontends.
  - To do: Move those to a settings dropdown and allow user to select one instead of choosing them at random.

- Added initial support for user-defined "open in new tab" behavior. Default setting has been established, env var support for setting default, and user settings panel added.  `Link` component now has additional attributes:  `title` for setting tooltips and `target` for determing `_self` (default) or `_blank`.
  - To do:  Update instances of `Link` where appropriate to adhere to the user's preference.

- Redesigned the layout of the Settings page. Removed UI toggles for features I'm planning to remove.

- Added community sidebar to post view.


