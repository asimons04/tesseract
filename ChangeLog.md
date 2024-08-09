# Changelog for 1.4.x Series (Intrepid)
All major/minor changes between releases will be documented here.  

## 1.4.10

### Bugfixes/Enhancements
- [c8e541bd] Make `capitalize` class toggleable on modal titles; capitalize community names when rendering community profile modal

- [8c78432a] Added missing modlog actions:
    - Transfer Community
    - Remove / restore community

- [8c78432a] Remove 'reason' placeholder in modlog details and make reason a conditional display element

- [f13796e8] Tweak `@user@instance` regex pre-processor to ignore patterns that are part of a URL (e.g. Mbin's stupid /u/@username actor id format)

- [5a99e6d0] Add support for accented characters in hashtags

- [e1ea16a3] Reimplement event handlers/forwarders in TextInput component so typescript doesn't bitch and moan

- [d8b67208] Removed redundant hashtag badge-ifier step in markdown link renderer

- [94b7080b] Tweak hashtag regex yet again

- [b2bace2b] Remove unsed imports, including old Fediseer components, from PostMeta compoennt

### Notable Changes
#### Community Management
- [cbb5fae1] Update community mod team management:
    - Indicate community owner / top mod with green badge
    - Add transfer community buttons for admins to assign a new owner/top mod
    - Add conditional verbiage describing mod team
    - Add keybinding to 'submit' when pressing enter when adding new mod

- [4446918c] Community cards now indicate if the community is deleted
- [42e4f09d] Mini modlog in community settings area no longer filters events; shows all relevant events for the community (previously, only showed a subset)

- [94fa370f] Communities can now be deleted/restored by top mods
    - API will not let admins do this, but they can now transfer the communities to themselves and perform the deletes/restores
    - Admins can now "take over" communities if needed (button adds them as a community mod and transfers it to them)
    - Because I can't go one release without complaining about _some_ stupid thing the Lemmy devs did, here's a fun fact:
        - If a top mod deletes the community and then disappears (or deletes their account), there is no way to undelete the community from the API level; you have to set `deleted=false` for the record via the database.  Only top mods can delete/undelete a community, and even admins cannot modify the moderators if the community is deleted (which is a pre-requisite for transferring the community which is a pre-requisite for undeleting the community).  :sigh!:  No idea if that is addressed in 0.19.4 or 5.  

- [1d663b8f] Admins can remove/restore and hide/unhide local communities from the Community Settings page.


---

## 1.4.9

### Bugfixes
- [179a4f6b] Disabled hashtag badge-ification on post titles
- [6635fba2] Ignore pre-linked hashtags during regex pre-processing
- [b14e11b1] Bugfix/enhancement:  Support 'foreign' hashtags that are already linked to outside sources
- [93355eb0] Fixed weird post css inheritance putting 2rem margins (1 top, 1 bottom) on details > summary elements.
- [048c1963] Add `noreferrer` to links
- [76e64610] Fix bug when closing image upload modal via "X" button, current image and alt text not reset.
- [904d21fe] Only collapse bot comments (if enabled) on `/post` pages rather than everywhere.
- [91598f6c] Add step to Dockerfile to clear npm cache after installing runtime deps (image size ballooned up by 200 MB after `file-type` updated and required `strtok3` as a runtime dependency).
- [f3451a14] Enhancement/Change:  Removed `capitalize` class from modal title element. 

### Changes
- [c2cc4b70] Re-wrote User->Blocks page to better keep blocks in sync with UI state for reactivity purposes
- [774192b8] [ad197935] Hide users from blocked instances.  

### New Features
#### Instance Blocking is More Powerful
a.k.a  Instance blocking works like it should at the API level.

When you block an instance in Lemmy, what you're really doing is basically blocking all communities on that instance.  You will still see posts to communities on other instances from users of the blocked one, and you will also still see them in the comments.

There's a new option (disabled by default) under `Settings -> Filtering -> Hide Users From Blocked Instances` that will let you hide any content by users from a blocked instance. 

Like the "Hide Posts/Comments From New Accounts" filtering option, there are some different behaviors / safety mechanisms for mods/admins:

Even with the option enabled, content will still be shown under the following conditions:

- You are a moderator of a community and the post/comment is to that community
- You are a local administator, and the post/comment is to a community local to your instance






---

## 1.4.8

### Bugfixes
- [9add317e] Fixed bounding issue on mobile with markdown images with long alt text displayed 
- [9719b0c6] Fixed the body portion of detail/summary blocks (i.e. spoilers) incorrectly using a `cursor-pointer`. Only the summary portion does now.
- [4a5884f3] Fixed community names in community modals showing as usernames (@community@instance) instad of communities (!community@instance)


### Changes/Enhancements
- [db41ed73] Markdown images in post bodies / comments are now fixed width based on viewport width to look more uniform and less hodgepodge when there are multiple of different sizes.
- [937e6bb4, 3fa2c249] Removed `Top6Months` and `Top9Months` sort options to streamline 


### New Features

#### Collapse Bot Comments by Default [fe3a9192]
Under `Settings -> Filtering` is a new option called "Collapse Bot Comments" (Disabled by default)

When enabled, comments made by bot accounts will be collapsed by default in the comment tree on posts.  If your logged-in account is marked as a bot, they will not be collapsed.



---

## 1.4.7

### Bugfixes / Tweaks
- Text-wrapped community names in crosspost list (typically when on mobile) no longer incorrectly center-justify themsleves
- Fixed z-index for alternate source selector in /profile/user section to prevent it from showing over top of the nav bars when scrolling up
- Fixed regex pattern for hashtag detection so it _should_ now fully ignore any inside code blocks or inline code ticks.
    - Still not perfect, but at least code blocks and inline code won't turn into hashtags (those are more widely used anyway.
    - Hashtags above or between a code block will not linkify. Hashtags must be below the last code block before they will linkify.
    - Inline code can go anyhere without affecting them.
    - Will likely need to wait until I'm using the alternate marked-based renderer Xylight recommended to me so I can, hopefully, differentate code blocks earlier in the rendering chain instead of pre-processing with ugly-ass regex patterns.

### Changes

#### Brought Back the Discrete Listing Type / Sort Dropdowns
Based on feedback from users, I've brought back the discrete dropdowns in the nav bar for choosing the listing and sort options (they had been moved into the quick settings dropdown menu).

#### Quick Settings is now a Modal
Beyond a certain point, the dropdown menus become unwieldy from a UX standpoint.  As I added more options and customizations, the quick settings dropdown was becoming both cumbersome to use and maintain.  To ease that from both ends, I've changed it to a modal. 

It's still accessed from the navbar, but it's also been moved to the right side of the bar. It's the gear icon.

#### Removed Context-Aware Search Button on Mobile
The context aware search (which will search the site, community, or currently-viewed profile depending on where you are) button has been removed on mobile to reduce clutter.  Mobile users will need to use the main "Search" button in the main navbar and select the appropriate filter options.

#### Deprecated Support for /c/ and /u/ User and Community Links
Deprecated support for `/c/name` and `/c/name@instance.xyz` community formats as well as `/u/name` and `/u/name@instance` user link formats.  

Those will no longer be turned into links automatically and are discouraged.  Currently, they turn into email links. 

The Photon dev shot me some pointers for a slightly different Svelte markdown library (that also uses `marked`) but is more capable with regard to customizations.  Unfortunately, I haven't had time to go through and replace that.

I will _likely_ be adding support back once I can stop the autolinking behavior that's turning these into `mailto:` links, but for now (and just in case I don't get back to that), I'm marking those `/c/` and `/u/` formats deprecated and discouraging their use.

The preferred way to link a user in markdown areas is `@user@instance.xyz` and, for communities, it's `!name@instance.xyz`.  

**This should also provide maximum compatibility among clients.**

  The following user/community formats are supported and will be turned into actionable buttons:
  
  **Communities**:

- `!name@instance.xyz`  (Preferred for widest compatibility)
- `https://instance.xyz/c/name`
- `https://instance.xyz/c/name@instance.xyz`
- `https://instance.xyz/c/name@differentInstance.abc` (weird choice, but it's supported)

With these, the text portion of the link will be disregarded since they turn into badge buttons that launch the community profile modal
- `[Any Text You Want](https://instance.xyz/c/name)`
- `[Any Text You Want](https://instance.xyz/c/name@instance.xyz)`
- `[Any Text](https://instance.xyz/c/name@differentInstance.abc)`


**Users**:
- `@username@instance.xyz`  (Preferred for widest compatibility)
- `https://instance.xyz/u/username`
- `https://instance.xyz/u/username@instance.xyz`
- `https://instance.xyz/u/username@differentInstance.abc` (weird choice, but it's supported)

With these, the text portion of the link will be disregarded since they turn into badge buttons that launch the user profile modal:
- `[Any Text You Want](https://instance.xyz/u/username)`
- `[Any Text You Want](https://instance.xyz/u/username@instance.xyz)`
- `[Any Text](https://instance.xyz/u/username@differentInstance.abc)`


### Enhancements
- The community modal has been extended to resolve the community prior to fetching it so that unknown communities can be resolevd transparently when clicked.  Unauthenticated/guest users will receive an error if clicking a community link that the instance does not "know" about (resolveObject is an authentiated call).

- Various UI tweaks/polish where things weren't exactly uniform (modal action buttons, etc).

- Added Quick Settings button to toolbar on post pages

- Updated some logic that relied on `window` in various places.  Hoping to at least partially support SSR sometime, eventually.  I don't like SSR and designed things around CSR, but I would like for the post metadata to be fetchable (which requires SSR support to insert the `<meta>` tags into the `%sveltekit.head%`.

- Fixed quirkiness with post titles. Can now middle-click post titles to open in new tab again as well as right-click to copy link (turned them back from buttons into links but keeping the 'button' behavior)




### New Features

#### Link Previews
Under Settings -> General is a new option called "Preview Links in Modal".  This is enabled by default but can be disabled.  It is also under the quick options.

Clicking markdown links (in post body, comments, sidebars, etc) will do a server-side metadata fetch and render a preview. "Internal" links that load in Tesseract will not preview and simply use the user's "open links in new tab" preference.

The preview includes:

- Link metadata if available (thumbnail image, embed video, description, title)
- Alternate source selector
- MBFC report (if available)
- If link is to a supported media type (YT, Invidious, Piped, Soundcloud, Bandcamp, Spotify, Odysee, PeerTube, etc), will show the media as an embed
- If metadata description contains links, they will preview in the same modal, and a "back" button will be enabled to return you to the previous preview.

e.g.  If someone drops a bare Youtube link, it will render in the modal using your preferred YouTube frontend.  Same for a Spotify, Bandcamp, etc link.  The link is processed through the same rendering chain as posts, so any supported media should render as if it were posted to the feed.

It also has the alternate source selector and the MBFC plugin tied in, so a news article link in the comments can be vetted for credibility, previewed, and followed.

Post links are _not_ tied into this since the post itself acts as the preview / renderer.  This _can_ be implemented, and easily, but it seems pointless to me.  If I get feedback saying it should handle the main posts links through that, then I can enable it or at least make an option to.

#### Badge-ified Community and User Links
Community and user links in post and comment bodies are now badge-ified and load the community or profile modals upon click (versus the old behavior of being a dumb link to the profile/community pages).

Currently, user links are blue, and community links are orange.



---

## 1.4.6

### Bugfixes
- Fixed some filter selections not clearing from modlog when clicking "Reset Modlog Filters"


### Changes/Enhancements
- Post titles now render as markdown
- If downvotes are disabled at the instance level, upvote buttons are now hearts

### New Features

#### Disable Downvotes
You can now disable downvotes in the UI (regardless of instance settings).

When downvotes are disabled:
- The "downvote" button is removed
- Downvote counts are not shown
- The "upvote" button becomes a "heart" icon (which acts like a "favorite" or "like' button on other platforms)

You can also combine this with the hide scores option.  In that case, the button will just be a "heart" that's highlighted if you have upvoted/liked the post/comment and plain if you've not voted.


---


## 1.4.5

### Bugfixes
- Fixed bug where trailing spaces on the end of a spoiler container would break the rendering

### Enhancements
- Add "Ground News" to the "Alternate Sources" dropdown

## 1.4.4

### Infrastructure
- Reworked dependencies and Dockerfile to reduce image size by 55% (444 MB -> 203 MB)

```
ghcr.io/asimons04/tesseract   1.4.4     567d91c9e56f   9 hours ago     203MB
ghcr.io/asimons04/tesseract   1.4.3     451323e66686   5 days ago      444MB
```


### Bugfixes
- Fixed bug where editing a post and changing the image would cause the image upload modal to disappear 
- Add try/catch and fallback behavior when migrating settings to fix bug discovered where a very, *very* old version of the settings is still in your local storage
- Fixed omission of "Preview" button for tagline editor in admin panel
- Force instance domain names to lowercase when storing into profile and setting guest instance

### Changes
- Put site taglines in card effect
- Relative dates now auto update 
- Added ability to edit an existing tagline in admin panel

---

## 1.4.3

### Bugfixes
- Fix reactivity on subscribed status on community browser when switching instances.

### Changes
- Add 'Community Settings' button to community profile modal if you are a mod of the community or the community is local and you are an admin
- Use 'capitalize' class on community display names to make them title cased
- "Reasons" in modlog now render as markdown
- Added additional Invidious instances


---

## 1.4.2
Starting with 1.4.1, I'm trying out a new, faster release cadence with just one or two feature updates per point release rather than larger releases every 4-5 weeks.  Hopefully this keeps things feeling fresher and lets me focus on specific features rather than trying to overhaul everything all at once.

This release is all about enhancing the reactivity of Tesseract.

### Bugfixes
None, for once.  Doesn't mean there aren't any, just none new discovered or reported.

### Misc Changes
- Increased scroll height of quick settings 
- Added a few more quick options for easy access.
- Changed card/compact switcher to toggle, moved into quick settings area

### Reactivity Enhancements
Being able to do all the actions is great, but it's annoying to have to refresh the contents to see that they have taken effect.  This release is working on increasing the reactivity througout the application for as many actions as possible.

#### User, Community, and Instance Blocking
The behavior has changed when blocking users, communities, and instances from the feed:
- When blocking a user from the feed, all of their submissions in the current feed should now disappear.
- When blocking a community from the feed, all posts to that community in the current feed will disappear.
- When blocking an instance from the feed/instance menu, all posts from users on that instance and to communities from that instance will disappear.

Previously, at most, only the post where you initiated the block would disappear until you refreshed the feed.  Now, all posts fitting the block criteria will be hidden immediately. 

#### Community / Instance Bans

**New**:  When users are community banned, they now they have green "no" symbols on them (I'm hitting the limits of Hero icons).  This was not indicated previously. 

Community and instance bans now dispatch events that update all relevant items:

- **Feed**:   Updates the banned indicator and, if selected, flag them as removed if "remove content" is selected while banning.
- **Post Page**:  Updates the post heading and any comments to indicate the user is banned and the post/comment removed.

Previously, only the item that initiated the ban action would be updated to reflect the new state.  Now, all relevant items in the current view (feed or post/comment) will be updated to reflect the action(s) taken.


#### Subscribe / Unsubscribe
Subscribing and unsubscribing from the quick button in the community icon or the community modal will update all post cards with the new/current subscription state.


---



## 1.4.1

### Infrastructure
- Update SvelteKit from 1 to 2 and update underlying dependencies
- Update other project dependencies to latest versions
- Update NodeJS from 20 to 22
- Update `lemmy-js-client` to 0.19.4 so latest features can be utilized.
- Removed `svelte/adapter-auto` and only use Node adapter.
- Remove some discrete, one-off logic and replace with shared/standardized components
    - Federation block/allow list editor in admin panel

### Bugfixes
- Fixed modlog action menus clipping
- Fixes reactivity and blocked/unblocked status on profile modals and user pages. Added a call to getSite after blocking/unblocking to update person blocks list. 
- Fix mobile reflow in modlog
- Fixed bug with non-default instance not showing
- Fixed but with re-authenticating to the first profile (index 0 was getting ignored and creating a new profile vs reauthorizing)
- Fix heading/icon in "Create" menu not being properly justified
- Fixed bug when inline images are disabled, the link isn't shown
- Fixed bug when refreshing profile page, sometimes the wrong comment data would be shown in the edit of another comment (added index to 'each' iterator)
- Fixed bug where setting the guest instance required clicking it twice to update the site info / logos.
- Non-embed media posts were showing full URL regardless of user setting to only show the domain

### New Features
#### Community Profile Modals
When clicking on a community in the feed, instead of taking you directly to the `/c/` community page, a modal will pop up with relevant options for the community. Works the same way as the user profile modal.
- Browse Community
- Create Post
- Modlog
- Favorite/Unfavorite Community
- Add/remove community to group
- Subscribe/Unsubscribe
- Block / Unblock Community
- View Community Details
- View Community Moderators (click the mod username entries to bring up their profile modal + options)
- Zoom in on the community icon 

#### Post Flairs
There's a new user option, enabled by default, that will extract any `[tag]` items from post titles and convert them into flair badges.  Anything in `[]` in the post title will be converted into a flair tag, and the `[whatever]` removed from the displayed title.

It also supports nested, comma-delimited flars in the same brackets.  e.g. `[Music, Sludge Metal, 2000s Rock]` becomes `[Music] [Sludge Metal] [2000s Rock]`.

Clicking a flair badge will perform a prepared search for other posts with the same flair (e.g.  `search?type=Posts&q=[tag]`).  They work more or less the same as hashtags do (if you have those enabled).

This had been half-implemented in a branch for some time now, but I wasn't sure if other front-ends were handling them in a similar way.  Saw an post from the Photon dev saying they're adding them, and it's compatible with my implementation, so figured it was time to dust off that branch and merge it in.

### Misc Changes
- Removed Fediseer badge option for posts (rarely used and accessible via Instance menu and from instances page)
    - I'm *assuming* rarely used.  I don't (and won't) have any kind of telemetry, but from the instances I have seen running Tesseract in the wild, none have had those badges enabled.

- Removed the "Community" menu from posts; all of those options are now available in the Community Profile modal (access by clicking the community name in the post heading)
    - Also allows accessing these options from comments (such as on profile pages) which normally do not have the "Community" menus.
    - The option "More from {user} in {community} has been moved to the post action menu.
- Removed "Block {user}" from post action menu; access it from the user profile modal by clickin the user's name in the post/comment header.

- Add dark/light theme switcher to sidebar footer (near logo/version and Lemmy/Matrix/Github buttons)
- Removed background on image zoom toolbar
- `SettingEditArray` component is now filterable and can accept a comma-delimited list of entries
- De-cluttered main menu (top right).
    - Removed User Settings Button
    - Removed App Settings Button
    - Added "Settings" button to go to /settings, moved to old "User Settings" slot
    - Moved "Manage Accounts" out of profile submenu and into main menu
- Added user profile settings to `/settings` in addition to the application settings
    - Still accessible from Profile->Settings
- Slight updates to admin panel
    - Changed layout of tagline editor
    - Taglines are now previewed as markdown (as they would be elsewhere)
    - Federation block/allow list configuration now uses the `SettingEditArray` component rather than being a discrete editor.


--- 

## 1.4.0
This is the first release which completely drops "legacy" support for 0.18.x and below.  The minimum required API level is now 0.19.3 (though it will work with any 0.19.x series, there will be broken features that require 0.19.3).

None of the 0.19.4 features are implemented yet.  Updating my instance to 0.19.4 is not on my priority list at the moment.

One thing 0.19.4 did, which is _incredibly stupid_, is federate out the proxied image URLs rather than do image proxying sanely by rewriting the URLs via the API for local users.  This completely broke both Tesseract's proxying and certain instances of its post-type detection when those dumbass proxied URLs are encoutered.  To work around that, I'm simply unproxying them, running the detections, and then fetching the images directly (or optionally through Tesseract's sanely-implemented proxy/cache if configured and enabled). 

They said that feature was "experimental", so I sincerely hope they realize how fscking stupid their implementation is and change it in the next release (but knowing them, they'll probably double down and make it worse.).

Anyway, here's what's new and improved:

### New Features

#### Zoomable Images
Most images are now zoomable:  post images, user/site/community avatars, images posted in comments, etc.  

All the pan/zoom libraries I tried *suuuuuuucked*, so I ended up rolling my own from scratch. The pinch zoom isn't *quite* where I want it, but it's a start.  If anyone wants to contribute some code for improving that, please let me know.  

- Support zoom, pan, and rotate
    - Mouse scroll to zoom
    - Click/grab to pan
    - Rotate via on-screen buttons
    - Double-click to quick zoom in/out by 2x
- Gesture support
    - Pinch zoom in/out
    - Swipe up to zoom in
    - Swipe down to zoom out
    - Swipe left or right to close the zoom modal
    - Other gestures may be added once I figure out a clean way to differentiate them from conflicting mouse events

#### Basic Gesture Support
First, I should point out that I am *not* a fan of gesture navigation; absolutely hate it as a primary method of interaction.  Like, I'm old and hate having to guess whether my fingers need to do the Macarena or the Hokey-Pokey to perform what should be an intuitive action.

That said, I *do* like waving things (and people) away.

To that end, I've added some gesture recognition in a few places, mostly modals.  Any modal can now be dismissed with a left or right swipe in an area not bound by other event handlers.
- e.g.  You can't swipe in the text field to dismiss an edit/report/ban/remove modal; you have to swipe outside of that. 
- Left/right swipe was chosen as to not interfere with scrolling so it could be used consistently across all modal types.

The only other place, currently, with gesture support is the image zoom modal (described above).

I may add some additional swipe actions where it's intuitive to do so.  For now, I'm content with modals being easier to dismiss on mobile without having to reach up to the close button in the top corner.

#### User Profile Modals
Clicking on usernames throughout the application will now load a modal with their user card and relevant action buttons. Old behavior was taking you to their profile directly.  

Actions include:
- Go to profile
- Message in Lemmy / Matrix
- Block User
- Search for alts / simiarly-named accounts
- Ban user from instance (admins only)
- View user on their home instance
- Copy Lemmyverse link for user

#### Image Management on  Posts/Comments
- Images can be pasted in the post's URL field as well as in the markdown editor.  
- Images can optionally be pre-processed to webP along with a user-selectable quality level. Especially useful if your instance limits the size of uploads
- Can delete post images (only before you save the post; unfortunately there's no way to retrieve the delete token after that even though it is stored in the DB. Yet another API limitation :sigh:)
    - This is addressed in 0.19.4, but I don't have support for that yet.
- Images pasted/uploaded into the markdown editor are tracked in a bar along the bottom of the editor. Individual images can be deleted as needed along with the corresponding markdown code for them.


#### Hide Posts/Comments From New Users
In App Settings -> Filters, you can now opt to hide posts/comments made by new users.  You can also set the number of days an account is considered new: 1 to 30 days.  That setting also is applied to the new user badges (if you set the minimum age to 15 days, any account 15 days or younger will show the new user badge).

This setting behaves differently for mods and admins:
- **Mods**:  Filter will be applied to all posts/comments _except_ in communities of which you are a moderator. 
- **Admins**:  Filter will be applied to all posts/coments _except_ those made to communities local to your instance or those made to remote communities of which you are a moderator.

Comments made by new users will be hidden, and that includes any replies (essentially behaves the same way as blocked users)

#### Federation State Viewer
From the instances menu on a post, there's a new option called "Federation Stats" which will show you the stats from your instance to the target _and_ from the target to your instance.  Also included in that is an estimated cacluation of the number of activities each instance is behind (useful for troubleshooting federation delays).

This information has also been added to the instance items at `/instances`

Please note that the "Activities behind" counter is only an estimate. The value for `newest_activity_id` is not provided by the API (because that would be useful, so why would the Lemmy devs include it?), so it has to be estimated.  The estimation is done by looking at the `last_successful_id` of all the linked instances and grabbing the highest number and subtracting the `last_successful_id` for the selected instance.  Not all of those activities would necessarily be coming to your instance (votes/posts/comments to communities yours isn't subscribed to, etc), so it is merely an estimation.  Just because it shows you are behind by *X* number doesn't necessarily mean it's behind by that many.


#### Instances Page
Re-wrote this to do manual pagination, searching, and filtering.  _Much_ more responsive now that it is not rendering several thousand components each with actions items.

#### "Click to Play" Media Embeds
If media is disabled in the feed, the thumbnail will now have an overlay button that will convert it to an embed on-the-fly.  

When loading a video via click-to-play, I'm conditionally setting the "autoplay" flag where the embed API supports it, but it doesn't always seem to be honored.  This is an attempt to not have to press "play" twice for a video.  So far, the only video frontend that seems to honor it is YouTube. Invidious/Piped, so far, do not, and neither does PeerTube.  

Ok, so autoplay works if muted (no idea how YouTube's player gets around this; probably some chicanery).  I think that's worse because you still have to click twice on the videos,  and the "unmute" button is harder to reach than "play".  So I think I'm going to just settle on having to click play twice. 

This seems to be be a Chrome/Chromium thing (and explains why YT gets to bypass this).  In Firefox, the autoplay flag is respected without having to mute the video.


#### Re-Integrated Piped Support as an Embeddable Youtube Frontend
Now that click to play has been added, Piped support has been added back. It was removed due to poor performance and rate limiting when used with feed embeds.  

If media embeds are enabed in the feed, only YouTube frontend will show direct embeds. Piped/Invidious will always be click to play regardless of embed setting due to above mentioned rate limiting / performance.

#### Alternate Source Dropdown
Removed the `[Archive Link]` next to the post URL and replacd it with a fancy menu to the left of it.
- On posts with links, it currently has buttons to search for the article at Archive Today, Ghost Archive, and 12ft.io
- On Youtube-like posts, can select alternalte links for YouTube, Invidious, or Piped
    - Invidious/Piped will open with your preferred instance (defined in settings)
    - Useful if someone posts a video to an Invidious instance that performs poorly for you and you would prefer to view it on your preferred Invidious/Piped instance or canonically on YouTube.

#### Quick Action Menus
On mobile, the navbar was getting cluttered, so most of the discrete dropdowns there have been moved into Quick Actions menus.
- Main, Community, and User feed pages:  Quick Actions has replaced all discrete menus
- Search Page, Modlog, and Community Browser:  All of the filtering options are in a quick action menu


#### Users Can Now Add Their Own Preferred Invidious/Piped Instances
Prior to this release, any Piped or Invidious instances needed to be added by the administrator via environment variables.  In addition to that, users can now add any number of custom Invidious and/or Piped instances in the app settings.

These will be combined with the built-in list and the admin-extended list and be available for use as your preferred YT frontend and for detection of Piped/Invidious links in posts.

Be aware that those custom instances will only render as embeds for you; they will be thumbnails for anyone else who hasn't added them to Tesseract.  If you feel that instance should be added to Tesseract's built-in list, please submit a Github issue with the details.

Tesseract is pre-populated with the official list of public instances for each, but it can get out of date easily.

**Note**:  As of 6/20/2024, I've noticed a lot of Invidious/Piped instances are now requiring login, and embeds through them no longer work.  I believe if you have an account with one, log in, and enable 3rd party cookies for that domain, the embeds _should_ work.  I have not tried that, but it does work with Spotify.  This isn't a Tesseract bug, unfortunately, or I'd fix it.  

#### Can Disable Infinite Scroll if you Want
If you're not a fan of the infinite scroll, you can go to App Settings -> Feed and disable infinite scroll.  

#### TOTP 2FA Setup
Can now enable and enroll in 2FA as well as disable it.

#### Account Icons Now Use Your Profile Avatar
Icons in the account switcher and account screens now sync to your profile avatar, if defined.

#### New Placeholder User Avatars
Instead of the initials as used previously on accounts without avatars, now uses Dicebear Adventurer pseudorandom avatars.  Initials are still used for placeholder community icons when the community mods haven't set one.

#### Passwords Can Now Be Revealed
All password elements will now allow you to toggle them to reveal. Should make a big improvement when logging-in on mobile.

#### Vote Viewer (Admins Only)
Admins can now see votes like in Lemmy-UI.  Uses infinite scroll and deduplication to compensate for the stupid API that returns multiple/duplicate votes on each page.

---


### Bugfixes and Enhancements

#### Removed 0.18.x Backwards Compatibility
- Or, more specifically, removed 0.18.x JS client and the extensions I wrote to make that compatible with 0.19.x.  Now uses the 0.19.3 JS client.
- Removed the image upload proxy which was needed in 0.18x due to CORS restrictions.


#### Various Enhancements to Auth Module.
- Added safety check so that the auth token is only ever sent to the profile's associated instance and cannot accidentally send to non-home instance (e.g. when browsing communities on a remote instance).
- Fixed a few chicken/egg situations where the profile store needed to be accessed before it was initialized
- If your auth token is invalid, such as after changing your password on another device, you will get a toast message you can click to take you to the login screen.
- If a profile exists for a username/instance combo, logging in will update the auth token for that existing profile rather than creating a new one.
- User avatars are now fetched when logging in.

#### Grace Period Before Media Embeds are Destroyed When Scrolling out of Viewport
- Embeds now have a short timeout when leaving the viewport before they're removed from the DOM and turn back into thumbnails.  Fixes annoyance when resizing the window while a video is playing and the video temporarily leaves the viewport and is destroyed. Timeout is 2 seconds and will reset/disarm if the post returns to the viewport before it expires.

#### Community Creation / Editing
- Uses new upload handler for banner/icon
- Can pre-process the banner/icon to webP before uploading
- Shows a live preview of how the community card will look

#### General
- Slightly darkened background color in light mode cards (bg-white->bg-slate-100) for better contrast. Did similarly for some button colors
- Added "OpenDyslexic" as a UI font option
- Can now close modals with Escape key, close button, or by swiping left/right
- Added button to reveal password fields
- Some modals can be closed by clicking out of them.
    - I need to disable this or make it more consistent.  Some workflows utilize nested modals, so I do need to be able to keep them open when interacting with a child modal.
- Added "share" link for searches.
    - Will generate a URL with the current search params and copy to your clipboard.



### Other Stuff

#### Peertube Follows
On my last release post, someone mentioned that following Peertube channels may be broken.  At the time I was still on 0.18.5 and had followed a PT channel, and _seemed_ to be getting updates from it.  Then I wasn't sure.

I can say that I _have_ been getting at least some updates to the PT channel I follow (mostly as a test).  While there have been videos posted there that did not come through to Lemmy, I don't know enough about PeerTube to know if they were published differently or what.  However, I have gotten at least 2-3 that someone posted to Lemmy that would absolutely had to have come in via Federation.

Also confirmed that commenting on a PT video (from the channel feed, not an embed to a Lemmy community) does federate out and show up on Peertube's side along with any votes you give in Lemmy.

This isn't really a Tesseract issue since the Lemmy backend handles that.  Just figured since I do support Peertube, it would be worth mentioning that it seems to work.


### What Didn't Make the Cut This Release
- User profile import/export
- Link previews
- Custom feed rewrite
- Custom emoji management
- Fediseer Rewrite

I keep kicking the can on the custom feed and infinite scroll re-writes, but for a good reason.  I want to start using IndexedDB to get around storage constraints in the browser's LocalStorage API.  I need to write and integrate a library for this (or find one I don't hate), and that's going to take some dedicated development time.  Switching to IndexDB is also a step in the direction I want to go towards providing offline support.  So, at some point, there will be a release that only focuses on that.  Not sure if it'll be in the 1.4.x series or later, but ultimately, that is where I want to go.

--- 
### Goals 
These are my checklist-items of goals for this release.  Mostly here for my own use, but they also are useful to track changes, so I'll leave them.

#### Drop Support for 0.18.x
- [X] Remove all `auth` fields from API call POST bodies
- [X] Remove all the date checks that look for and append 'Z'
- [X] Remove score from user pages (currently conditional upon presence of value)
- [X] Update `lemmy-js-client` 
- [X] Remove admin flag check from `local_user_view.person` in moderation.ts
- [X] Remove image upload proxy since it _should_ no longer be needed
    - **Note**:  Left server-side handler in place and deprecated calling function in Lemmy library; you never know when the Lemmy devs are gonna fuck something up
- [X] Remove `page` offset-pagination parameter and detection from main and community feeds and exclusively use `page_cursor`
    - Some API calls still use this, but `page_cursor` is used everywhere it is implemented by the API
- [ ] Remove custom functions for ~~`blockInstance`~~ and `hideCommunity` and use the client-native ones
- [X] Remove custom shim to conditionally add/remove `Scaled` sort option
- [X] Update `sortOptions` and `sortOptionNames` arrays to include `Scaled`
- [X] Add `ModeratorView` to listing types if `modOfAny()`

#### Newly Introduced/Discovered Bugs
- [X] DM modal preview shrinks in mobile view
- [X] Ensure "Moderator View" only appears on main feed
- [X] If guest instance is set, login was not sending auth token
- [X] When switching between communites on create post page, moderator user links not reactive (shows previous lookup)
- [X] Jumping to comment from profile when logged into another instance takes you to /comment/{default_instance/{id} which is wrong.
    - Only when opening in new tab.  Seems `get(instance)` isn't returning as expected and falls back to `DEFAULT_INSTANCE_URL`
    - Fixed by using $profile.instances instead of get(instance) since the profile one is backed by local storage 
- [X] Viewing instance stats from the instances menu for your own instance causes some kind of infinite loop
    - Best to just not show that option if post/comment is for your own instance. Not useful anyway
- [X] Imgur embed gifs not showing GIF in post view. (New when switching to zoomable image)
- [X] NSFW images showing blurred in post view. (New when switching to zoomable image)

    
#### General UI
- [X] Better contrast: Made light mode cards a little darker for better contrast (bg-white -> bg-slate-100)
- [X] Add Dicebear avatar generator for blank user profiles.  Keep initials generator for communities without icons.


#### Markdown Renderer and Editor
- [X] Fix markdown table column width. When tables have two columns, the first is always 99.9% width and the second all smushed.
- [X] Replace old Photon image upload proxy for uploading images in markdown editir
- [X] Add support to delete uploaded images
    - Track and individually delete images posted in markdown (in both posts and comments)
    - Automatically removes markdown code for the image being deleted.


#### Admin Panel
- [ ] Add ability to define and edit custom emojis
- [X] Replace old Photon image upload proxy for site icon/banner
- [X] Restrict access to only local admins
    - Previously, anyone could goto `/admin` and see the settings; API would not authorize them to make changes. All of these settings are also visible, unauthenticated, via API call to `/api/v3/site`, so didn't feel the need to restrict this.  Some people disagreed with that, so I locked it down in this release.

#### Community Settings Panel
- [ ] Add report panel for reports in that community
- [ ] Add 'local' check to not show community settings buttons to admins when browsing remote communities
    - Reproduce:  Go to /post/{other_instance}/12345 and you'll see the community settings if you're a local admin
    - Not sure how to easily fix
    - 
- [X] Replace old Photon image upload proxy for community icon/banner
- [X] Restrict access to only moderators or local admins
    - Previously, anyone could goto `/c/{community}/settings` and see the community settings; API would not authorize them to make changes or see anything they couldn't otherwise see. All of these settings are also visible, unauthenticated, via API call, so didn't feel the need to restrict this.  Some people disagreed with that, so I locked it down in this release.

#### Instances List
- [X] Add `federation_state` data to instance list objects in `/instances`
- [X] Add button to fetch and display federation state for the current instance from the selected instance
- [ ] For admins, add ability to add/remove an instance from the instance block list



#### Fediseer
- [ ] Create custom components for Endorsements, Censures, Hesitations. Clean up presentation.
- [ ] Make each instance that endorses/censures/hesitates clickable to view their Fediseer records



#### Feeds
- [X] Add "Moderator View" listing type option
- [X] Add `user_is_moderator` flag to post meta header in feed
- [X] Replace old admin check for post meta with new `user_is_admin`.


### Posts / Comments
- [X] Replace old Photon image upload proxy for post images
- [X] Add `listPostLikes` and `listCommentLikes` options to post and comment moderation menus for admins
- [X] De-clutter crosspost item in mobile (hide relative date)
- [X] Image posts now zoom when clicking on image. Click title or comments button to go into the post
    - Article posts still load the post when clicking the image. Not sure if want to change that to match or not
    
- [X] User links now load a modal with user card and action buttons
    - [X] View Profile
    - [X] Message in Lemmy
    - [X] Message in Matrix (if Matrix ID provided)
    - [X] View on user's home instance (need to conditionally hide if instance is same as current user's)
    - [X] View user's modlog history
    - [X] Copy Lemmyverse link to user
    - [X] Block/Unblock User
    - [X] Instance ban user (if current user is admin)
- [X] Create setting to allow hiding posts/comments from new accounts. Minimum age is configurable by the user (1,2,3,5,7,10,14, and 30 days)
- [X] Add 12ft.io as an archive link option
- [X] Re-write archive link selector be more generic
    - Youtube-like links now have selector to choose from Invidious, Piped, or YouTube
    - Will use your preferred Invidious or Piped instance
- [X] Replace static/ugly archive link button with nice menu to select from one of multiple sources.


### Media
- If embedded media in the feed is disabled, the thumbnail images will be "click to play" which will load the embed on click.
    - [X] YouTube
    - [X] Spotify
    - [X] Peertube
    - [X] Bandcamp
    - [X] Odysee
    - [X] Soundcloud
    - [X] Songlink
    - [X] Vimeo

- Re-introduced Piped as an option for the YouTube frontend.
- Only YouTube frontend will allow YT-like embeds in the feed.  This is to prevent getting rate-limited by volunteer-run Invidious/Piped instances
- There is now an "alternative source" dropdown to provide links to YouTube, Invidious, and Piped to any YT-like video
    - Invidious/Piped will link to your defined instance as defined in your app settings.
- [X] Make post and comment images zoomable
    - All the pan/zoom libraries I tried *suuuuuuucked* so I ended up rolling my own.
    - Can both pan and zoom the image
    - Double click to quick zoom in and out (desktop only until I figure out how to differentiate tap from click)
    - Mouse scroll to zoom (desktop)
    - Pinch zoom is supprted but isn't quite where I want it (possibly library limitation)
    - **Swipe gestures**:
        - Up:  Close image
        - Down:  Toggle quick 2x zoom
        - Left: Zoom out one step
        - Right:  Zoom in one step

- [ ] Optionally Preview Links in Modal

#### Image Upload Handling Improvements
- [X] Add support for deleting uploaded post image (during post creation only since the delete tokens aren't retrievable after that)
- [X] Add support for pasting images in both the post URL field as well as into the markdown editor
- [X] Paste images directly into post URL field: will populate and open the upload modal with the pasted image.
- [X] Paste images directly into markdown editor: will pipulate and open the upload modal with the pasted image. Can then supply alt text.
- [X] Convert pasted images to webp prior to uploading
- [X] Convert uploaded images to webp prior to uploading
- [X] Unchain the functions that handle the webp conversion, add options to enable/disable that behavior (default on)

**Note**: This works best in Chromium browsers since they have access to the Clipboard API.  

In FF and other browsers without Clipboard API support, pasting images still works but there are quirks:

- Pasting into the URL field works as expected in any browser; if there is a text component in the clipboard alongside the image, it will be overwritten upon upload with the image URL.

- Pasting into the markdown editor will paste the text component as well (usually the filename).  I've tried working around this, but there's no real clean way to to do it.  In Chromium, I just use `navigator.clipboard.readText()` if the paste data is not an image (have to prevent default so the local filename doesn't paste in as well).

- FF nightly has support for Clipboard.read(), readText(), writeText().  Once that's in mainline, I'll just use Clipboard API and get rid of the old clipboard data method.  Safari can get on board or get out of the way :shrug:


### Moderation
- [X] Do something about the ugly "confirm" checkbox
- [X] Fix horizontal overflow in report modal submission preview.
- [X] Refreshed looked of remove/restore and ban/unban modals.

### User Links
- [X] On UserLink component, instead of taking you directly to user page, open a modal with user-specific actions

### Search
- [X] Add permalink share button to search with currently-selected query and params

### Accounts & User Settings
- [X] Move read/unread and message type selector to sub-navbar at `/profile/inbox` and get rid of old, ugly buttons.
- [X] Add TOTP setup
- [X] Replace old Photon image upload proxy for user avatar/banner

- [X] Add capability to reauthorize an existing account without deleting/re-adding it.
    - Toast pops up letting you know your login session is expired with an action to take you to /login/{instance}

- [X] Show avatars, if available, instead of color icons in account switcher
- [X] Fetch avatars for existing accounts

- [ ] Add components to export and import your Lemmy profile
    - [ ] Export
    - [ ] Import

- [ ] Separate posts/comments in /u/ page data and set infinite scroll truncated status separately if filter not set to all


### Misc To-Do
- [X] In post form, when resetting values, loop over the image uploads in markdown and delete them all
- [X] Make feature/unfeature require a confirmation
- [ ] Re-decouple video size from image size in posts.
- [ ] Add quick settings modal to main / community page subnavars
    - Change feed image size
    - Change YT frontend and their options
    - Enable/disable media embeds
    - Enable/disable image proxying (if enabled system-side)
    - Application font
    - 
    - Link to full settings page
- [ ] Add  purge user button for admins.
    - Purge user flow:
        - Instance ban with remove content
        - Sleep 10 seconds or so
        - Purge user
        - If user not local:
            - Resolve user since purging removes their person entry and any local ban
            - Ban user now that their content has been removed


- [ ] Link preview option.  If enabled:
    - Ignore Tesseract links (links to posts, comments, communities, users, etc)
    - Instead of taking you to the link directly, open a modal and call getSiteMetadata() for that URL to generate a preview
    - If the link is to some kind of media supported in Tesseract, render it in a modal
    - Provide option to create a post based on the link
    - Provide button to take you to the link (