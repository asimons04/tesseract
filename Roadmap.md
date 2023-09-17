## Roadmap 
Completed "to do"s have been moved to the [change log](./ChangeLog.md).
### 1.2.53

#### Compact View Refresh
I've completely ignored compact view thus far.  Time to give it a spruce up

#### 


### Infrastructure
- Add "Guest" and the instance it's hooked to in Account switcher menu in sidebar
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



### Moderation
- Add "Purge person" and/or "purge content" option to admin menu. 
  - "Ban and Purge Content" is the plan.  Purging user does not result in a ban (unless they were banned on their home instance which is not guaranteed).  I don't think the API has a way to do this directly, so may have to do one or more searches for the `person_id` and purge each in a loop over multiple API calls.

- Add option for mods/admins to hide deleted comments and logic to implement that

- Extend `/c/[name]` route to `/c/[name]/u/[name]` to show a particular user's submissions for a given community.
  - Add bulk select/actions for mod actions (remove, purge, lock)


### User Profile Page
-  Add a "active in" section with community cards for ones the user is active in
    - Clicking into that will take you to the community page and filtered for submissions from the user

### Community Pages
- Show list of moderators for the community
- Add link to modlog that pre-filters for that community

### Site Card
- Show list of site administrators


### UI

- Implement a public `/instances` page to render the linked, blocked, and allowed instances

- Add a `jumptoComments` URL param for `/post/[instance]/[id]` route
    - Will pre-empt autoplay setting for videos
    - Scroll to comments div

- Add emoji picker into post/comment markdown editor


#### Vote Buttons
- Add user option to select left/right side for vote buttons



#### Admin Panel
- Fix /admin panel so it doesn't render for non-admins.  Granted, it's all public API data and they can't change anything, but unauth users shouldn't even see it.

- Add check to make sure the slur filter regex is valid before sending to API.

- Add toggle to `/admin/instances` to select an operating mode: blocklist vs allow list and hide the non-selected 



### Modlog
- Enhance filtering beyond just community

### Media Handling
- Add option to "quick play" from thumbnail in feed. If embedded media disabled in feed, thumbnails will have click action replace thumbnail with lazy-loading iframe. This _should_ prevent a bunch of iframes from loading until you click the static thumbnail to reveal it while keeping quick/convenient access to media posts without leaving the feed.

- Direct videos don't have thumbnail attributes, but ones hosted via pict-rs can add ?format=webp to the URL.  Add this and enable direct videos to not be embedded if that option is set.

- Detect Youtube/Piped/Invidious links in post bodies and comments.  Optionally render those inline depending on user setting
