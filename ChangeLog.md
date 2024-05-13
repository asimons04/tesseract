# Changelog for 1.3.x Series
All major/minor changes between releases will be documented here.  


## 1.3.1

### Goals 

#### Drop Support for 0.18.x
- [X] Remove all `auth` fields from API call POST bodies
- [ ] Remove all the date checks that look for and append 'Z'
- [ ] Remove score from user pages (currently conditional upon presence of value)
- [X] Update `lemmy-js-client` 
- [ ] Remove admin flag check from `local_user_view.person` in moderation.ts
- [ ] 
- [ ] Remove `page` offset-pagination parameter and detection from main and community feeds and exclusively use `page_cursor`
- [ ] Remove custom functions for `blockInstance` and `hideCommunity` and use the client-native ones
- [ ] Remove custom shim to conditionally add/remove `Scaled` sort option
- [X] Update `sortOptions` and `sortOptionNames` arrays to include `Scaled`
- [X] Add `ModeratorView` to listing types if `modOfAny()`



#### Markdown Renderer
- [X] Fix markdown table column width. When tables have two columns, the first is always 99.9% width and the second all smushed.

#### Admin Panel
- [ ] Add ability to define and edit custom emojis

#### Community Settings Panel
- [ ] Add report panel for reports in that community

#### Instances List
- [ ] Add `federation_state` data to instance list objects in `/instances`
- [ ] Add button to fetch and display federation state for the current instance from the selected instance
- [ ] For admins, add ability to add/remove an instance from the instance block list

#### User Settings
- [ ] Add TOTP setup

#### Fediseer
- [ ] Create custom components for Endorsements, Censures, Hesitations. Clean up presentation.
- [ ] Make each instance that endorses/censures/hesitates clickable to view their Fediseer records



#### Feeds
- [X] Add "Moderator View" listing type option
- [ ] Add `user_is_moderator` flag to post meta header in feed

### Posts / Comments
- [ ] Add `listPostLikes` and `listCommentLikes` options to post and comment action menus for admins
- [ ] Do not show (or disable) subscribe/unsubscribe button in Post Meta on post preview


### Search
- [X] Add permalink share button to search with currently-selected query and params
i don'

- Separate posts/comments in /u/ page data and set infinite scroll truncated status separately if filter not set to all

- Add  purge user button for admins.
    - Acknowledge checkbox/dialog
    - Ban user permanently with content removal
    - Delay ~3-5 seconds for the federation activities to be created and queued
    - Call purge user
    - Redirect to homepage or somewhere appropriate

- Link preview option.  If enabled:
    - Ignore Tesseract links (links to posts, comments, communities, users, etc)
    - Instead of taking you to the link directly, open a modal and call getSiteMetadata() for that URL to generate a preview
    - If the link is to some kind of media supported in Tesseract, render it in a modal
    - Provide option to create a post based on the link
    - Provide button to take you to the link (honoring "open in new tab" setting)

- On UserLink component, instead of taking you directly to user page, open a modal with user-specific actions
    - Use component export variable to determine if should be a link to the user or open the modal (where modal would be inappropriate or less useful)
    - View Profile
    - Block (or unblock)
    - Send Message in Lemmy and/or Matrix
    - Ban from community (mods only)
    - Ban from instance (admins only)
    - Make avatars clickable to enlarge to full size

- Make back button close modals
    - If this is added to the modal component, should apply it automatically to all modal types

- If profile is active but no MyLocalUser info returned from getSite, prompt for login



## 1.3.0

### Overview
Not really doing anything groundbreaking with this release.  There are a few new minor features, but almost all of the work has been refining the existing features and adding polish throughout.  


### Important API Compatibility Notes
**This will be the last version to support 0.18.x.  Once development of 1.4.0 begins, 0.18.x support will be dropped.**
- 1.3.0 remains fully compatible with 0.18.x and 0.19.x

### 0.19.x Features Currently Supported
- Cursor-based pagination (will fallback to offset-based pagination for 0.18.x)
- Instance blocking
    - Note:  Intentionall will not allow you to block your home instance
- Scaled sort (dynamically added/removed from sort options if switching between an 0.18.x instance and 0.19.x instance)




### General Bugfixes
- General Typescript and a11y fixes (too numerous to list individually)
- Fixed reactivity bug where comment counts weren't updated on screen when you "load more" comments and vote one one of the newly loaded ones.
- Reimplemented vote functions for comments and posts.
- Added more forwards/backwards-compatible date format checks (to work with both 0.18.x and 0.19.x)
- Deprecated lots of old functions that were holdovers from the original Photon code
- Fixed bug where refreshing a user profile would throw an unhandled JS error on 0.19.x (but strangly, the same flow worked on initial load). Was a bad index key for the Svelte `{#each}` loop.
- Fixed a bug where direct linking to a post (/post/123456) would sometimes return the wrong post or fail to load the post
    - The circumstances required to hit this bug were pretty rare, but it was a bug.  Basically, if you have Tesseract in place as your instance's default UI, _and_ it's unlocked to allow logging into other instances, _and_ the current or guest session was _not_ the home instance, then if you tried to load the canonical AP link to a local post (https://dubvee.org/post/12345), it would try to redirect you to the current guest/foreign instance's post 12345.  
- Direct linking to comments (/comment/12345) now works properly (similar to above bug for posts)
- Linking to a comment in a theread now properly scrolls the actual linked post to the top
    - The linked comment is now highlighted for easier reference.  e.g. Someome replies "See https://example.com/comment/12345", and it will now take you to that comment( as it always has) as well as properly scroll that comment to the top and give it a highlighted background and border.


### New Features (That Aren't Refinements to Existing Features)
- New markdown renderer
    - Removed `markdown-it` and all of its plugins as it was too cumbersome to extend to do some things I wanted to do
    - Replaced with `svelte-plugin-marked` and wrote custom renderers for that to match the old behavior.
    - **Note**:  Since `marked` uses Github-style markdown, subscript and superscript are not supported.  I really don't have the energy right now to look into custom-writing those (if it's even feasible without forking), so for now, support for sub/super-script has been removed.  Those seem to be rarely used, anyway, so I may be content living without them indefinitely.  The buttons in the editor toolbar for those have also been removed.
    - Now some new features I want to add are possible:
        - Link previews where you can click a link and preview the site in a modal using the data from `getSiteMetadata()`
        - Load embeddable videos (Youtube-like, Vimeo, Peertube, etc) in a modal rather than leaving the app
        - Enlarge or otherwise add other features to images posted in markdown

- New Community Moderation Panel
    - In the community settings, mods can now direct ban/unban users
    - There's now a mini-modlog available in the moderation section. Can perform quick actions, see recent (or all) history, and link to the main modlog pre-filtered for that community.

- Community browser now shows subscribed/not-subscribed status on remote communities
    - Can now one-click subscribe to remote communities
    - Each community item is now collapsible to view the community details (if available). Formerly, these popped up in a modal.

- Added `/instances` route to view the federated (allowed, linked, blocked) instances.
    - Can filter by software and keyword (e.g. lemmy instances with `.xyz` TLDs)
    - Dead instances are indicated
    - Can filter out dead instances
    - Action buttons to browse communities on that instance (Lemmy instances only), visit the instance, or view Fediseer data for it.

- Added button to community avatars in the feed to quickly subscribe/unsubscribe to communities
    - Browsing all and see an interesting community?  Now you can quick-subscribe to it without having to click the community menu

- Can now swap the post / comment action bar button direction
    - Useful on mobile if you want to put the vote buttons on the right

- Can now hide scores and show only your own upvote/downvote status
    - This is in app settings rather than user settings. With Tesseract, the config options in "User Settings" are only settings that affect the behavior of the API.  Lemmy-UI keeps its frontend options there, but I don't want to have to fight those.

- If the instance you're on has disabled downvotes, the downvote buttons on posts and comments will be hidden.

- Can now fetch the metadata during post creation.
    - Can fill in the title automatically as well as provide the thumbnail image for the post preview
- Peertube video embeds are now supported

- Can reset password now (thought this was already implemented, but that was just 'forgot password' process).

- Infinite scroll has replaced the old pagination in all but the modlog (may add it there, just haven't bothered yet).

- Can now select one of multiple fonts for use in the UI.  Also has the benefit of looking more uniform between Firefox/Chromium as FF's default font looked less than 
ideal.   Current options are:
    - Default sans
    - Default serif
    - Browser default
    - Inter
    - Roboto
    - Reddit Mono
    - Ubuntu
    - Urbanist

- Admins can define three different types of URL blacklists to disallow submitting posts to those domains.
    - Can disable submissions that use a link shortener as the URL
    - Can enable the option to deny submissions to domains MBFC has deemed low-credibility.
    - All of these are disabled by default and must be explicitly enabled / configured by the admin
    - Note: These are only effective when submitting through Tesseract UI, obviously. These will not prevent those from being submitted from another frontend or via API calls. 

- Added some 0.19 features (disabled on 0.18 instances)
    - Scaled sort 
    - Instance blocking


### Top Navigation Bar
- All buttons are icons now
- Created new notification widget
    - Inbox notifications removed from profile button
    - Shows a colored dot for each type of notification
        - Red: Inbox notification
        - Green: Unread Report
        - Blue:  Unprocessed registration applications (admins only)
    - Is now the way to get to the mod reports section (Notifications -> Reports)
- Added Favorites menu to quick-access your favorited communities
- Search removed from here and added to context navigation bar below
- Button to collapse the sidebar is now at the far left of the main nav bar instead of within the sidebar

### Sidebar
- Shrunk button text
- Added Hot, Popular (Active), and Top Day buttons for quick switching to different feed sorts
- Community list area is now larger
- Moved collapse sidebar button out of teh sidebar and to the top navigation bar (to the left of the site name/logo)
- Site taglines now automatically rotate every 30 seconds in the site sidebar (if taglines are set by admin)

### Frontpage and Feeds
- Moved search out of main navigation bar and into the context-sensitive navigation bar below it (hidden on mobile; use top search button)
- Added scroll to top / bottom buttons to navigation bar
    - With infinite scrolling, this will basically take you to the next "page"
- Implemented infinite scrolling
    - A lot of effort was taken to ensure you get back to your same scroll position
- Refreshing data is *mostly* manual now so that returning to the homepage will resume your former scroll position
- Embed media objects are destroyed (or not rendered) when not within the viewport. 
    - This should reduce memory consumption considerably as before, once an iframe was loaded after it was scrolled into the viewport, it remained in the DOM
    - If you're done with a video, you can now just scroll past it without it continuing to play
- Mostly got rid of Svelte's "sometimes it works, sometimes it doesn't" scroll position resumption 
  - Now will keep your place when changing post/compact view and changing margins
  - Makes liberal use of `on:mouseover` and `on:touchstart` to keep track of the most recent post in the feed
- Removed feed setting for number of posts per page
  - Changed behavior and values of "Posts per Page" to "Posts per Fetch".  Now values are 10, 20, and 30.  Too many and infinite scrolling became sluggish when adding to DOM
- Blocking a community/user will no longer refresh the page
    - As a result, the blocked item will not leave the DOM unti you refresh since there is no API data to indicate a community is blocked
    - Behavior change was needed to avoid having to recreate the post feed list with infinite scrolling
- Added user setting to reverse the action buttons in the post and comment action bar
    - Will put the vote buttons on the right and the action menus on the left


### Media
- Add support for detecting and rendering Peertube embeds
    - Since Lemmy can subscribe to PeerTube channels, you can now follow them and have the channel's videos show up / embed in your feed
    - Votes on Peertube videos will translate to thumbs-up on PT's end

- Media embeds now only render when the post is actually in the viewport. 
    - This should keep memory from ballooning in embed-heavy feeds. Before, all iframes were kept in the DOM
    - Will show as thumbnail art until 10% of the post is in the viewport and then automatically switch to embed (if embeds enabled)

### Archive Links
- Link posts now have an "[Archive Link]" button automatically applied to the right of the source URL.
- Please, for the love of god, stop lazily commenting "PaYWalLed!".  Seriously. You're making your laziness everyone else's problem, and it's obnoxious.
- Support for submitting archive links when creating posts will *not* be implemented. Among other things, that's one of the *worst* things Lemmy UI has done and allows absolute shit garbage "news" sources to masquerade as legitimate ones since the URL only shows the archive link and the real source is obfuscated. 


### Create Post Page/Form
- Basically gutted the old logic and re-implemented it all.  Man that was a mess.
- Created new route at /c/{name}/create_post for community-specific post creations
- Added metadata fetch option to pre-set title, grab thumbnail URL for post preview, and append embed description to the post body.
- Removed "Save/Load" draft functionality as it was rarely used and more trouble than it was worth.
- Added "Undo/Reset" button to revert a post you're editing back to its initial state or to clear the post form if creating a new post
    - If crossposting, will restore the current state to the original crosspost information

- Image upload will now use the Tesseract image proxy, if configured and enabled.


### Post Pages
- Added post title to navigation bar (not shown in mobile).  
    - Have you ever gotten deep into the comments, which have gone far off the rails, and completely forgotten what the post was about? This is why that was added.
- Added a placeholder element if there are no comments
- Removed action buttons (moderation, post, community) from navigation bar. Best I can tell they were rarely used and were problematic to implement.
- Now uses standardized layout components.
- Sidebar no longer jiggles
- Removed comment count button from post card; redundant since those are displayed again below where it makes more sense


### Modlog Enhancements
- Added the context-sensitive navigation bar
- Removed "Modlog" title since it's pretty obvious where you are
- Moved filter options to navigation bar
- Made filter selections fancy
- Reimplemented community and person autocomplete components
- Person details in filter now transparently fetch via API if not in the modlog data
- Added quick action menu to modlog entries
    - Can be used to quicky undo a mod ation or take an additional related action
    - Can turn a temporary instnace ban into a permanent one without the intermediate step of unbanning first
- Reversed reflow direction on mobile
- Hide "moderator" column if not logged in since most instances hide that data for unauthenticated users


### Search Page
Can use the filters to do things like see your (or anyone's) posts/comments to a specific community 
- Added the context-sensitive navigation bar
- Moved filtering options to the navigation ba r
- Results are grouped by type, including "all", and can be toggled 
- Used standardized layout components
- Added site sidebar 
- Reimplemented search handling logic

### Moderation/Reports Section
Rewrote this fix a lot of "WTF was I thinking when I did that?" code as well as to support private message reports.
- All reports are now pre-processed into a standardized report format.
- Removed "Close" button.  
- Added "Resolve" button so reports can be resolved without having to open them (useful in < 0.19.x to resolve reports that have already been taken care of)
- Integrated the context-sensitive navbar into the cleanup



### Community Pages
- Refactor to use standardized layout components
- Implemented infinite scrolling
- Community name no longer appears in post headers in community feed
- User avatars are shown in post headers now
- Search bar now lets you search for content posted to that community.

### Community Button on Posts
- Added button called "More from {user@instance}" which will take you to a pre-populated search page showing only submission from that user in that community

### Moderation Section
- Re-wrote pretty much all of it
- Comment, Post, and Private Message reports are now pre-processed into a common/standard report format; makes working with the reports _much_ easier now.
- Can now resolve private message reports



### Profile Section
- Now has infinite scroll for post/comment history
- Replaced the ad-hoc context bar with the standardized one
- Moved profile section buttons below nav bar
- Profile section buttons are now stickied to the top for easier navigation
- Re-wrote the main layout and subpages to use the standardized layout components
- Can now set banner image
- Updated layout of settings
- Removed "show scores" option since it is not used by Tesseract and doesn't change API behavior
    - Moved this fro profile settings to app settings
- Can now change password (I _swear_ I thought I already implemented this ages ago)
- Note:  TOTP settings will be added when 0.18.x support is dropped.  The 0.18.x implementation is bonkers, and I don't want to have to shim around that.
- Inbox has been re-written
    - Can now report private messages
    - Private messages can be marked as read individually

### Misc Pages
- Reimplemented /legal page to use standardized layout
- Reimplemented /signup, /signup/[instance], /login, and /login/[instance] to use new standardized layout.
    - Added site card to the login and signup pages and removed old static site icon

### Domain Blacklisting
Tesseract can deny submissions (currently only in the post URL) to a set of admin-defined list of domains.  

There are 3 independent blacklists which can be specified:

- General
- Link Shorteners
- Fake news

Please see the [Domain Blacklisting](docs/DomainBlacklisting.md) document for more details.



### UI
- Reimplemented account switching menu
- "Explore" menu is now "Instances" menu
    - Contains same items plus the optiosn to block the instance of the post creator or the community the post belongs to
- Add "Copy Lemmyverse Link" to user profile menu. Useful for sharing instance-agnostic links to users (mostly used by admins/mods to report spammers/trolls)
- Site, community, and user info are now collapsible in the sidebars
- Added transition effects in more places, removed from others

- Various visual tweaks to posts, comments, and badges
    - Post titles are now bolded
    - New user badges now show the relative age of the account (5m, 1h, 2d, etc)
    - Deleted accounts are now indicated with a trash can
    - Increase icon/avatar size -- rather than reflow to 3 rows from two + column (community, user, published), always display in a column
    - Posts in the feed, when browsing a community, now show the creator's avatar instead of the community's
    - Deprecated and removed "Theater Mode" button on videos.  Was somewhat ill-conceived when I created it, and maintaining it is annoying.
    - Compact posts are now slightly more compact

- Shamelessly stole the post body preview fade from Photon (ok, I reimplemented it rather than stole it outright, but it does the exact same thing but with better contrast)

- Reimplemented vote buttons
    - Shows upvote and downvote counts
    - Now disabled when non-applicable (viewing post on non-home instance, not logged in, etc)

- Un-flattened all other buttons    
- Long community names are now shortened where needed
    - Full name still shown in community sidebar

- Cleaned up top navigation bar
    - Using icons instead of text+icons
    - Most are now dropdown menus (community/explore is still just a link)
    - Profile avatar now has a ring effect

- Added notification center in nav bar
    - Replaces the "Reports" button as well as the notification dot on the profile menu
    - Has three color-coded notification dots for inbox (red), reports (green), and registration applications (blue)
    - Dropdown shows counts for each of inbox, reports, and applications
    - Hidden if not logged in
    - Users will just see "Inbox"
    - Mods will see Inbox and Reports
    - Admins will see Inbox, Reports, and Registration Applications

- Removed "Favorites" button from Navigation bar and replaced with dropdown menu

- Reimplemented the dropdown menus
    - Looks a lot cleaner
    - Hide the currently selected label on mobile (to not overflow the navbar)
    - Add menu label to top of dropdown and check icon indicator to currently selected option

### What Didn't Make the Cut?
#### Reimplement custom feeds

Since this is the last 0.18.x release, and I'm having to support both cursor and offset-based pagination, I've decided to push the custom feed rewrite to 1.4.0 which is dropping 0.18.x support.  That will make implementation easier and cleaner than having to support both methods.

#### TOTP 2FA Setup
Same as with the custom feeds, I want to do this cleanly.  Since 0.18.5's TOTP setup is bonkers and can easily lead to accounts being locked out, I've decided to skip adding this until 0.19.x is the minimum-supported version.



