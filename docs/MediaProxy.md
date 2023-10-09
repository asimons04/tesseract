# Media Proxying and Caching

## To Do
If locked to instance, automatically read blocked instances from API and transparently add those to the proxy blacklist.  




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


**PUBLIC_MEDIA_PROXY_LEMMY_ONLY**
```
Values:  true | false
Default: false
Recommended: false
```
Determines whether to allow proxying to outside media, such as Imgur, Catbox, Yarn, etc.  If set to `true`, then only images hosted on other Lemmy instances (image URLs with `/pictrs/image` in them for lack of a better way to identify instances) will be allowed to proxy.  When set to `false`, outside media will be loaded directly and not proxied.


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
## Q:  How can I clear the cache?
Currently, the only way to clear/flush the cache is to delete all `.cache` objects in the Tesseract data directory.

## Q:  Can I clear individual items from the cache?
Yes.  The cache folder structure is flat, so every cache item is located directly off the `/app/cache` directory in the container.  

The filenames are a SHA256 checksum of the image path and parameters with the extension `.cache`.  You can generate the filename as such:

`createHash('sha256').update(IMAGE_URL).digest('hex') + '.cache'`

Where `IMAGE_URL` is: `https://${imagePath}?${req.params}`

Example:  https://lemmy.world/pictrs/image/8dca72f6-81fb-4d7d-9cce-c9fd6336205d.png?format=webp&thumbnail=768 -> 9561059954ca77b23b76bf6a10e86e85b639e82981668daf68651e748015b630.cache

If you have the image loaded, you can open dev tools and find the network request for that image.  The cache key/filename is returned in the header `x-tesseract-image-cache-key`

When generating the cache keys manually, omit the `&fallback=true|false` paramater.  It is only used by the proxy handler and is stripped off before hashing the key from the URL.

Once you have the filename, delete that from the `/app/cache` directory: either from the host data directory or by shelling into the container.

## Q: Why does the cache clear when Tesseract updates or is restarted?
Make sure you mounted the container's `/app/cache` folder to somewhere persistent.  Without a mount, it will store the cache data to its ephemeral writable layer. 

## Q:  What if I don't want to proxy media?
The option to proxy as well as the handler for the `/image_proxy` route are disabled by defauilt. Tesseract will not proxy any media unless the environment variable `PUBLIC_ENABLE_MEDIA_PROXY` is set to `true.

## 


