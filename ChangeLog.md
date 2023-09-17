# Changelog
All major/minor changes between releases will be documented here.  

## 1.2.59

## 1.2.58.1
### Out of Band Release / Bugfix
Markdown component was getting an unhandled error _sometimes_ and killing the rest of the thread.  Added try/catch to handle it gracefully.


## 1.2.58
### Sidebar Enhancements
Gott say, I've been putting the community filter off for a while, but I'm glad I finally implemented this.  Such a quality of life improvement.

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


