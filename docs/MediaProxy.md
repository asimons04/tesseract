# Media Proxying and Caching

## Overview
### Use Cases / Advantages

#### Enhanced User Privacy and Streamlined Loading
Users won't be revealing their IP addresses to every instance they're interacting with, nor will images in comments (tracking pixels, etc) be able to grab their IPs. 

Additionally, with all media* coming from the same origin, loading is streamlined and more efficient since connection/request multiplexing can be utilized without the overhead of additional TLS handshakes to multiple servers.

*Except where the proxy fails and falls back to direct link, the image source is blacklisted, or there is some issue with the proxy fetch. In those cases, media links will fallback to a direct link if the option is enabled (enabled by default but is user-toggleable)

Please note that this is only "best effort" and in no way is it guaranteed your IP will never leak.  Even with the fallback option disabled, it is still possible for your IP to be revealed to other sources than your home instance. This feature is mainly for privacy _conscious_ users rather than privacy obcessed. 

#### CDN in a Box
If you run Tesseract on a different server than your Lemmy backend, it can act as a CDN for your media.  This reduces the traffic your backend has to serve through Lemmy + pict-rs freeing up resources for other tasks.

You can even run multiple Tesseract instances and load balance them (reverse proxy, DNSRR, etc) to distribute the load even further.  Each cache will be independent*, but it still keeps a lot of traffic off of your API server.

*The only storage for cache items, currently, is the local filesystem.  I'm considering adding the ability to point it to object storage as that would provide multiple benefits. It would allow the object storage host to worry about lifecycle management and not require a housekeeping task to evict items.  It would also allow the cache to be shared among multiple Tesseract servers and have a unified cache.  This would be especially beneficial for larger instances.

#### Being a Courteous Fediverse Admin
By caching remote images, you're reducing the load on other admins as well.  If you have 500 users, and all of them are subscribed to `risa@startrek.website` (because we all love our Trek memes), then that would cause up to 500 requests per image hosted on `startrek.website`'s servers.  With caching, and assuming everyone's using Tesseract, that is reduced to 1 request per image for the length of the cache duration (12 hours default).  With other UIs and apps in the mix, you won't see such extreme savings, but it's still a significant reduction.




## Proxying Overview
Privacy conscious users have long requested media be proxied through Lemmy.  While I can't add that functionality to the API, I _can_ add it to the UI.  In addition to increased privacy, image proxying can also provide a faster experience in some cases due to all of the media coming from a single origin.  Combined with caching (see below), even more performance gains can be achieved.

Typically, when you're interacting with Lemmy, most images are fetched directly from remote instances: the API just returns a URL to an image which each user fetches in their clients.  It's up to those clients to do any caching.  Icons, Avatars, post, and inline comment images are always retrieved directly from their source instnaces or remote servers.  Thumbnails are hit or miss depending on a number of factors that I don't want to get into right now.


Tesseract can now, _optionally_, proxy post thumbnails, images, avatars, and inline post/comment images through the server hosting the UI.  Any image or direct-link video (webm, mp4, etc) can also be proxied, including those hosted through Imgur, Tenor, Giphy, Catbox, etc.

To utilize this feature, there are two steps which need to be taken:
1. Tesseract must be started with the `PUBLIC_ENABLE_MEDIA_PROXY` environment variable set to `true`.  It is disabled by default and must be explicitly enabled by the admin running Tesseract.

2. Users will need to go into the app settings and enable the option called "Proxy images through Tesseract" which is currently under "Media and Embedded Content".  By default, it is disabled there as well.

If the media proxy is not explicitly enabled by the administrator, the user option will be hidden and ignored.

## Caching Overview
In order to speed things up for your users as well as reduce the network load on other instances, Tesseract can also, optionally, cache any media it proxies for an admin-defined amount of time.

Any cached media will be available to all users of your Tesseract installation (in cases where you are not locking it to a single instance).  This has the potential for a large amount of bandwidth savings for other instance administrators as well as increased efficiency and performance for your users.  Since all of the images will be fetched from the same origin, HTTP/2 multiplexing can significantly improve the loading times, especially when the media is already in your cache.



# Configuration Options
## Cache Persistence
The cache is stored at `/app/cache` inside the Docker container.  If you do not mount this to a volume, caching will still work.  However, anything in the cache will be lost when Tesseract is restarted or updated.  

To enable persistence of the cache, add a Docker volume to the compose file to mount the `/app/cache` directory to the local filesystem.

You will need to make sure the local filesystem directory used for the mount is owned by UID/GID 1000.

```
mkdir data/tesseract-cache
chown 1000:1000 data/tesseract-cache
```

Then your compose file would look something like this:
```
tesseract:
  image: tesseract:latest
  ...
  volumes:
    - ./data/tesseract-cache:/app/cache
```

## Environment Variables
Other than the user options to enable/disable proxying images through Tesseract, all configuration is done server side via environment variables.


### Proxying
**PUBLIC_ENABLE_MEDIA_PROXY** 
```
Values:  true | false
Default: false
```
Setting this to `true` will enable the media proxy module and is necessary for all other proxy/cache functionlity.

**PUBLIC_ENABLE_USER_MEDIA_PROXY**
```
Values: true | false
Default:  false
```
Setting this to `true` will enable media proxying in the default users settings.  Will not have any effect for existing users unless they access Tesseract from a new device, clear their local storage settings, or reset their app settings to default.


**PUBLIC_MEDIA_PROXY_LEMMY_ONLY**
```
Values:  true | false
Default: false
Recommended: false
```
Determines whether to allow proxying to outside media, such as Imgur, Catbox, Yarn, etc.  If set to `true`, then only images hosted on other Lemmy instances (image URLs with `/pictrs/image` in them for lack of a better way to identify instances) will be allowed to proxy.  When set to `false`, outside media will be proxied and optionally cached.  The benefit to this is not overloading services like Catbox which can be hugged to death.


**PUBLIC_MEDIA_PROXY_BLACKLIST**
```
Values: Unquoted string
Default: Empty
Example: PUBLIC_MEDIA_PROXY_BLACKLIST=media.giphy.com,badsite.com,site-that-doesnt-work-with-the-proxy.com
```
Comma-delimited list of domains and/or keywords to check for in image URLs.  Any image domains that contain anything in the blacklist will not go through the proxy endpoint and will be linked directly.  You may wish to add others for content policy reasons or because you've identified some that do not like being proxied. 

**PUBLIC_ENABLE_MEDIA_PROXY_LOCAL**
```
Value: true | false
Default: true
```
Configures whether to proxy images local to the user's instance.  

It is recommended to enable this if you host Tesseract on a different server than your Lemmy API.  This allows the server running Tesseract to act as a CDN for images/media hosted on your Lemmy instance. 

Pretty much useless without also enabling media caching.

---

### Caching
**PUBLIC_ENABLE_MEDIA_CACHE**
```
Values: true | false
Default: true
Recommended:  true
```
Whether to enable caching for media that is fetched by the proxy.  While it is "enabled" by default, it will not do anything unless media proxying is also enabled (since nothing will be flowing through the proxy for it to cache).  If you do not wish to cache any proxied media, set this to `false`.



**PUBLIC_MEDIA_CACHE_DURATION**
```
Value:  Number (minutes)
Default: 720 (12 hours)
Recommended: Between 60 (1 hour) and 1440 (24 hours).  Longer if you think it would help and have the disk space.
```
The amount of time, in minutes, before the system will evict the media from the store. Longer durations will incur more disk space, but will provide more benefit to uses and other instance admins.  Shorter durations can still help, but longer is better if you can afford it.

**PUBLIC_MEDIA_CACHE_KEEP_HOT_ITEMS**
```
Value:  true | false
Default: true
Recommended: true
```
Whether to "reset the clock" each time a cached item is accessed.  If disabled, anything in the cache is automatically evicted when its creation time is greater than the defined cache duration.

If enabled (default), the access time of the cached item will be updated each time it is accessed.  This allows "hot" or popular items to be kept longer in the cache to reduce re-fetches.  

If enabled, you may consider reducing the cache duration to a smaller value.

**PUBLIC_MEDIA_CACHE_MAX_SIZE**
```
Value: Number (MB)
Default: 1 GB
Recommended:  As much as you can afford to give it.  A minimum of 100 MB is required. Config values lower than this will be ignored.
```
The amount of disk space, in MB,  allocated to the media proxy cache.  Once the cache directory hits 95% of this value, the oldest items will be evicted automatically.

**PUBLIC_MEDIA_CACHE_HOUSEKEEP_INTERVAL**
```
Value: Number (minutes)
Default: 5
Recommended: Between 2 and 10
```
How often the housekeeping function is called for the image cache, in minutes.

**PUBLIC_MEDIA_CACHE_HOUSEKEEP_STARTUP**
```
Value: true | false
Default: true
Recommended:  true
```
Whether to run the housekeeping function immediately at startup or wait until the first interval.  


# FAQ
## Q: How does image proxying work?
The image proxying is a shim between what the API returns and what the browser renders.

With proxying enabled by the admin and the user, prior to rendering the posts returned by the API, the image URLs are re-written to go through Tesseract. This is all done client-side.

e.g.  `https://lemmy.world/pictrs/image/3263e249-cfef-40fd-877a-16bee9d62558.png` becomes `/image_proxy/lemmy.world/pictrs/image/3263e249-cfef-40fd-877a-16bee9d62558.png`.  

The `/image_proxy/` route is handled by Tesseract which fetches the image, optionally caches it, and serves it to the user.  

When proxying is disabled, the image URLs are returned as-is and the user fetches them from the original source.

---

## Q:  What goes through the proxy?
Only requests to images and inline videos.  API calls still go directly from the client (your browser) to your home instance.  Embedded content (Youtube*, Bandcamp, Spotify, Vimeo, etc) is always fetched directly from those sources as proxying it is not feasible.


*Including Invidious/Piped

---

## Q: Does Tesseract's caching replace any Nginx or Cloudflare caching I'm already doing?
It can, but it doesn't have to. In fact, you can benefit from using both.

The Nginx/Cloudflare/etc cache layer would only cache media already served from your instance.  Tesseract can cache images from remote instances.  Both have their benefits.

Once one user on your instance fetches an image from another instance, anyone else using your install of Tesseract would then pull that same image from its cache without having to re-fetch it from the source.  The result is better performance from your users' perspectives as well as reduced load on remote instances.

If you run Tesseract on a different server than your Lemmy+Pictrs backend, then you can have two layers of caching for your instance's media.  Tesseract will fetch media hosted on your instance, which can be served from the Nginx/Cloudflare/et al cache and then cache it within itself for future requests.  

If you run multiple Tesseract frontends, each would have its own cache.  

A use case for this would be having geographically separate frontends.  This would serve the media closer to the user while the API calls would still go directly to the backend.


---

## Q: How can I view the cache statistics?
Right now, that info is only reported through stdout from the Docker container.  Output looks like this:

```
tesseract-web-1  | Housekeeping image proxy cache...
tesseract-web-1  | 	 Evicting /app/cache/cf689b05a355dd7aeca6205fe0d3f4743d6913cb4e19850e62c893ffaf888780.cache from cache due to expiration
tesseract-web-1  | 	 Evicting /app/cache/e4e5cfb83d14563be24fa7a783ecbe990ed5a56bd107581a32560e2470d6bf95.cache from cache due to expiration
tesseract-web-1  | 	 Evicting /app/cache/88917844117b904e6443e888bb7631657dc97ed5f2c13741f980852229e6d490.cache from cache due to expiration
tesseract-web-1  | 	 Evicting /app/cache/9e0c9507e3ad5dad40905b9a2b64faa481dfd27a67fc6c610a85a7874d5b613c.cache from cache due to expiration
tesseract-web-1  | 	 Evicting /app/cache/d99da970ba731e4b4d7c3d4d4d947a55474a6234d97df4d5e404f2b24fbef1b8.cache from cache due to expiration
tesseract-web-1  | 	 Evicting /app/cache/97b4e9611d52e46fb36d9c5a498b2c16c4b781a81ae540578da618b580165395.cache from cache due to expiration
tesseract-web-1  | 	 Evicting /app/cache/3bea8097667b5f4166f37ad684bbbf51d04a8a450ecf3a0aec1d271056e142aa.cache from cache due to expiration
tesseract-web-1  | 	 Evicting /app/cache/c367e71cb5edabdccd4c770863cce532d1e4b637eb06d04e76f5a2a5a271e5a3.cache from cache due to expiration
tesseract-web-1  | 	 Evicting /app/cache/af2f747e0eca7a6414fca9b52d6cab28679ad3b9304406696d67c633b440f9dd.cache from cache due to expiration
tesseract-web-1  | 	 Evicting /app/cache/850246d64c46fe8d10abee37f34f08207f4590b3115fca17d5053cb4825b9d32.cache from cache due to expiration
tesseract-web-1  | 	 Evicting /app/cache/a38b98e4ce42f9669b7dea999d2758070d41207714b0ff35c7df34e6840776fd.cache from cache due to expiration
tesseract-web-1  | 	 Evicting /app/cache/4da83fe587d10ab265a11993d9e7775e633e376396d365a2b6a6d664b08eaa20.cache from cache due to expiration
tesseract-web-1  | 	 Evicting /app/cache/b5dcf62607e1c6ccbe7bf1794fa08ac029c7123e551fb96d13c1f9eef96a834e.cache from cache due to expiration
tesseract-web-1  | 	 Evicting /app/cache/a379725f3ed6297006d69cbf58189c09c18fe645f1f215388384c9077c44220d.cache from cache due to expiration
tesseract-web-1  | Evicted 14 expired items from the proxy cache.
tesseract-web-1  | Media proxy cache stats:
tesseract-web-1  | 	 Cached Items: 1119
tesseract-web-1  | 	 Utilization: 50% (372 MB / 750 MB)
tesseract-web-1  | 	 Hit Rate: 499% (Hits: 1308 Misses: 262)
```
In the current implementation, those stats reset every time Tesseract is restarted.  I'm hoping to have those persist in a future release.

Also in a future release, I'm looking to add API endpoints which can return that information in JSON format.  However, I need to implement a few prerequisites before I can do that (an authentication layer, mostly).

---

## Q:  What happens if the proxy fails to fetch the image?
Sometimes, image hosting services may block IP ranges for cloud servers.  In these cases, the fetch from Tesseract will fail if it runs from a VPS that the hosting service blocks.

In these cases, there is a fallback behaviour to return a 302 redirect to the original image URL.  From the user's perspective, the process is seamless.

Users can disable this feature if they want;  in those cases, if the server-side fetch from Tesseract fails, the image will just not load.

Falling back to a redirect to the original media URL is the default behaviour.

---

## Q:  How can I clear the cache?
Currently, the only way to clear/flush the cache is to delete all `.cache` objects in the Tesseract data directory.

Once I have an authentication layer in place, I'm planning to add a UI button to flush the cache.

---

## Q:  Can I clear individual items from the cache?
Yes.  The cache folder structure is flat, so every cache item is located directly off the `/app/cache` directory in the container.  

The filenames are a SHA256 checksum of the image path and parameters with the extension `.cache`.  You can generate the filename as such:

`createHash('sha256').update(IMAGE_URL).digest('hex') + '.cache'`

Where `IMAGE_URL` is: `https://${imagePath}?${req.params}`

Example:  https://lemmy.world/pictrs/image/8dca72f6-81fb-4d7d-9cce-c9fd6336205d.png?format=webp&thumbnail=768 -> 9561059954ca77b23b76bf6a10e86e85b639e82981668daf68651e748015b630.cache

If you have the image loaded, you can open dev tools and find the network request for that image.  The cache key/filename is returned in the header `x-tesseract-image-cache-key`

When generating the cache keys manually, omit the `&fallback=true|false` paramater.  It is only used by the proxy handler and is stripped off before hashing the key from the URL.

Once you have the filename, delete that from the `/app/cache` directory: either from the host data directory or by shelling into the container.

Once I have an authentication layer in place, the plan is to add an extra option on post removals to delete the media from the cache.

---

## Q: Why does the cache clear when Tesseract updates or is restarted?
In order for the cache to persist, the cache directory must be mounted outside the container.  Make sure you mounted the container's `/app/cache` folder to somewhere persistent.  Without a mount, it will store the cache data to its ephemeral writable layer. 

---

## Q:  What if I don't want to proxy media?
The option to proxy as well as the handler for the `/image_proxy` route are disabled by defauilt. Tesseract will not proxy any media unless the environment variable `PUBLIC_ENABLE_MEDIA_PROXY` is set to `true` by the administrator.




