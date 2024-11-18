import { 
    ENABLE_MEDIA_PROXY,
    ENABLE_MEDIA_CACHE,
    MEDIA_PROXY_BLACKLIST,
} from '$lib/settings'

import { imageCache as cache } from '../hooks.server'

// Web Request Handler
export async function image_proxy(event:any) {
    const req = event.req;
    const res = event.res;

    // Refuse further processing if media proxying is disabled or if no token is provided
    if (!ENABLE_MEDIA_PROXY) return res.error("Media proxying is administratively disabled.").send();

    // Look for 'fallback' URL param to set fallback action for proxy failure
    // This needs to delete the 'fallback' param _before_ generating the URL that is later used to create the cache key!
    let fallback:boolean = true;
    if (!req.params.get('fallback') || req.params.get('fallback') == 'false') {
        fallback=false;
    }
    req.params.delete('fallback');

    // Build a URL to the requested image/video
    let imagePath = `${req.route}`
    let imageUrl = new URL(`https://${imagePath}?${req.params.toString()}`);
    
    // Refuse proxy request if image url matches an entry in the blacklist
    if (MEDIA_PROXY_BLACKLIST.length > 0) {
        for (let i:number=0; i< MEDIA_PROXY_BLACKLIST.length; i++) {
            if (imageUrl.hostname.includes(MEDIA_PROXY_BLACKLIST[i]) ) {
                return res
                    .error(`Administrator has disabled proxying to this resource: ${imageUrl.href}`)
                    .send();
            }
        }
    }

    try {
        if ( req.method == 'GET' && ( isImage(req.url) || isVideo(req.url) || isAudio(req.url) ) ) {
            
            // Lookup the image URL in the cache and return that if found
            let cacheKey = cache.createKey(imageUrl.href);
            
            if (ENABLE_MEDIA_CACHE) {
                if (cacheKey && await cache.query(cacheKey)) {
                    //console.log(`Key (${cacheKey}) found in cache. Loading and returning cached version of the file.`);
                    let image = await cache.get(cacheKey);
                    
                    if (image && typeof(image) != 'boolean' && image.type) {
                        return res
                            .setHeader('X-Tesseract-Image-Cache', 'hit')
                            .setHeader('X-Tesseract-Image-Cache-Key', cacheKey)
                            .setHeader('Cache-Control', 'max-age=604800')
                            .length(image.size)
                            .type(image.type)
                            .send(await image.arrayBuffer());
                    }
                }
                
                // Massage the request headers to create a new connection to the target
                req.headers.delete('origin');
                req.headers.delete('host');
                req.headers.delete('if-modified-since');
                req.headers.set('Host', imageUrl.host);
            }
            
            // Fetch the media
            let data = await fetchMedia(imageUrl, req)

            // Check if data was returned and either perform fallback redirect or return an error
            if (!data) {
                // Fallback and redirect the request to the original image URL
                if (fallback) return res.redirect(imageUrl).send();
                
                // If fallback redirect is disabled by user, return an error.
                return res.error('The proxy failed to fetch the media from the server').send();
                
            }
            

            // HTTP 304 trips up the checks so except it from the failure responses
            if (!data.ok && data.status != 304) {
                if (fallback) return res.redirect(imageUrl).send();
                return res.error(await data.text(), data.status).send();
            }
            

            // Add the response headers from the fetch to the response to the client
            for (const header of data.headers.keys()) {
                res.setHeader(header, data.headers.get(header))
            }

            // Let the upstream/proxy server set the content encoding header
            res.headers.delete('content-encoding');
            
            // Convert the data response into a blob
            const image = await data.blob();
            
            // Store image data to cache
            if (ENABLE_MEDIA_CACHE) {
                await cache.put(cacheKey, image);
            }
            
            return  res
                .setHeader('X-Tesseract-Image-Cache', 'miss')  
                .setHeader('Cache-Control', 'max-age=3600') 
                .type(image.type)
                .send(await image.arrayBuffer());
        }
        
        // Not method GET and/or not an image/video requested 
        else {
            if (fallback) return res.redirect(imageUrl).send();
            return res.error('Attempted to proxy invalid URL').send();
        }
    }
    catch (error) {
        // Log the error and fallback to redirecting the request to the original image URL
        console.log( error)
        if (fallback)return res.redirect(imageUrl).send();
        return res.error('An non-fetch error occurred during the proxy process').send();
    }
}


// Fetch an image
const fetchMedia = async function(imageUrl:URL|string, req:any): Promise<undefined|Response> {
    try {
        const data = await fetch(imageUrl, 
            {
                method: 'GET',
                headers: {
                    'accept':       req.headers.get('accept'),
                    'user-agent':   req.headers.get('user-agent')
                },
                redirect: "follow",
                //@ts-ignore
                signal: AbortSignal.timeout(60 * 1000),
            }
        )
        return data
    }
    catch (error) {
        console.log(imageUrl)
        console.log(error)
        return undefined
    }
    
    
}

// Check if the provided URL is an image

function isImage  (url: string | undefined) {
    if (!url) return false
    return /\.(avif|jpeg|jpg|gif|apng|png|img|svg|bmp|webp)$/i.test(new URL(url).pathname.toLowerCase())
}

// Check if provided URL is a video
function isVideo (inputUrl: string | undefined) {
  if (!inputUrl) return false

  const url = new URL(inputUrl).pathname.toLowerCase()

  return url.endsWith('mp4') || url.endsWith('webm') || url.endsWith('mov') || url.endsWith('m4v') || url.endsWith('ogv')
}

export const isAudio = (inputUrl: string | undefined) => {
    try {
        if (!inputUrl) return false
        const testURL = new URL(inputUrl)
        return /\.(mp3|oga|opus|aac)$/i.test(testURL.pathname)
    }
    catch {
        return false
    }
}


