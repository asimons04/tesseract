# Changelog for 1.4.x Series (Intrepid)
All major/minor changes between releases will be documented here.  


## Plans/Ideas to Implement Eventually:
1) Re-write search and community browser to keep state in URL params instead of locally
    - They currently both reset when you navigate away and back
    - URL state would be less awkward than the snapshot/restore I do for the infinite scroll.

1) Add language selector in profile settings
    - Add language 

1) Add filter option for domains
    - Include presets (Reddit, Facebook, Twitter)
    - User settings to add custom domains

1) Look into making a grid view.
    - May need to make this separate from the main feed as initial tests with just CSS have not panned out.


1) Power Mod Tools #2:  Command palette
```
{username} and {community} can be in any of the following formats:
- /u/username[@instance] or /c/community[@instance]
- @username[@instance] or !community[@instance]
- https://lemmyverse.link/u/username@instance
- https://lemmyverse.link/c/community@instance


ban {username} -> Load ban modal populated with username and `ban` set to false (so modal will treat it as ban)
unban {username} -> Load ban modal populated with username and `ban` set to true (so modal will treat it as unban)
banCommunity {username} {community} -> Load ban modal populated with community and username
addMod {username} {community}
removeMod {username} {community}
addAdmin {username}
removeAdmin {username}
{username} -> /u/{username}
{community} -> /u/{community}


```

1) Support "universal" links.  The post and comment ones will basically work like the user/community where it resolves them and then links to them.  If unauthenticated, go to the remote one (at least for posts; not sure if comments will work that way without auth).
    - `@<user>@instance.xyz` (already implemented)
    - `!<community>@instance.xyz` (already implemented)
    - `#<post_id>@instance.xyz` (need to update hashtag regex to ignore numeric tags)
    - `~<comment_id>@instance.xyz`


# 1.4.30

## Bugs to Fix
- Trim function in pre-processor breaks nested list items

---

# 1.4.29

## Bugfixes
- Tweaked font sizing a bit so that H3/H4 heading differences are more pronounced.

- Added meta header to instruct Dark Reader to ignore the app.  It's got automatic and manual toggle for dark mode (system preference or manual toggle), and DR doesn't render it correctly when it's enabled.

- Code spans inline with ! and @ community/user links cause the user/community links to not render

- Opening outside links in the same tab and returning back was causing lifecycle issues
    - Outside links now always open in new tab, "open links in new tab" option has been removed (open posts is new tab is still available though).

- Collapsing/Expanding the sidebars no longer collapse/expand inbox/report/application items to the default state

- Add route at `/registration_applications` to redirect to `/admin/applications` so the link in the "{User} has applied to join {instance}" emails from the API work if Tesseract is replacing Lemmy-UI.

- When updating community info/settings, any cached `getCommunity` response is updated.

- Custom emojis are no longer treated the same as regular markdown images.  Now display inline at 64x64 px.

## New Features/Enhancements

### Favicon Uses the Instances's Icon
Favicon uses the instance's site icon rather than the static Tesseract logo.  Automatically changes if you switch instances and falls back to the Tesseract logo if no site icon is available.


### Login Error Message Handling
Now has cleaner error messages if there is an error during login:
- Invalid username/password
- Invalid / expired / missing TOTP token
- Modals with additional info for non-standard login errors (registration pending/denied, banned)

### Registration Application Deny Reason Now Shown During Login
If a user whose registration application was denied attempts to log in, instead of a generic toast error message, a modal will pop up informing them that their application was denied along with the reason provided.

The reason is rendered as markdown, so if you include links for appeals, follow-ups, etc, those will be actionable.

### Registration Pending Indicator During Login
If a user tries to log in while their registration application is pending, instead of a small toast error, a modal will pop up with a more detailed and user-friendly explanation.

### Banned Indicator During Login
If someone has been banned from the instance, instead of a generic login failed toast, a modal will pop up with a more detailed explanation.

The modal will also try to fetch that user's details from the modlog to display whether the ban is temporary or permanent, the reason, and, if temporary, the expiration date.



### Admins Can Now Set Application Rejection Preset Reason
In Settings -> Moderation, admins will see a new section called "Registration Application Deny Template".  This allows you to pre-set a reason for registration application denials that can be one-clicked into the deny reason on the Applications page.



---

# 1.4.28

## Bugfixes
- [Bug] Default moderation template had a missing piece (community) and didn't really make sense.
- [Bug] Don't poll notifications from Notification system time handler if no active profile. The poll function didn't actually run, but no reason to call it if no profile
- [Bug/Annoyance] When highlighting text in the markdown editor and using the toolbar buttons (e.g. highlight a word and click "bold"), the text area would annoyingly scroll to the bottom.  No longer does it do that.


## Minor Changes
- [Settings] Moved inbox/notification related settings to new section in `/settings` page.
- [Notifications] Notification poll interval is now configurable
- [Infrastructure] Removed unused settings key for notificaiton rate
- [Infrastructure] Can now specify `section` URL param on `/settings` page to open the specific panel (useful for linking to a settings section; yet to be implemented elsewhere)


### Vote Viewer Now Available to Mods
If connected to an instance running API 0.19.4 or higher, the vote viewer is now available to mods for items in their communities.  I had always planned for it to be, but I wasn't aware that had been implemented in the API already.  Apparently it's been available to mods at the API-level since 0.19.4 (thanks @Blaze@feddit.org for pointing that out).

For those unaware, the vote viewer is accessible from the Moderation Modal -> View Votes... button.


### Posts
#### All User Defined Invidious/Piped Instances Available
The link menu / alternate source selector for YouTube-like videos now lists all user-defined Piped/Invidious instances instead of a single, static link to the currently-selected instance. 

### Community Profile Modals
#### Post Drafts Less Likely to be Accidentally Lost
When creating a post in the community profile modal, the "Return to Home" back arrow will now prompt you for confirmation if there is anything in the post form. Helps prevent accidental loss of post draft via mis-click.

#### Upload Cleanup
When clicking the "return to home" button from the "Create Post" panel, the `resetForm` function from the post form will be called which will take care of cleaning up any uploaded media that would otherwise be abandoned.


### Markdown Editor
#### Added new buttons to the toolbar
- Insert User Link
- Insert Community Link
- Table
- Code Block
- Formatting Help

The "Insert User/Community Link" buttons will let you search for a user and/or community and insert links to them in the body at the current cursor position.  The inserted links are in the `@user@instance.xyz` / `!community@instance.xyz` format.

The "Table" button will create a markdown table template.

The Code Block button is a menu which will let you select the lanaguage (or plaintext/other).

The Formatting Help button will load a modal with a markdown cheatsheet.

#### Toolbar Now Reflows
The markdown editor toolbar (with the formatting, emoji, image, etc) buttons will now reflow on mobile/small width screens rather than scroll horizontally.



#### Various Tweaks to Markdown Editor

1) Heading button is now a menu; can select headings 1 through 4
1) Fixed bug where highlighting text and using the toolbar buttons would always scroll it to the bottom
1) Numbered and bullet lists now give you three entries
1) On spoiler, code block, and lists, the cursor now goes to inside the block or in position for the first list item (respectively)
1) Highlighting text and clicking the "Link" button will now automatically put the text into the link label. For example, if you highlight the text "Home" and clicked link:
    - Old behavior:  `Home` -> `[Label](url)Home`
    - New behavior:  `Home` -> `[Home](url)`


---


## 1.4.27
### Bugfixes
- The 'Filter Annoying CC Licenses on Comments' wasn't working since the markdown pre-processor re-write. 
- Post titles are not longer linkified.  This includes unwanted `mailto:user/community@instance.xyz` email links when the titles contain `!community@instance.xyz` or `@user@instance.xyz`.
- Dynamically import separate CSS themes for HighlightJS depending on app theme.  Unfortunately, this is not reactive to changing the app theme without refreshing the page. 


### New Features

#### Misc
- Added "RemovePaywalls.com" as an option in the archive link selector

#### Inbox
- Can now set an option to expand inbox items by default. `Settings -> General -> Expand Inbox Items by Default`
- Can now configure how many inbox items are retrieved per page.  `Settings -> General -> Inbox Items Per Page`
- New inbox sidebar button to expand/collapse all

#### Reports
- Can now set an option to expand all report items by default.  `Settings -> Moderation -> Expand Reports by Default`
- Can now configure how many report items are retrieved per page.  `Settings -> Moderation -> Report Items Per Page`
- New sidebar button to expand/collapse all reports

#### Registration Applications
- Can now set an option to expand all registration applications by default.  `Settings -> Moderation -> Expand Applications by Default`
- New sidebar button to expand/collapse all applications


---

## 1.4.26

### Bugfixes
- Add `/report` route that redirects to `/moderation` so the email links from the API work correctly.
- Add moderation button to crosspost items
- Long links in the modlog were not wrapping when reflowing to mobile
- Pause markdown videos/audio when leaving viewport instead of destroying (same as how post videos are now handled).


### New Features

#### Support for Video Uploads
Less a "new feature" and more a bugfix for a feature I didn't realize already existed and mostly worked lol.  

The file upload handler sets the supported MIME types, but it has no way to enforce them (it's more a suggestion to the browser).  A user reported that they forced a video upload, and it worked, but was buggy.  This was a surprise since I'd never actually tested or even thought about supporting video uploads. 

So I patched up the upload handler to support `video/mp4` and `video/webm` formats.  The previewer will only show the first frame as if it were a static image, but it will no longer glitch out.  It will also automatically disable and hide the "Pre-convert to webp" options if a video is detected.

I'm not sure how useful this will be since most instances limit upload file sizes or disallow videos, but if you're on a supported instance, hey, you can do videos now.  


#### Moderation
Added support for issuing bulk community bans/unbans.  Highly useful if a known troll is roaming about and you want to quickly ban them from all of the communities you moderate.  It works a little differently depending on where it's invoked and whether you're a moderator and/or an admin.

In all cases, the expiration date, reason, and whether to remove content applies to all communities (e.g. the API is called for the same user with the same options and loops through the list of communities you moderate).

**User Profile Modal and Moderation Modal**:  
- New option in the user profile modal to ban/unban that user from all of your moderated communities. [Mods + Admins]

- New option in the "Ban User [From instance]..." form to "Ban All Remote Communities".  Will issue community bans for all *remote* communities you may be moderating in addition to the instance ban for your home instance. The "remote" filter is to avoid spamming the modlog in case you're an admin of a large instance (technically you moderate all local communities you're subscribed to)  [Admins Only]


**Community Profile Modal**:  
- The "Ban/Unban" option has been extended to allow optionally banning/unbanning the supplied user from all the communities you moderate. [Mods + Admins]



---

## 1.4.25


### Bugfixes
- When viewing a user's submissions in the profile modal from a `/c/community` page, the post meta is hiding the community and treating `inCommunity` as true.
- Removed code to switch between community icon and user avatars in CommentMeta component since that's actually useless since you can't browse just comments in a community.
- Comment card colors were not reactively updating when user was banned with content removal from site/community
- When removing/hiding a community, the local cache of the community details was not updated to reflect that; had to open the app in a new tab to get a new session in order to fetch it again.  The cache now updates on block/unblock/hide/unhide.



---

## 1.4.24

### New: Documentation for Mod Tools
I'm (slowly) getting documentation / screenshots written up now that the basic UI paradigm has stabilized.   Until now, only the server config/deployment is thoroughly written-up.

The first area of documentation for the frontend is for the mod tooling.

**See**:  [Documentation - Mod Tools](./docs/ModTools.md)

### Misc Bugfixes
- Comment image backgrounds were the same color as the alternate card color in light mode. Set the image background a shade darker

- Fixed bounding in Community Settings -> Team user items 

- Hidden communities were being filtered out; the documentation/description is vague, but hiding a community seems to hide it when non-admins list/search communities and prevent it from showing up in `/all` but users already subscribed or those going to it directly should still be able to see it.

- Tables now scroll horizontally instead of overflowing outside the page bounds

- Stupid invalid user/community link formats break the UI when clicked (e.g. `[anything](!community@instance.xyz)` and/or `[anything](@user@instance.xyz)`).  Even though "thEy WoRk iN lEmMy Ui !1!1!!!" they're not valid hyperlinks and should not be used. 

- Rendering of user/community links stopped if there were more than one in the same line of text.

#### Bugfix + Enhancement: More Markdown Pre-Processor Optimizations
In the previous release, I started breaking the markdown up into smaller pieces and processing it line by line.  This worked much better than trying to grok it all as one big blob and allowed me to simplify my regex patterns significantly.

In this release, I've gone one more step and am breaking the lines apart and processing text word-by-word.  This extra granularity has allowed me to further simplify regex patterns and address a few shortcomings such as missing a render when two user/community links were on the same line.

The main benefit here, aside from better and more consistent rendering, is that it has greatly reduced my reliance on regex look-behinds which are not widely supported.





### Tweaks and Enhancements
#### Modals
Could probably call this release "Modal Mania" because of all the work they've seen.

The modals were already horizontally responsive, and I wanted to make them veritically responsive as well.  They already kind-of were, but it was inconsistent in places. This required a significant refactor / overhaul of the main modal component which underpins all of the different modals. 

Refactored most of the system modals to take advantage of the changes.  


#### Misc
- When browsing a community or user's submissions in their respective modals, the modal is now taller and has scroll to top/bottom buttons for convenience.
- When searching a user's submissions from the moderation modal, the search is now scoped to the community relevant to the mod modal.




---




## 1.4.23
This is a minor feature release.  Nothing new for regular users, but some new capabilities for admins.

### Bugfixes
None discovered since 1.4.22 :)


### New Features
#### Tweaked Admin Area
Got rid of the sub-navbar menus to select which admin section is active.  Now uses a button bar like is used in the user profiles.


#### New Registration Application Manager
What started off as simply adding a text field to the registration applications so the deny reason could be recorded turned into just flat-out re-writing the whole registration application manager.

It makes me sad that I think this is a cool feature update and very few people will actually see it or know it exists lol.

**Changes include**:

- More compact/dense as it now uses the inbox / report form factor (expandable accordions)
- Much needed visual / design overhaul
- Can now specify the reason when denying an application
- There's a button which will let you search for alts of the same username. Very useful if you want to see if they're instance hopping and want to check if they're a good fit for your instance.  Also useful to see if someone is spinning up lots of alts rapidly (e.g. spammers).
- A colored badge on each entry indicates the application's status:
  - Pending action (Grey)
  - Approved (Green)
  - Denied (Red)
- Option to create a modlog entry when approving/denying the application.  Disabled by default, accessible via button and/or toggle.
  - Denying an application creates a "ban user" event using the deny text as the reason. This is useful in case denial emails are still not being sent out and the user wants to check their application status.
  - Approving an application will intelligently unban a user if they're banned (i.e. from a mistaken denial).  
  - Approving an application with a modlog entry will be a user un-ban (even if they're not banned, it'll still log it)
  - Approve unban message is `Registration application approved.`
  - Deny ban message is `Registration application denied: ${REASON_YOU_SUPPLIED}`

- More information about the applicant:
  - Signup email address
  - Whether the email address has been verified
  - Whether the signup email address is to a known disposable/temporary email provider

### Other UI Tweaks
- Crosspost items have less padding and rounded borders now

---

## 1.4.22

### Bugfixes
- Videos are no longer destroyed, just paused, when scrolling out of viewport
- Better truncating of user/community links 
- Better width bounding to go with the truncation fixes 
- Previewing a community in a modal while on the `/c/{community}` page of another community would override the modal's settings and show the community from the page route.
- Fixed Community Menu (from top navbar) overflowing in Firefox
- Added Loops to the hybrid view configuration panel to allow them to optionally always render as cards
- Title on `/site` page was still set to "Legal". 
- Add missing tooltips on user and community links
- Text was not flowing around the thumbnail image in compact view


### Tweaks
- Comments
  - Comments now use a card effect with alternating shades depending on the depth
  - Changed/standardized how the comment coloring is performed (jumped-to comment, distinguished, removed, etc)
- Community Groups
  - Added the community groups to the Community Menu in the top navbar
  - Updated the community group management components
- Sidebar
  - Decreaxed x-axis padding in the sidebar
- Misc UI
  - Updated several areas to work better with the updated community/user links
  - Reversing the action bar direction no longer reverses the vote button ordering (i.e. upvote stays on the left, downvote on the right)
  - Tweaked crosspost item component


## 1.4.21

### Overview
This release could *probably* be considered 1.5.0 rather than a 1.4.x point release, but I'm going to wait until I raise the minimum supported API level before bumping the minor version.  Currently, I do have support for 0.19.4+ features, but they're limited to a few minor things here and there (see [readme](README.md) for specifics).  I've also added the capability to automatically enable/disable features that require different API versions, so I'll likely be adding some more 0.19.4+ user-facing features in the coming releases.  The newer admin/mod features, if any, will need to wait until my own instance is updated past 0.19.3 since I will be unable to test those (I can test the user-level stuff against a different instnace with one of my alt accounts there).  

Most of the work in this release has been re-writing core components, getting rid of some legacy stuff, and stanardizing any redundant sections with shared components.  All of this is to make the upcoming task of porting to either Svelte 5  or React easier (haven't decided which yet; I'm annoyed that Svelte has so many breaking changes. We also use React at work which is more stable in the long term).



### Bugfixes
- Added missing padding on placeholder initials if there is no site logo

- If replying to a post/comment removal via a comment reply, send the reply *before* removing the item otherwise the reply will fail. (when I wrote that in the 0.18.x days, you could reply to removed comments and I just never used that feature since the behavior changed in 0.19.x)

- When switching instances or loading the site info for another instance into the site sidebar, the taglines would sometimes get stuck on the previous instance's values.

- Images would fail to render if `@user@instance.xyz` or `!community@instance.xyz` were in the alt text since it would trigger the pre-processor to convert them into user/community links.

- Memory optimization hacks; good lord Svelte is a hoarder and refuses to let go of shit.  This is a huge reason why I'm probably going to port Tesseract to React instead of going to Svelte 5. Even if the memory leaks are fixed in Svelte 5, they basically turned it into React anyway, so might as well use that.

- Fix bug where overlap in hashtags (e.g. #Photography and #Photo) would mangle the longer tag.


- Markdown inside of code blocks is no longer pre-processed.  This should fix quirks when viewing code snippets and some of the includes get incorrectly turned into hashtags.  It also let me simplify some of the regex patterns since they no longer have to account for code blocks with look aheads/behinds.

- Linking to a community on another instance (e.g. if you want to show the community on that instance rather than just linking to the community) no longer turns into a community action badge.  


- Bugfixes for bugs introduced during the rewrites have been omitted, but a lot of time was spent tracking those down and squashing them.


#### Bugfixes for Image Loading and Image Proxy
For efficiency, Tesseract tries to request `webp` versions of non-animated images at sizes appropriate for their use.  e.g. 128px for icons, 256 for thumbnail images, etc.   Usually this works, but sometimes remote pict-rs gets all pissy about it.  Before, this would cause the image to fail to load until opening it with the Zoom which requested the raw image URL.  Now, I've added error handlers for images to fallback automatically/gracefully:

[Desired Resolution and Format] -> [Desired Resolution] -> [Raw URL at default resolution] -> [Static Placeholder Image]

Similarly, if media proxying is enabled, it will use the same fallback path but via the image proxy.  Depending on the user-defined fallback behavior, it will either try the raw URL or return a placeholder image.

I've also added `apng` animated PNG to the list of supported images.  

The step to unproxy Lemmy's stupid federated proxy URLs has been moved from individual components to the image proxy URL generator function; that function is used for all images anyway and returns either the original URL or the Tesseract's proxy URL depending on user settings and if the admin has enabled the proxy module.  If image proxying is disabled by the admin or the user, it will not unproxy the stupid Lemmy URL and use it as-is.

Did I mention how stupid it is that Lemmy federates the proxied URL for images instead of just returning that via the API to that instance's users? If I haven't, then let me say it's *fucking stupid*.

---

### Guide: Optimizing Browser Settings for Tesseract
When using "click to play" on media posts (the default setting), the "autoplay" flag is implicitly set on the embed to prevent you from having to click multiple "play" buttons.  However, any player besides YouTube (e.g. Invidious, Piped, PeerTube, etc) requires you to click the video *again* after it switches from thumbnail to embed.  This is annoying, and YouTube only seems to get a default pass in Chrome/ium because Google says so.

To remedy this:

- In Firefox, this *mostly* works with the default settings and no settings changes are needed.  However, you can set the site permissions when a media tries to play (can't seem to get to that setting otherwise?) and change autoplay to "Allow audio and video" if needed.
- In Chrome(ium):  In the Tesseract tab, go into "Site Settings" and change Sound from "Automatic (Default)" to "Allow".  This is very counter-intuitive, but it does address the problem.
- If running as a Chrome(ium) PWA, the app permission settings will be at: `[Three Dots Menu] -> App Info -> Settings -> More Settings and Permissions`



### New Features
#### Initial Support for Loops Videos
This has been a feature request since Loops first went live, and I finally came up with a satisfactory way to integrate Loops media.  The media itself is easy to integrate.  The problem is that the metadata returned for a Loops video link does not include the video URL, and there's no way to derive the video URL from the available metadata.  In some cases, I can use the thumbnail image and massage that into a working video link, but more often than not, the thumbnail URL was to a pict-rs cached image rather than the value returned from Loops.

Right now, the Loops support is very "beta" but functioning well.  There are a few limitations:
- It can break at any time if Loops decides to go user-hostile and block non-browser requests via Cloudflare or something. Tesseract does a server-side lookup to basically scrape the video URL and then caches that for re-use.
- It can also break if Loops decides to crack down on "hotlinking" the videos.
- It only works with the main `loops.video` domain. For now, this is fine since Loops hasn't released its stack for self-hosting yet.   Like Piped/Invidious, I'm basically going to have to have a list of Loops instances to detect.  While this is great for decentralization, it's a huge pain in the ass when you want to make a nice client to integrate with them all.
- Loops videos are not "eligible" to always shows as embeds and must use click to play.  This was a choice on my end to avoid hammering Loops with requests for videos that may or may not be watched.  The lookup to get the video URL is only invoked when you "click to play" from the post thumbnail image.

- I've reached out to the Loops team to see if they would add the `oc:video` tag to the page metadata so the embed video URL can be obtained properly without such hacks.  If they ever do add that, then the integration *should* work cleanly like with PeerTube and without the clunky requirement to have a list of known Loops instances and then scraping the video URL from those.



#### Alt Text Now Supported
If the connected Lemmy instance is on API 0.19.5 or higher, the post form will now have an "alt text" field if the URL points to an image or video (uploaded or remote URL).  If the URL is not an image or direct video, or the API is below 0.19.5, the alt text field will not show up.


#### Under the Hood Highlights
- **Storage Compression**:  When data gets stored to sessionStorage, it's compressed first.  This has yielded quite a bit of savings and is a workaround for the 5 MB per-key limit on local and session storage in the browser.  5 MB sounds like a lot when it's all text data, but since there's a lot of redundancy in the data returned from the API (e.g. two posts to the same community will each have a full copy of the community details, sidebar info, etc), it fills up fast when you're taking snapshots of the current state (which his how Tesseract keeps your position in the infinite scroll feeds).  In the future, I plan to move to IndexedDB which does not have this limitiation and comes with additional benefits. The current plan is to use PouchDB as the wrapper library which opens the door to syncing with a Couch DB add-on to Tesseract's server component and allowing state to be maintained across devices :)

- **More Caching**:  For data that doesn't change often, such as site and community info, the loaders have been updated to first see if there is a cached record for that data.  If so, it will be used to fulfill the API call.  If not, it's requested from the server as before and cached until needed.  Currently, site (local and remote) and communitiy details are cached.  I'm looking into other places data can be cached, perhaps with a shorter validity period.

- **Initial Support for 0.19.4+ API Functions**:  Tesseract is still designed for 0.19.3 as its baseline.  However, I updated the JS client to the latest one for 0.19.7 since it's backwards compatible.  While I don't have all the newer features built-in yet, I do have some that become available when the API level supports it. 

#### Preview Community and User Feeds in Modals
You can now view a user's or a community's feeds in their respective modals when clicking a user or community link.

The preview has also been added to the moderation modal.  However, in the moderation modal, it limits the feed to just the user and community relevant to the item that initiated the mod modal.  e.g.  if you click the mod button for a post/comment in the FoodPorn community by user  Bob, the only submissions that will be shown are Bob's submissions to FoodPorn.  This should help with performing mod actions as you can check for patterns of rule-violating behavior without having to leave the mod tool.

Another use case is previewing new communities when you click on a pill-button link.  e.g.  if someone comments about a cool community and uses the `!community@instance.xyz` format (as they should), you can click on it which will resolve it automatically.  From there, you can click "Browse Community..." to see what kinds of posts it has before commiting to subscribing (okay, that's a very tiny commitment, lol, but you get my point).



#### New Feed Capabilities
The feeds were re-written as components to be more modular and consistent.  Mostly, if I did my job right, you won't think I did anything at all.  That said, they do have a few new tricks:

- Feed filter options for "Show Only [Liked | Disliked | Saved] Posts".  
- Feed filter options for "Show Hidden", "Show NSFW", and "Show Read Posts". Requires 0.19.4+ for show hidden and 0.19.6+ for "Show NSFW" and "Show Read"
    - Those options will be hidden if the instance is below the required API version.
- Can hide/unhide posts; accessible from the post action menu (three dots, top-right).  Requires 0.19.4+.
- Better state preservation. The snapshot subsystem has been overhauled, and the data is now compressed before being stored into session storage
- Refreshing the browser will now clear the snapshot for the current feed and re-fetch from the API. i.e. refreshing the app/page will pull the data from the API as expected instead of reloading a stale cache / requiring to manually press the app's refresh button.
- Manual pagination is now bi-directional.  You can page back without having to use the browser's 'back' button.
- Switching between communities will remember your position and sort options in each (until the snapshot expires. Currently 15 minutes)


### UI Tweaks
- Clicking a community link to bring up the modal will now allow you to browse the community from within the modal (nice for previewing communities)
- Clicking the `@username@instance.xyz` in the user profile modals will copy the username to the clipboard
- New vote buttons
- Redesigned comment count button on posts in feed; now shows unread count
- Redesigned crosspost container
- Moved thumbnail image to the left on link previews
- Moved 'debug' button into post/comment action menus (removed dedicated button)
- Instance names in the site cards are now clickable. Eventually they will open an instance modal with nice options (similar to user and community modals), but for now, it just goes to `/site/{instance}` to view the instance details in a nice page (rather than a cramped sidebar).
- Clicking "Home" in the sidebar will take you back to your previous scroll position.

#### Moved More Menus Out of the Sub-Navbar
I still like the UI element, but too many of the options got moved into dropdown menus in the sub-navbar.  Based on feedback, that seems to have sacrificed function for form.  In this release, I've moved many of the selectors closer to the elements they manage.  

- Community Browser instance selector, sort, and type menus have been moved above the community list.
- The sort and type selector menus in user profiles have been moved into the feed component itself.
- In the Inbox, the subnavbar elements have been removed completely, and there is a sidebar to the left of the inbox (similar to an email inbox)
- In the Moderation/Reports area, the subnavbar selector has been removed; like the Inbox, there's now a sidebar with the relevant filtering options.


- The main feed still has them in the subnav bar, though, since there's plenty of room on the left-hand side.

![](https://y.yarn.co/b483d800-7bfb-4e59-a438-21a73ac1be55_text.gif)

---

### Removed Features :(

#### Only Specific Forms of User and Community Links are Turned into Action Badges
There's so many wild and inconsistent ways people reference communities and users.  I originally tried to cover them all, but there were too many edge cases, overlaps, and times it's not desirable to do so  that it became impractical.  

Now, only three forms of user/community links will be turned into action badges; the rest will remain unmodified links or plain text.

**Valid Community Link Examples**:
 - `https://instance.xyz/c/community`
 - `!community@instance.xyz`
 - `[Text](https://instance.xyz/c/community)`

 **Valid User Link Examples**:
 - `https://instance.xyz/u/user`
 - `@user@instance.xyz`
 - `[Text](https://instance.xyz/u/user)`


**No Longer Valid / Won't Be Badge-ified**:
- `/c/community`
- `/c/community@instance.xyz`
- `/u/user`
- `/u/user@instance.xyz`
- `https://instance.xyz/c/community@instance.xyz`

The `https://instance.xyz/c/community@instance.xyz` format was removed because sometimes it is useful to link to a community on another instance to see differences due to federation, moderation, etc.  In those cases, changing it to a local link is not desirable.  The rest were removed because they were proving problematic to support with all the different ways people make user/community links.








As of this release, only the formats in the valid lists above will be matched and turned into action badges (load the modal for info about the community/user).  Other formats, or ones that are already linked, won't be touched.   

**Note that the `!` and `@` formats *do not* need to be manually linked in most Lemmy clients.**


#### Browsing Favorites / Groups as a Feed
This capability was always experimental.  The initial implementation wasn't great, but it worked well enough, and I had a plan to improve it.  Unfortunately, before I could put that into motion, the Lemmy devs, in their infinite "knows better than everyone else / if Lemmy UI doesn't use it, no one should" wisdom, removed the post ranking metrics from the API.  This meant I could no longer do any kind of sorting beyond score and date.  

So, since then (0.19.0 or thereabouts), the custom feeds feature has remained in place, crippled, and begging for death.  In 1.4.21, I finally decided to put it out of its misery.

Community groups and favorites are still available, but they're only used for organizing communities now.  Favorites give you quick access to your most-visted communities, and groups are still useful to keep tabs on your subscribed communities.

I do have a plan to resurrect the feature, but it's going to require backend support.  I have a partial Tesseract API server, but I've not worked on it in a good while.  Even still, if I do dust that off and go that route, custom feeds will only work for the "default" instance Tesseract is deployed to and only if the admin runs the API service for it.  Not sure how practical that will be, but since it's something I would want to offer on my own instance, I may still work toward it, though at a low priority.

#### Option to Disable Automatic Timestamp Updates
I changed the way the timestamps on posts/comments, etc update.  Prior to this release, each had its own `setInterval` in the component and operated independently. In this release, I introduced a system timer that dispatches events at an interval.  The date components now simply listen for this event and recalculate. With this change, the option to disable them doesn't really provide any benefit.  


---

### Changes and Enhancements

#### Community Explorer
- Moved listing type, sort options, and keyword search out of sub-navbar and into the "feed" area.
- State is now maintained in the URL, so paging back and forward will keep the state correctly (it didn't maintain any state previously)
- Calls to local and remote `getSite` are cached in session storage to reduce bandwidth (used to populate the site sidebar)
- Tweaked the 'subscribe' buttons
- Added a dedicated button to go directly to the `/c/{community}` page for each entry
- Clicking the community name will open the community modal for additional options
- The selected instance is now route-based rather than URL param or internal state variable.  e.g.  `/communities/{instance}`
- Your home instance now has a "home" icon indicator in the instance dropdown

#### User Profile Pages (including local profile)
- Uses the new, component-based feed rather than the bespoke one used previously.
- User banner, stats, "about" info, and moderates list is now above the feed rather than in the sidebar (except local profile; that's still to the side except on mobile)
- "Moderates" list is no longer a separate accordion. That list has been moved into the "About Me" section (similar to user profile modals)
- Sidebar is now populated with the home instance details for the user (banner, icon, name, stats, admins, site description, legal, etc). Non-local profiles only.
- Sidebar site info is now cached in the browser's session storage to reduce network traffic and load on remote servers
- Better state preservation when navigating in/out.  Right now, the snapshot validity is 5 minutes for user profiles versus 15 minutes for the main feed and communities. 
- Integrated search. No longer just a shortcut to the `/search` page with the user pre-set.  
- The sort options and type (posts/comment/all) menus have been moved from the sub-navbar to above the feed.
- Lots of under the hood changes, none should be visible except what's listed :)

#### New Inbox
- Looks/behaves much more like an email inbox
- Inbox items are collapsed into accordions. Open to view the message.
- Configurable default inbox: can be "all " or "unread".  Setting is in Settings->General->Default Inbox
- Collapsible side menu to switch between message types, all, and unread. Also has convenience pagination buttons. The "mark all as read" button has also been moved here.
- Removed the dropdown menus from the sub-navbar; those are now in the collapsible side menu
- The envelope icon to the left of the message container is the "mark as read/unread" button.


#### New Moderation/Reports Manager
- Removed the custom buttons from the sub-navbar. Filters are now in its sidebar.
- Now uses the same layout as the inbox
- Has a sidebar for switching between unread/all and filtering by community.  Also includes pagination.
- The check button to the left of the collapsible report is the resolve/unresolve button.  Green check = resolved, white check is unresolved.
- Unread reports are bolded
- Can filter reports by community
- Removed the moderation action form since it's a brute to maintain and has received mixed reviews from users.
- Each item has a few quick action buttons for mod tasks. Use the "All Mod Actions..." button to bring up the moderation modal to access all options.
- Looks less awful on mobile :)


### Known Quirks
- Changing any of the infinite scroll options (or switching between infinite and manual pagination) requires any existing feed snapshots to be cleared.  If you switch options from the quick settings menu, it will automatically refresh the browser as a workaround hack.  If you switch them from the main settings page, you'll need to manually refresh the feed or the browser to clear them.  Again, I have a way to deal with this, but I'm not certain it's the most graceful (though it's more graceful than force-refreshing the browser lol).

#### Twitch Videos (Not Possible)
I also had a feature request to support Twitch embeds.  It seemed possible (they provide the video embed player URL in the link metadata), but I can't make them embeddable because Twitch cockblocks embedding except from the "big" social media sites.  So, no Twitch video embeds for Lemmy, but not for lack of trying.

```
Refused to frame 'https://player.twitch.tv/' because an ancestor violates the following Content Security Policy directive: 

"frame-ancestors https://reddit.com https://www.reddit.com https://old.reddit.com https://new.reddit.com https://www.redditmedia.com https://twitter.com https://cards-frame.twitter.com https://tweetdeck.twitter.com https://discordapp.com https://discord.com https://embedly.com https://cdn.embedly.com https://facebook.com https://www.facebook.com https://vk.com https://x.com".
```





---

## 1.4.20

### Bugfixes: Minor
- May only have been an issue for admins, but administratively hidden and removed communities will now no longer show up in community autocomplete results.
    - They will still show up when filtering for a community in the modlog though (though only admins should be able to see those results)
- Fixed full URLs not truncating properly when "Show Full URLs" option is enabled
- Fixed issue with click-to-play not working on post pages if media is disabled on post pages.
- Disable "reply" button if post is removed or deleted
- Disable 'report' post action if post alredy removed (I *think* deleted posts can still be reported, though. Need to double-check the API behavior.)
- Disable 'report' comment action if comment already removed.
- Fixed Gifs not previewing if just 'url' is present (i.e. no thumbanil_url or embed_video_url)
- Indicate post's removed/deleted/lock state in the comment item component when viewing profiles
- When "Match Crossposts on Title" is enabled, posts with the same title but different URLs will no longer be erroneously rolled up
- "Distinguish" now only shows on your own comments if you are a moderator.  This matches the stupid API behavior because...the Lemmy devs don't listen to anyone. (Wow I really *can't* go one release without throwing deserved shade at them, can I?)
- Modlog now shows hide/unhide and remove/restore community events.



### Bugfixes: Major
#### Image Cache Housekeeping
Fixed image cache housekeeping not working correctly.  

There were changes to `fs/promises` that I missed, and some functionality changed along with a few of the member variables being deprecated.  This was causing the directory content calculations to silently fail safe (returned 0 rather than crashing).  

As a result, nothing was ever getting evicted from the cache.

If you are using the cache functionality of the image proxy, you will likely notice that startup takes a bit longer this time if you have housekeeping set to run at startup (recommended).  This is because it will be housekeeping all of the cached objects it should have been housekeeping all along.  Once the initial cleanup of the backlog has completed, further startups should complete in the normal/expected amount of time.

If startup takes too long, you can always delete all of the `.cache` objects manually from the mounted cache folder.  See the [Media Proxy docs](docs/MediaProxy.md) for configuration options.

## New Features / Changes

### "Hybrid" Post View
Rather than a binary choice of "card" or "compact", hybrid view will let you set a list of post types (image, video, article, etc) that you want to render as cards while displaying everything else as compact.  This is the new default view.

This is useful, for example, to let memes and news articles co-exist without having to expand every meme image manually in compact view or view every article thumbnail card-sized.

The behavior and post types can be configured from `Quick Settings -> Post Style -> Hybrid` and then clicking the link for "Configure" -or- from `Settings -> Feed- > Hybrid View Configuration`

By default, only image posts are expanded to cards.

In addition to setting the types of posts that should render as cards, you can optionlly keep read posts collapsed into compact view when they would otherwise be cards if they were unread.  This is enabled by default, but can be easily disabled.

There is also a new regular view called "Compacter".  It is the same as compact but post body is fully collapsed.  Similar to "More Compact" but not full width.




### Post Form Now Automatically Searches for Crossposts/Duplicates
When you are creating a post, the URL will be searched to see if you're posting something that's already been posted.  It should do this automatically when the URL field changes or the URL is set and the community changes.  The behavior is slightly different depending on if a community is defined:

1) If the community is **not** set, then it will search for any posts on your instance matching that URL.  The label will be "Crossposts".

1) If the community **is** set, then it will do a remote API call to search the *home instance of that community* for any posts to that community with that URL.  The label will be "Existing posts".

The latter behavior is particularly useful if you want to avoid accidentally posting a duplicate that may have been posted by someone you've blocked or by someone your instance doesn't federate with.  Those posts may not be visible to you locally, so the remote search should help identify them so you don't clutter up the feed and/or add extra work for the moderator who usually removes duplicate posts.

If for whatever reason it doesn't trigger automatically, the "Magnifying Glass" icon to the right of the URL field can trigger the search manually.

Also note that behavior #2 only works if you're posting to a Lemmy community since it makes a remote API call to the community's home instance using the Lemmy API.  Thus, it cannot search a remote Kbin/Piefed, etc instance.  

### Can Now Vote on Crossposts Without Clicking Into Them
Vote buttons have been added to the crosspost items, so you can now vote on them from the feed and post.

In the feed, since the cross_posts are rolled up manually from regular post objects, the voting works as expected.

Unfortunately, when clicked into a post, the API call does not add the `my_vote` variable to the `cross_posts` array.  So while you can vote on the crosspost, and the vote will be correctly recorded, your vote will only display correctly while you're on that page.  Since the API doesn't return the vote you cast, on refresh or subsequent loads, the vote button will not indicate which way you voted.  If you try to vote again, the score will not necessarily change.  Yet another feature I want to implement hampered by dumb API decisions.

### DailyMotion Video Embeds Now Supported
I forgot Dailymotion existed until someone posted a link a while back.  Upon inspection, they have an embed API, so I figured why not add support for it.

### Moderation Menu Has Been Replaced With New Moderation Modal
The moderation menu on posts and comments has been removed.  The reason is that the menus were getting cluttered when new things are added, especially for admins who have more options available than regular mods.  Rather than creating sub-menus (yuck!) or introducing separate UI elements for admin controls, I've just scrapped the whole thing and started over.

The "mod" button will now open a modal containing all the mod tools that are appropriate for the item.

The cool thing about the new mod modal is that all of the tools are packaged into it.  It doesn't open separate modals for banning/unbanning, removing/restoring, etc.  It even has the community details available so that mods can reference the rules when issuing actions without leaving the item they're working with.

#### Current Capabilities and Features
- A mini-banner heading showing the current community with its icon and the creator of the item and their avatar/info.
    - Both communtiy and user are clickable to bring up their respective profile modals to get more info (these pop up in separate modals and aren't integrated into the mod modal)
- Pin/Unpin the post to the community
- Feature/Unfeature the post on the instance (admins only)
- Lock/Unlock the post
- View the community details relevant to the current item (post or comment)
- View the votes for the item (admins only until whatever version of Lemmy lets mods do this for their communities)
- Remove/Restore the post or comment (shows the post meta header or the comment meta header and comment previews)
- Send a DM to the post/comment's creator
- Purge the post or comment (admin only)
- Ban/Unban the user from the community
- Ban/Unban the user from the instance (admins only)
- Distinguish/undistinguish mod comments 
- View the user's modlog history
    - Defaults to their history in the community relevant to the current item
    - Can toggle between their modlog history in the community and their full modlog history
    - Also has link to the full modlog viewer filtered for that user.


All tools stay within the same modal, and it shrinks/expands to accommodate the various integrated tools.





### Improved Community Modals
To reduce clutter, the "Subscribe/Unsubscribe" (RSS Icon), "Favorite/Unfavorite" (Star), "Add/Remove to Group" (3 People) buttons have been moved to the modal title bar as icon-only buttons.  

"Create Post" is no longer a link to the community's create post page. It now shows the create post form right in the modal.  There is a button in the upper-right which will take you to the `/c/{community}/create_post` page if you want to use the old form ( 🖼️ 👩🏻‍🦰 🖼️ it's the same form).

For admins, "Remove/Restore Community" and "Hide/Unhide Community" have been integrated.  They will also now prompt for an optional reason to show in the modlog.

The "Community Details" is now a panel (like in the moderation modal) rather than being an accordion.  Same functionality, different packaging.

You can now view the community's modlog directly in the modal.

Added the direct ban/unban user tool to the community modal.  Instance admins and community moderators can now manually ban/unban users from the community without having to dig up a submission.  Useful to revisit an old ban or to ban a known troll making the rounds before they hit your community.


### Improved User Modals
The "Copy Lemmyverse Link" and "Copy Actor ID" buttons have been moved to the modal's title bar as icon-only buttons.
    - The "Share" icon is for Copy Lemmyverse Link.  This is used to share an instance-agnostic link to a user.
    - The "Link" icon is for Copy Actor ID.  
    - The box with arrow in top right icon will take you to the user's profile.

Can view user's modlog history directly in the modal

Can send a message to the user directly from the modal

For admins, the "ban/unban user" form is now integrated directly into the modal.



### Piped/Invidious Support Changes
Since YouTube has gone to war against alternate frontends (and is sadly winning), most public instances no longer work.  However, I believe that private/small instances may still function as expected. 

Since the public instances are pretty much all broken or only partially working, **Invidious/Piped support has been modified to only be enabled if the user supplies their own instance.**


The distinction between Invidious and Piped has also been removed since the link formats are interchangeable.  Now, in Settings, the YT frontend has been changed to just "YouTube" and "Custom".  The custom instance list can contain Invidious and/or Piped instances.

The alternate link selector for YouTube videos will now also only show "Invidious/Piped" option if you have defined at least one. 

As before, multiple custom instances can be defined but one will need to be selected as the default.  That one will be used for the alternate source selector and, optionally/separately, as the embed player.

**Note**:  You can keep YouTube as the default embed player while also adding a custom Invidious/Piped instance to act as alternate links in the alternate source link menu.

The internal lists of public Invidious and Piped instances has been combined and **are only used for detection**; formerly, these could be selected as frontends.

On the admin side of things, the env var `PUBLIC_CUSTOM_PIPED` has been deprecated.  For now, it will simply be combined with the `PUBLIC_CUSTOM_INVIDIOUS` list.  Eventually the Piped list will be removed, but that is TBD.  Those lists are also only used for detection and are no longer presented as possible frontends for the user to select.  If a user wants to use Invidious/Piped, they *must* supply their own instance in their settings.


## Misc UI Tweaks
- Lots of UI polish all around.  Too numerous to list individually.

- Legacy user and community menus in `/u/{user}` and `/c/{community}` cards have been removed.  The functionality has been moved into the respecctive user/community modals.

- Community link pill buttons are now gray instead of orange.  The orange was just...too much.  User link buttons are still blue.

- Better display of metadata from posted links

- Cleaner compact view (also incorporates metadata display better)

- Feed images are limited to a maximum of 40% viewport height.  This still gives the nice "card" effect while also not making posts massive. They were formerly limited to 80vh, but even this is no longer needed since the ZoomableImage component was integrated.  

- Removed user settings for post and feed image sizes since they're no longer needed with the new compact and card view tweaks described above.

- Post body images are now hidden in the feed and a link shown in their place.  Clicking the link will open them in a preview modal.  Unless the option to disable inline images is turned on, then they will still show as embeds when opening the post.  This should help compact mode stay compact rather than some of them being massive with one or more post body images slipping through.

- Direct video (mp4, webm, etc) posts now use the video metadata for the thumbnail if OP didn't post a custom one. Also works in compact view now.

- Bandcamp embeds are now smaller.

- All media renderers now show the embed metadata alongside the post details.

- Direct audio links (MP3, etc) now have renderers; they only rendered in the markdown post body and comments previously. Now if the post URL is an audio link, a player will embed.


- Show link selector, link, and MBFC even if metadata fails to load in preview modal.  Also show that info while fetching metadata.



## Better Integration with Pifed/Mbin/etc
When clicking a link that goes to a post or comment, Tesseract will massage the URL to attempt to render it locally (extract the instance and post ID and do a remote API call to fetch it for local rendering).  This works great for Lemmy, but non-Lemmy services which use the same `/post/{id}` and `/comment/{id}` URL format don't work with Lemmy API calls.  

Before, this would throw a generic 500 "Failed to fetch post" error.  The UX has been improved in this release by showing a clearer error message as well as a button to visit the post on its home instance.

Additionally, if a local post fails to load, there's now conditional verbiage to indicate a local post may have been removed by its creator or removed by a moderator, and there is no button to visit it on the home instance (since it *is* the home instance).

---

