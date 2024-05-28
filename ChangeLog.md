# Changelog for 1.3.x Series
All major/minor changes between releases will be documented here.  


## 1.3.1

### New Features

#### Zoomable Images
Most images are now zoomable:  post images, user/site/community avatars, images posted in comments, etc.  The pinch zoom isn't quite where I want it, but I may be hitting a library limitation.
- Support zoom, pan, and rotate
    - Mouse scroll to zoom
    - Click/grab to pan
    - Pinch to zoom/unzoom
    - Rotate via on-screen buttons
- Gesture support
    - Swipe up to dismiss zoom modal
    - Swipe down to toggle quick zoom/unzoom
    - Swipe left to zoom out, right to zoom in (one zoom step per swipe)

#### User Profile Modals
Clicking on usernames throughout the application will now load a modal with their user card and relevant options. Old behavior was taking you to their profile directly.  Actions include:
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
- Can delete post images (only before you save the post; unfortunately there's no way to retrieve the delete token after that even though it is stored in the DB)
- Images pasted/uploaded into the markdown editor are tracked in a bar along the bottom of the editor. Individual images can be deleted as needed along with the corresponding markdown code for them.




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

#### TOTP 2FA Setup
Can now enable and enroll in 2FA as well as disable it.

#### Account Icons Now Use Your Profile Avatar
Icons in the account switcher and account screens now sync to your profile avatar, if defined.

#### New Placeholder User Avatars
Instead of the initials as used previously on accounts without avatars, now uses Dicebear Adventurer pseudorandom avatars.

#### Vote Viewer (Admins Only)
Admins can now see votes like in Lemmy-UI.  Uses infinite scroll and deduplication to compensate for the stupid API that returns multiple/duplicate votes on each page.




### Bugfixes and Enhancements

#### Removed 0.18.x Backwards Compatibility
- Or, more specifically, removed 0.18.x JS client and the extensions to make that compatible with 0.19.x.  Now uses the 0.19.3 JS client.
- Removed the image upload proxy which was needed in 0.18x due to CORS limitations.


#### Various Enhancements to Auth Module.
    - Added safety check so that the auth token is only ever sent to the profile's associated instance and cannot accidentally send to non-home instance
    - Fixed a few chicken/egg situations where the profile store needed to be accessed before it was initialized
    - If your auth token is invalid, such as after changing your password on another device, you will get a toast message you can click to take you to the login screen.
    - If a profile exists for a username/instance combo, logging in will update the auth token for that existing profile rather than creating a new one.
    - User avatars are now fetched when logging in.

#### Grace Period Before Media Embeds are Destroyed When Scrolling out of Viewport
- Embeds now have a short timeout when leaving the viewport before they're removed from the DOM and turn back into thumbnails.  Fixes annoyance when resizing the window while a video is playing and the video temporarily leaves the viewport and is destroyed. Timeout is 2 seconds and will reset/disarm if the post returns to the viewport before it expires.

#### Community Creation / Editing
- Uses new upload handler
- Can pre-process the banner/icon to webP before uploading
- Shows a live preview of how the community card will look

### Other Stuff

#### Peertube Follows
On my last release post, someone mentioned that following Peertube channels may be broken.  At the time I was still on 0.18.5 and had followed a PT channel, and _seemed_ to be getting updates from it.  Then I wasn't sure.

I can say that I _have_ been getting at least some updates to the PT channel I follow (mostly as a test).  While there have been videos posted there that did not come through to Lemmy, I don't know enough about PeerTube to know if they were published differently or what.  However, I have gotten at least 2-3 that someone posted to Lemmy that would absolutely had to have come in via Federation.

Also confirmed that commenting on a PT video (from the channel feed, not an embed to a Lemmy community) does federate out and show up on Peertube's side along with any votes you give in Lemmy.

This isn't really a Tesseract issue since the Lemmy backend handles that.  Just figured since I do support Peertube, it would be worth mentioning that it seems to work.


### Goals 

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
    - [ ] Spotify
    - [X] Peertube
    - [ ] Bandcamp
    - [ ] Odysee
    - [ ] Soundcloud
    - [ ] Songlink
    - [ ] Vimeo

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
    - Provide button to take you to the link (honoring "open in new tab" setting)
- [ ] Admin -> [Legal, sidebar, taglines] markdown editor too smushed.


---


