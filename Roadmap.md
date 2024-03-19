## Roadmap 
Completed "to do"s have been moved to the [change log](./ChangeLog.md).

This is less of a roadmap to what feature will be implemented in what upcoming version and more of a scratch pad for ideas I have that I'm considering implementing.  Not everything listed here will be added, either because it's a dumb idea, not possible, or because I don't feel like it.

Right now, as far as what gets developed, it's mostly "fixing whatever is annoying me",  "this is broken and I need it to work", or "whatever I feel like adding today".

I realize that is less than professional, but this project is a hobby :shrug:.

### Accounts Management
- Add capability to change password

 
### Community Pages
- Show list of moderators for the community
- Add link to modlog that pre-filters for that community

### Site Card
- Show list of site administrators

### Sidebar
- Favorites list and button on each community to add/remove from favorites
  - Is this needed now that search filtering is added??

### Feed
- Keyword filter:  Filters out posts that contain any keywords specified by the user
  - Each filter would be device-specific, unfortunately, as they would have to be saved to LocalStorage

### Code Blocks
- Fix broken HTML in code blocks
  - 

### Infrastructure
- ~~Add "Guest" and the instance it's hooked to in Account switcher menu in sidebar~~
    - Makes menu too busy.  Can just unselect the current account for same effect.
- Need to implement normal password change. Now that password recovery is completed, this is likely next.
- Consider an optional, complementary backend server to add additional functionality such as saving settings to DB, keeping a cache of communities/instance details for Explore features, etc.

- Consider integrating [Fediseer](https://fediseer.com/api/) support into admin tools 
  - Indicate whether posts/comments come from a guaranteed instance
  - Allow users to hide content from non-guaranteed instances
  - See cesures and endorcements of each linked instance as well as guarantor (apply SVG bage also)
  - Allow to endorse/guarantee instance from admin panel
  - Censure instance 

### Community Discovery
- Expand functionality of "Explore" to show a list of the linked instances. Selecting an instance will poll its communities and render a list you can subscribe to if logged in.

- Periodically pull the JSON DB for browse.feddit.de and use that to integrate a feidverse-wide community browser.

- Card view for Communities
- BUG:  Removed/Deleted communities should not show up in `/communities`.  
  - Oh, they only show up for admins (doh).  That's on par with lemmy-ui
  - No issue then, i guess
  


### Moderation
- Add "Purge person" and/or "purge content" option to admin menu. 
  - "Ban and Purge Content" is the plan.  Purging user does not result in a ban (unless they were banned on their home instance which is not guaranteed).  I don't think the API has a way to do this directly, so may have to do one or more searches for the `person_id` and purge each in a loop over multiple API calls.

- Add option for mods/admins to hide deleted comments and logic to implement that

- Extend `/c/[name]` route to `/c/[name]/u/[name]` to show a particular user's submissions for a given community.
  - Add bulk select/actions for mod actions (remove, purge, lock)

- Add support to remove/restore communities


### User Profile Page
-  Add a "active in" section with community cards for ones the user is active in
    - Clicking into that will take you to the community page and filtered for submissions from the user




### UI

- Implement a public `/instances` page to render the linked, blocked, and allowed instances


- ~~Add emoji picker into post/comment markdown editor~~


#### Vote Buttons
- Add user option to select left/right side for vote buttons

#### Admin Panel
- Fix /admin panel so it doesn't render for non-admins.  Granted, it's all public API data and they can't change anything, but unauth users shouldn't even see it.

- Add check to make sure the slur filter regex is valid before sending to API.

- ~~Add toggle to `/admin/instances` to select an operating mode: blocklist vs allow list and hide the non-selected ~~



### Modlog
- Enhance filtering beyond just community

### Media Handling
- Add option to "quick play" from thumbnail in feed. If embedded media disabled in feed, thumbnails will have click action replace thumbnail with lazy-loading iframe. This _should_ prevent a bunch of iframes from loading until you click the static thumbnail to reveal it while keeping quick/convenient access to media posts without leaving the feed.

- Direct videos don't have thumbnail attributes, but ones hosted via pict-rs can add ?format=webp to the URL.  Add this and enable direct videos to not be embedded if that option is set.

- Detect Youtube/Piped/Invidious links in post bodies and comments.  Optionally render those inline depending on user setting

## Feature Ideas (not guaranteed to be implemented, just ideas)
Based on user feedback and my own annoyances, here are the current goals to be implemented in the 1.2.9.x release series. 

### Image Overlay / Gallery
- Click images in the feed/post to enlarge them fullscreen and zoom.
- Parse post body for image tags and add those to the gallery component

### Re-write Post Creation Form
- Semi-tabbed interface (similar to Reddit's) with form elements optimized for the post type
- Post Types:
  - Text Post (no URL, just text)
  - Link (news articles, blog posts, etc).
  - Images (Allow multiple images for a gallery. The first will be the post image and the rest will be in the body.  Gallery plugin will parse the ones in the body.
  
### WYSIWYG Markdown Editor
Replace the custom markdown editor with Toast-UI editor.  Not sure yet if I will replace `markdown-it` completely (may leave it for rendering), but the Toast-UI editor is much more user-friendly.

### Update Settings Cloud Sync
The current method to sync your Tesseract settings, groups, and communities to Lemmy API is a one-off manual process.  This is intentional as it's basically an experimental feature that is abusing the `theme` field of your Lemmy profile (it's only used by Lemmy-UI and can hold arbitrary text).  The plan is to automate this and put it behind a user setting with appropriate warnings about how it will break Lemmy-UI's CSS.  When enabled, changes to your app settings will automatically sync to/from Lemmy.  Will update the "restore" button functionality to also disable sync.

### Moderation Templates
- Replace the static user-defined template with the ability to have custom moderation presets
- Add ability to make them community-specific
- Save to profile and make exportable to JSON/API

### Moderation Presets and Report Handling
The groundwork for this exists in the current release, but I didn't have time to fully flesh them out.
- Set pre-defined actions (lock post, remove comment/post, ban community/instance, set reasons, etc.)
- Select from a list of your presets which can be community-specific
- Select multiple open reports to apply the preset to all (e.g. you have 7 spam reports that should all be handled the same way)
    - May or may not implement this or at least do it such that banning is not available to a mass-option.
    - The report revamp was to give additional insight to make more informed mod decisions. Adding the capability to mass ban without looking at the details thoroughly runs antiethical to that goal.

### Under the Hood Stuff
- Move all modals to a common modal container (similar to removal modals) as to allow calling them from anywhere without extra hacks to make sure they're not constrained by a fixed container div
- Make preparations and lay initial foundation for offline support
    - Re-implement local profile to keep stored locally/persistently (rather than a background fetch to fill in the blanks).
    - Decide if posts/comments should be stored in LocalStorage or IndexDB
    - Create an action queue (upvote/downvote, reply, etc) to allow actions to be queued when offline and sent to API when online
