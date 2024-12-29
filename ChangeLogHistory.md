# 1.4.0 - 1.4.19

## 1.4.19

### UI Changes
"Favorites" (star button) menu in the top navbar is now called "My Communities". Icon is now the icon for community.
    - This was changed since the favorites menu was enhanced to also show your subscribed communities. The change better reflects the capabilities of the menu since it's the current way on mobile to access the community subscriptions that are in the sidebar on desktop.
    - "Subscribed" is now the default selection
    

"Browse Communities" button changed to say "Explore Communities" 

Communtiy items in sidebar and "My Communities" menu have favorites toggle and indicator icon.
    - Allows to quick favorite/unfavorite communities




---


## 1.4.18

### New Features
#### Favorites Dropdown in Navbar Now Has Subscribed List
The "Favorites" menu (star button) in the top navbar has been expanded to show both favorited communities as well as your subscribed list (with filter ability).

This is particularly useful on mobile to give quick access to your subscriptions without having to go through the Browse communities page which is clunky for this type of usage since it is limited by the API (as it's intended more for browsing communities than navigating them).

The "Subscribed" list is also filterable in the same way the sidebar filter is (they're literally the same components, just repackaged).

Until I get the sidebar and main layout re-written such that the sidebar can be used on mobile, this should work as a nice stopgap to provide feature parity with desktop usage.

#### UI Tweaks
Nav bar menus now have an indicator effect/color when open




## 1.4.17
### Bugfixes
- Addressed some community icons that wouldn't display properly due to pict-rs refusing to generate thumbnails less than 128px
    - [e4cc7fe6] Re-add webp as preferred format when generating image URLs
    - [8ba58e6a] Remove 48 and 64 px from the list of avatar sizes since pict-rs often fails to generate ones less than 128px

- Fix bug where community modal cannot load if call to `resolveObject` fails and the community is already known
    - [774a41e0]  Separate resolveObject and getCommunity steps into separate try/caches in Community Profile modals

- Fix bug where thumbnail size and preferred format for image URLs were being ignored when media proxy disabled
    - [352ff2c0] Apply format and size to default URLs if not going through image proxy



---

## 1.4.16
### Bugfixes
- [26d26798] Add error handling in case bad URL sent to `isImage`, `isAudio`, `isVideo` helper functions.
- [cbe44611] Only render `[tag syntax]` flairs in post titles if they are on the beginning and end
- [cbe44611] If entire post title is in brackets, do not treat it as a flair
- [6b99e0cd] Fixes issue where post was not being marked as read correclty on newer API versions since it was sending a single post ID instead of an array.


## New Features in 1.4.16

### Can Automatically Mark Posts as Read While Scrolling
Per user request, a new option and feature has been added that will automatically mark posts as read as you scroll past them in the feed.  This is disabled by default, but can be enabled in `Settings -> Feed -> Mark Posts Read on Scroll`

Currently, a post will mark as read when 60% of it is in the viewport for more than 1.5 seconds.


### Better Crosspost Attributions
Crossposts are great from a user standpoint as they reduce clutter, but they often bury other communities since it's not easily apparent where it was cross-posted from and by whom.

Now, when crossposting, the default cross-post header has been updated to give better visibility to the original:

`Cross posted from "ORIGINAL_TITLE" by @ORIGINAL_USER@instance.xyz in @ORIGINAL_COMMUNITY@instance.xyz`

The title is linked to the canonical AP URL of the original post (same as before but with text applied instead of a bare link).  The original user and original community links are in the standard user/community link format.  In Tesseract, both of those are clickable to view the user and community profiles.

Since Tesseract will automatically resolve unknown communities if you're logged in, this should give a visibility boost to communities that may go overlooked.


### Sidebar Community List
#### General
The sidebar with the subscription list has been completely overhauled.  I'm now using standard `CommunityLink` components which have the benefit of opening the community modals.  The community buttons are still buttons and will take you to the community page.  Clicking the community text will open the modal while clicking the button around that will take you to the community page.

The inline menu buttons have been removed since all of those functions are also available from the community modals. This saves a good chunk of memory since a discrete menu is not required for each element now.

The instances for each community are now also shown by default.  You can disable this by turning off `Settings -> General -> Show Instance Names in Sidebar`.

#### Community List Filtering
I've also re-implemented the filtering of the subscription list.  It is now more granular and can accept modifiers as well as take the instance into account.

**Default**

By default, the filter query will be a case-insensitive `contains` comparison against the community's display name (or system name if display name is undefined).

It will now also accept an instance if you include it after an `@`.  The instance is compared with a case-insensitive `startsWith` against the actor id of the community.

- Example 1: `new` will return any community containing `new` in its display name (or name if display name is not set)
- Example 2: `new@lemmy.` will return `News@lemmy.word`, `LegalNews@lemmy.zip`, etc.

**Filter by Name (rather than display name)**

If you want to filter the list by the community's system name rather than the display name, prefix the filter with an `!`.  

The instance is also accepted here if it is provided after an `@`.
- Example 1:  `!new` will return any community whose system name begins with `new` such as `news@dubvee.org`, `news@lemmy.world`, `newcommunities@instance.xyx`, etc
- Example 2:  Using the same example from above, `!new@lemmy.` will return `news@lemmy.world` but not `LegalNews@lemmy.zip`
- Example 3:  Can be used if you want an exact match based on the community link syntax (!community@instance.xyz)

**Filter by Instance**

To filter by instance, prefix the filter with an `@`.  This will only show communities belonging to the specified instance.  This filter method uses a `startsWith`, case-insensitive comparison against the hostname of the community's actor id. 

This is particularly helpful if you want to see what communities you're subscribed to on a particular instance.  AFAIK, there is no way to get that info from the API.

### UI Tweaks
#### Independent Preview Button in Post Create/Edit Form
Rather than previewing the entire post, including thumbnail and embed metadata, you can now also preview just the markdown of the post body.  

The old behavior was more of an intentional choice that didn't work out well in practice / real-world use.  You can still preview the entire post (that hasn't gone away); you just have more granularity in what you preview.

#### Added "Fact Check" Section to Alternate Source Link Menu
There are one or two "Fact Check" options available in the alternate source link menu now.
- MBFC, if avaialble
- SpinScore.io (shows on all links)

I'm not a fan of AI-generated ~~summaries and analysises~~ anything, so I probably won't be using that, but it's an option if you want to use it.

#### Direct Video Embeds Now Support Custom Thumbnails
If a custom thumbnail is provided for a post where the URL is to a video, the thumbnail will now be used for the click-to-play overlay.  

## Other Stuff
- [7c8c96fb] Update MBFC dataset
- [c6ce2213] Update MBFC removal template
- [c908b886] Add option to disable automatically refreshing dates in the RelativeDate component (post/comment published/edit times, etc)
- [135ed9cd] Changed animation on menus to `slide` instead of `scale`


---

## 1.4.15
Internal / unreleased version.  See 1.4.16

## 1.4.14
### Bugfixes 
- [322a00f5] Reduce subnavbar button gap on smallest viewport to 0 to accommodate smaller displays.  Additionally, load the "post view mode" menu from top-center instead of top-left.

- [c9254038] Fixed another case of infinite loop race condition when resolving community/user when no modlog actions matching the query exist.  This _should_ be the last time I have to fix this. Added a `loading` flag so it can't run concurrently.

### Bugfix + Enhancement
#### Community and Person Autocomplete Search Inputs
These are based on the API's search endpoint, and Lemmy's search kind-of sucks in a lot of ways.  The relevant suckage is that when you've got the search type set to User or Community, it only searches against the name and title/display name and doesn't factor in the instance at all.

So, if you enter `news@lemmy.world`, you won't get any results because that's not the `name` or `title` of the community.  If you just type `news`, you get anything (remote or local) that has the word `news` in its name or title (which is a lot).  There is also no way to scope the search for `local`. 

Ok, so you have to scroll through 214 results to get to the right "news" community?  Well, yes, but actually no.  This part is my fault, though.

The autocomplete components did not incorporate any pagination logic and could only show a maximum of 50 results (max API allows per page).  The _hope_ was that Lemmy's search would suck less over time and the query could be tuned to make sure your desired object was within the first 50 results.

Still waiting on that.

So now, the auto complete components have been adjusted to compensate and extended with infinite scroll pagination:

1) It will first look for an exact match to the provided community.  If the community is local, it can resolve with or without the `@instance.xyz` suffix.  If the community is remote, the instance suffix is required for an exact match.

1) If an exact match is found, it will be the first item in the results

1) The query is passed to the search endpoint as before, ignoring anything after `@`.  e.g.  `news@instance.xyz` just queries `news` since the instance name isn't factored into the search (and works against it)

1)  Any results from the search step are appended to the results *after* the exact match (if any)

1) The autocomplete dropdown now does infinite scroll pagination for the search results.

This should make both the person and community auto complete components more useful and fix the issue with the 50 item limit.


---


## 1.4.13
### Bugfixes
- [0ed97991] Don't badge-ify hashtags if the hashtag linkify option is disabled
- [ce5a310a] Make markdown text reactive (and re-run pre-processing step) to changes to the enable/disable hashtag setting.
- [704e2d78] When clicking the user/community links in the modal, close the modal when navigating to the target (previously modal stayed open)


### Enhancements
- [3b8ef653] Update banner when viewing a post on a remote instance to use more concise verbiage and add an extra button to link to the post's canonical instance.
- [ec8c4bfe] User and Community links are now `a` elements rather than `button`.  Allows middle-clicking or right-click-> open in new tab to immediately open the profile/community in a new tab without having to click through the modal. Regular clicks still open the modal.

### New Feature:  Synthetic View Modes
Under the hood, there are still only two main types of view:  Card and Compact

However, Compact view is affected by several options which can be combined to create different view styles.  

The "compact/card" switcher button has been replaced with a selector menu to select from one of 6 views:

1) **Card**:  The flagship Tesseract post view.  Posts are shown as cards with all the media embed bells and whistles.  Post body preview is set to 240 characters.

1) **Compact**:  The classic "compact" view as of 1.4.12.  Feed margins are present, post images are thumbnails, the post body preview is 240 characters, and no media is embedded unless the post is expanded into card view.

1) **Wide Compact**:  Same as "compact" but without the feed margins.  Posts span the full width of the display.  Clicking the thumbnail image or the "expand" button in the post action bar will expand the post into card view.

1) **More Compact**:  Same as "wide compact" except the body preview length is set to zero and can be expanded.

1) **Ultra Compact**:  Same as "wide compact" except the thumbnails and the post body are hidden.  Post body cannot be expanded, and you will need to click into the post to see it.  Post can be expanded to card view only with the "expand" button in the post action bar. Expanding into card view does not reveal the post body, only the thumbnail image (if present).  If the post is a media post, the embed will be available (either in full or click-to-play depending on settings)

1) **Reader**:  Same as "wide compact" except the entire post body is shown (up to 10,000 characters).  


More views may be added along the way, but for now, those should cover more use cases without having to manually fiddle with the various options.

---


## 1.4.12
### Bugfixes
- Fixed reactivity on modlog filter lookups (sometimes they got into a fetch loop)
- Fixed unhandled exception when a bad match occurs when detecting community/user links to be badge-ified (backported to 1.4.11)




### Enhancements

#### Compact View Refreshed and is No Longer Second-Class Citizen
The 'compact' view has been refreshed. Now _slightly_ more compact and powerful. Thumbnail images have been moved to the right side so they can be moved higher up in the post card while also keeping the left side consistent if there is no thumbnail image.

Compact mode now no longer automatically disables the feed margins.  You'll need to use the "toggle margins" buttons in the navbar to make them full width (the setting will persist, so you only need to do it once).

It also works quite a bit better in mobile, though not perfect (there's not much difference in overall post height when it's scrunched down that far).

That said, "compact" view is _mostly_ designed for desktop though I've done my best to make sure it looks presentable on mobile as well.


Posts can now also be rendered in compact mode on the post pages (e.g. /post/12345).  All media and image posts, though, will still default to "card" mode (but can be minimized to compact).  This was chosen as a compromise between not making article headline images huge and having to click twice to show an image post (e.g. meme) in full when clicking into it.

#### Adjustable Preview Length in Feed
Added a new setting (`Settings -> Feed -> Post Body Preview Length`) to allow setting the number of characters that show in the post body in the feed before requiring a click of 'expand'.  Can even disable the body previews if you want really compact posts.  This setting is also available in the "Quick Options".

The default is 240 characters (same as the old hardcoded value in prior releases).

**What's the difference between 'Disabled' and '0'?**

Setting the body preview length to `disabled` will hide the post body component completely in the feed (including the expand button); you will have to click into the post to see the body at all.

Setting it to `0` will not show the body preview contents but will keep the "expand" button to enable you to view the post body in the feed if you wish.


#### Possibilities for Synthetic View Modes
I really don't want to (and have no plans to) create and maintain more than two basic types of view.  

That said, the compact view is flexible since it's affected by several different config options.  In the future, I may add some "synthetic" view modes that change the margins, body preview length, and other config options to certain presets.

Ideas:
- **Reader View**:  Compact posts, full width (no margins), and shows most (or all) of the post body.

- **High Desnsity Mode**:  Compact posts, full width (no margins), post body preview disabled, flairs disabled, and thumbnails disabled (disabling thumbnails isn't a feature currently but can be)

- ??? (Suggestions welcome)




#### Link Preview Modal Can (try to) Load the Link in an iFrame
Added a button to the bottom of the link preview modal that will let you try to view the link in an iframe.  Not all websites allow this (they set the `X-Frame-Options` header to disallow it), but enough do that this feature can still be useful.

I tried doing a pre-flight check to determine if the link allowed loading in a frame and conditionally hide the button, but hit several snags:
1) Browser-side:  CORS policy would only allow opaque fetches (which, by nature, don't return the header I need to check). 
1) Browser-side:  Checking the onLoad event from the iframe doesn't differentiate between success and failure
1) Server-side:  Tried adding an API endpoint and doing a server-side fetch to get the target page headers, but Cloudflare said 'fuck off, these are _my_ M&Ms'
1) Server-side:  I started adding shims to get past Cloudflare, but quickly realized that is not a cat/mouse game I want to play.

So, the "IFrame" button will always be present/enabled on desktop view and may or may not work for any given link.  




#### Streamlined Modals to Reduce Memory Consumption
Have reduced memory consumption by about 15-25% overall

Removed the embedded action modals (ban, remove submissions, etc) from moderation buttons and am calling the "shared" ones. 

Ironically, this is basically putting those back to the way they were when I first forked from Photon.  The problem, then, was that they weren't reactive and you had to refresh the page to see the results.  Not ideal.

That was addressed with the new event dispatcher I added...

#### Switched from Bindings to Event Dispatchers/Listeners for Reactivity
In several places, variables were bound between 3 and 4 levels of components for the purposes of triggering state changes.  This worked but was cumbersome and often left some things in the old state because there was no direct link between the component initiating the action and the one that needed to react to it.

I already used Svelte-native dispatchers in many places, but there were some components that didn't have a direct link to receive the dispatched events (similar to the bound variable conundrum)

Once I setup a global dispatcher, I started reconfiguring the reactivity to work with those events rather than binding everything down a huge chain of components.

This is expanding upon the reactivity enhancements first introduced in 1.4.2.



---


## 1.4.11
### Bugfixes
- [1751d2e6] Don't fire swipe event if insde a text area or if selecting
- [e407e126] Don't close comment edit modal if clicking outside of it
- [42042b86] Fix `code` and `codespan` renderers so they don't make the inner text transparent when truncated with the fade effect
- [feb8a195] Add `referrerPolicy=no-referrer` to zoomable image element; should help with some sites blocking cross-origin images fetches.
- [721b5c2d] Don't badge-ify hashtags in subnavbar post title

### Enhancements
- [3f905240] Quick settings are now in a column layout on desktop (reflows to rows on mobile).


---

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
- [3a6b348b] Reimplemented access control logic to community settings and admin panel
- [31d204e6] Fix reversed conditional on ban/unban result toast message.
- [b5bbede3] Fix community profile avatar to use initials rather than adventurer icons as placeholders

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



...

## 1.2.9

### New Features and Notable Enhancements
The last release was mostly for the mods/admins, so this release has something for the users.  Several somethings, actually.

- Emoji Picker and support for your home instances's custom emojis.
- HTML5 Media embeds in posts/comments. Uses the same syntax as Lemmy-UI / images
- Ability to favorite communities
- Ability to create groups of communities
- View favorites or any of your groups as a custom feed
- Option to open posts in a new tab (separate from outside links)

- Re-implemented the NSFW blur in the feed
    - Can now reveal the blurred content with a click (formerly it would just load the post)
    - Text blurs now instead of hiding
    - NSFW-flagged embedded media will turn from a blurred thumbnail into the interactive player upon reveal
    - Inline videos (mp4, webm, etc) can now blur (they didn't blur at all before)

- Community and user links are now properly detected in markdown and will re-write to fetch locally and automatically within Tesseract.
    - e.g. Someone comments `!communty@example.com` or `https://example.com/c/community` and Tesseract will detect and re-write those so that they will fetch locally at `https://tesseract.my-instance.com/c/community@example.com`.  
    - **Combined with the automatic/transparent community resolution introduced in 1.2.69, this makes community links about as universal as they can be in the Fediverse.**
- Export / Import Tesserct settings, groups, and favorites to a JSON file.
- Upload/Download Tesseract settings, groups, and favorites to Lemmy
- Re-implemented the breadcrumb navbar as a standard/modular component. Added more convenience buttons
- Your saved posts/comments are now sortable, paginated, and can be returned individually. Was formerly all or nothing and sorted by new.
- Can now toggle the margins in the feed on and off. (Arrows out/in button in the lower navbar)
- Trimmed down the options in the post action menus and made two new menus on posts:
    - **Post Menu**: Mark as (un)read, share, save, cross-post, report, and block the author. 
    - **Community Menu**: Has options relevant to the community such as create post, browse posts, view its modlog, add to favorite or group, subscribe/unsubscribe, and block.
    - **Explore Menu**: Helps you discover other communities and instances as well as request a Fediseer report for the instances involved with the post.

- Added post actions and quick options to the navigation bar throughout the app

### Bugfixes and Misc Changes
- [Bugfix] Fixed incorrect type on `restoreReplyToAuthor` in mod action object
- [Bugfix] Fixed rare unhandled exception in UserLink if display name wasn't found on a user object
- [Bugfix] Fixed race condition with displaying resolver on reports on initial resolve.
- [Bugfix] Certain post configurations were not respecting the "show full URL" setting
- [Bugfix] Completely missed implementing NSFW blurring/hiding on inline videos. Added that.
- [Bugfix] Fixed improper invalidations in multiple areas. Clicking from the feed into a post should now no longer invalidate if you click the comment button instead of the title or image.

- [UI] Added down chevron to SelectMenu component (forgot that on the last 2 releases)
- [Infrastructure] Implemented versioning of the settings. Now that there are more user-defined things getting saved to local storage, I want to make sure settings can be migrated from version to version without losing anything as well as the ability to transfer those across devices.
- [Community Panels]Restored subscribe/unsubscribe button in community panel (was formerly only in the action menu)

- [Modlog] Removed card view as an option.
- [Modlog] Re-implemented table view to use flex and reflow into something resembling the old cards but more compact.  Works for desktop and mobile.
- [Modlog] Due to the above, modlog search/filtering now work in mobile
- [Modlog] Filters remain present when there's a selection; avoid having to reload modlog just to switch filter params.
- [Image Proxy] Added rule to bypass proxying for inline `data:` images.

- [UI Tweak] Standardized the sub-navigation bar at the top of the feeds, posts, other areas. Standard functions are merely toggles and custom elements can be slotted in.
- [UI Tweak] Added an expand/collapse button to the toolbar in the various feed pages (main, community, user) that will allow you to enable/disable the margins
- [UI Tweak] Card/Compact switcher is just a toggle button
- [UI Tweak] Updated NSFW post handing in the feed. Easier to un-blur on a case-by-case basis without having to go into the post
- [UI Tweak] Added NSFW blur to post body text in the feed instead of hiding it completely. Expanding it will un-blur it.
- [UI Tweak] Partially restored "scroll to top" behavior when collapsing post body text in feed. Now only scrolls when you collapse it back down (to save you having to scroll all the way back to your starting position).


#### Import/Export Tesseract Settings
You can now export your Tesseract settings to a JSON file and import it again. New features are coming that will utilize settings storage for templates, favorite communities, community groups, and more. Having the ability to export/backup and restore is going to be a necessary feature, so getting this part out of the way first.

- Transfer your settings between devices
- Backup your preferences, configuration, favorites, and groups.
- Does _not_ backup accounts as the auth token is a required part of the account profile.
- The exports are meant to transfer settings for the same account to different devices and not to share groups/favorites.  However, that can be achieved as long as it is done between acounts on the same instance.  The groups and favorites rely on the community ID which will vary from instance to instance.

#### Sync Settings To/From Server
Sync your Tesseract settings (config, preferences, and groups/favorites) to your home Lemmy instance.  This will allow you to load your preferences, groups, and favorites on another device without having to physically transfer and import an export JSON file.


**Notes, Warnings, and Cautions**:  

Sync to/from server is a one-off operation.  Your current settings are stored/retrieved from the API but any changes after that are still local-only. You'll need to sync them to Lemmy after any significant changes. 

The way this is done is a _horrible_ abuse of the Lemmy API.  There's currently no custom fields available to store 3rd party data, so I had to get creative.

The `theme` field in your user profile maps to a `text` field in the database.  It's also not a value used for anything load-bearing outside of Lemmy-UI.  That said, it is capable of holding arbitrary date such as a serialized JSON object representing whatever we want.  In this case, your Tesseract config.

Please be aware that this **will** break Lemmy UI's CSS while your profile data is stored inside the `theme` field. To restore the `theme` field in your profile to a valid value, use the "Clear from Lemmy" button at the bottom of the Import and Export Settings panel. 

Also of note is that this does not merge the settings; what you load from the server will replace your current Tesseract settings, groups, and favorites. 

**Tips/Tricks**

If you just want to quickly transfer your settings to another device (e.g. PC -> phone or vice-versa), you can save your Tesseract settings to Lemmy, load them on the new device, and then return the `theme` field to a valid value.  You can use the file export for long-term storage.

I've submitted an RFC to see about getting a custom field for this purpose added to the API, but I do not know if it will gain traction or not.  For now, I'm content with this method unless it proves to cause problems (none so far in testing).

If you rarely, if ever, use Lemmy-UI, then you can leave your profile data saved there and only clear it if you do need to use it (that's what I do :shrug:).







## 1.2.8.99
### Bugfixes
- Fixed same/newtab behaviour in button elements. Sometimes they'd transparently `invalidateAll` when they shouldn't.
- Fixed bounding issue when expanding long-format post body in compact post mode.
- Added additional domain normalizations to MBFC lookup (detects mobile, `m.` subdomains)

### Moderation
- Disabled post links and body content when viewing reports. Title and action buttons are still functional, but not the post link or any content in the post body. Similar to how posts are rendered "unclickable" in report and remove modals.

- Removed "Cards/Compact" switcher in Report management panel. Posts are intentionally forced into compact view and this button was now useless.

### Complete Mod Report Overhaul
With the new mod tooling, you can take multiple actions in one batch.  
- Lock posts, remove posts/comments, and optionally temp/perma ban from community/instance all in one fell swoop.
- Unlock, restore, and unban from community/instance if an action was performed in error or after additional review.
- Can even combine bans such as a temporary instance ban and a permanent community ban. Note that only admins will see the section that contains the instance ban options.
- All "reason" and duration fields are present, so all mod operations are possible and auditable.
- Post/comment preview is collapsible (in case of disturbing content, you won't have to look at it while you fill out the form)

- Optionally follow up with the reporter to let them know their report has been received and processed.
  - Can include an action report in the reply to let them know what actions were taken
  - Uses a hard-coded template that can be modified prior to resolving the report.
  - If no actions are taken, will use a standard blurb about the submission not violating any server/community rules (see screenshot below).

- Optionally follow up with the author being reported on.  Let them know, via DM, that their submission was removed and why.
  - This currently uses a basic hardcoded response:
  - Your [post|comment] in [community] has been removed:
    - **Post**: [Linked post title]
    - **Reasons**: [Reason provided in mod form]

- Optionally follow up with the post/comment author to inform them of a community ban.
  - Will let them know they've been banned, if it's temporary or permanent, and if temporary, when it expires.
  - Not available for instance ban since they wouldn't receive it if local 



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


