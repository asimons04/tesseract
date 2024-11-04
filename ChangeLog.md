# Changelog for 1.4.x Series (Intrepid)
All major/minor changes between releases will be documented here.  


## Plans/Ideas to Implement Eventually:
1) Re-write search and community browser to keep state in URL params instead of locally
    - They currently both reset when you navigate away and back
    - URL state would be less awkward than the snapshot/restore I do for the infinite scroll.

1) On post form, add button/step to search for the URL you're posting on the community's home instance to check for duplicates
    - Will help you to know if you're posting a duplicate you may not be able to see (posted by someone you've blocked, posted by someone from an instance yours doesn't federate with, etc)

1) Add language selector in profile settings
    - Add language 


1) Power Mod Tools #1: Ban/Unban from all communities I moderate
- Input user to be banned as well as a reason and optional expiry
- Get list of communities current user moderates
- Loop over community list, call banCommunity, and provide the given user, reason, and optional expiry
- UI:  Show communtiy list and add a "check" icon to each as the API calls are processed



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

## 1.4.20

### Remaining To Do:
#### Post Component
1) Flesh out this "hybrid" card view behavior.
- Add setting toggle for 'Automatic Card View'
- List post types that should be viewed always as cards when this is enabled?
- Can toggle each type to add it to an array that's checked here (instead of the static array used for test/dev)
- Don't expand read posts (optional)


#### Community Profile Modal Component
1) Add sub-panels for Remove/Restore Community and Hide Community to provide a reason (remove/restore) and confirmation (both)

1) Move "Community Details" into a sub-panel like it is in the moderation 

1) Integrate community modlog as in the moderation component
    - Keep separate button to view it in the full-featured modlog

1) 

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

1) If the community **is** set, then it will do a remote API call to search the *home instance of that community* for any posts to that community with that URL.  The label will be "Existing posts in {community}@{instance}.

The latter behavior is particularly useful if you want to avoid accidentally posting a duplicate that may have been posted by someone you've blocked or by someone your instance doesn't federate with.  Those posts may not be visible to you locally, so the remote search should help identify them so you don't clutter up the feed and/or add extra work for the moderator who usually removes duplicate posts.

If for whatever reason it doesn't trigger automatically, the "Magnifying Glass" icon to the right of the URL field can trigger the search manually.

Also note that behavior #2 only works if you're posting to a Lemmy community since it makes a remote API call to the community's home instance using the Lemmy API.  Thus, it cannot search a remote Kbin/Piefed, etc instance.  

### Can Now Vote on Crossposts Without Clicking Into It
Vote buttons have been added to the crosspost items, so you can now vote on them from the feed and post.

In the feed, since the cross_posts are rolled up manually from regular post objects, the voting works as expected.

Unfortunately, when clicked into a post, the API call does not add the `my_vote` variable to the `cross_posts` array.  So while you can vote on the crosspost, and the vote will be correctly recorded, your vote will only display correctly while you're on that page.  Since the API doesn't return the vote you cast, on refresh or subsequent loads, the vote button will not indicate which way you voted.  If you try to vote again, the score will not necessarily change.  Yet another feature I want to implement hampered by dumb API decisions.



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
- View the community details/sidebar info relevant to the current item (post or comment)
- View the votes for the item (admins only until whatever version of Lemmy lets mods do this for their communities)
- Remove/Restore the post or comment (shows the post meta header or the comment meta header and comment previews)
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
To reduce clutter, the "Favorite/Unfavorite", "Add/Remove to Group", and "Modlog" buttons have been moved to the modal title bar as icon-only buttons.  

"Create Post" is no longer a link to the community's create post page. It now shows the create post form right in the modal.  There is a button in the upper-right which will take you to the `/c/{community}/create_post` page if you want to use the old form (it's the same form).

"Remove/Restore" and "Hide/Unhide" have been integrated.  They will also now prompt for an optional reason to show in the modlog.

The "Community Details" is now a panel (like in the moderation modal) rather than being an accordion.  Same functionality, different packaging.



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