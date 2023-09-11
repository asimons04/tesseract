# Changelog
All major/minor changes between releases will be documented here.  

## 1.2.46
This release has a lot of under-the-hood updates.  You probably won't _have to_ but it is advised to either clear your LocalStorage or at least go into your settings and reset them to default (and reconfigure to your liking).

The configuration object that's saved to LocalStorage has had a big cleanup.  You'll see some options not set correctly after updating to this release.

The following `env` vars have been removed:
- `PUBLIC_EXPANDABLE_IMAGES`
- `PUBLIC_REVERT_VOTE_COLORS`
- `PUBLIC_FULL_WIDTH_LAYOUT`
- `PUBLIC_EXPAND_SIDEBAR`
- `PUBLIC_NEW_VOTE_BUTTONS`
You may safely remove those from your `docker-compose.yml` or however you were passing them to Tesseract.




### Emoji Support
- Added emoji support.  Can add emoji codes `:tada:`,  `:+1`, etc.
- To do:  Add emoji picker
- To do:  Read in instance-specific custom emojis

### Setting Cleanup
Cleaning up unused settings values and combining related ones into objects.  I did this not because it was easy, but because I _thought_ it would be easy.



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


