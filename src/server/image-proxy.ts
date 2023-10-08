import { ENABLE_MEDIA_PROXY } from '$lib/settings'
import { createHash } from 'node:crypto'
import fs from 'fs'

interface FilesystemCache {
    get: Function,
    query: Function,
    set: Function
}

const cacheDir:string = "/app/cache";

const cache:FilesystemCache = {
    
    get: async function(key:string)  {
        
    },
    
    query: async function(key:string) {
        return false;
    },

    set: async function(key:string, data:File) {
        return false
    }
}


export async function image_proxy(event:any) {
    const req = event.req;
    const res = event.res;

    // Refuse further processing if media proxying is disabled or if no token is provided
    if (!ENABLE_MEDIA_PROXY) return res.error("Media proxying is administratively disabled.").send();
    
    // Fallback to redirecting to original image source if proxy request fails
    let fallback:boolean = true;
    
    // Look for 'fallback' URL param to set fallback action for proxy failure
    if(!req.params.get('fallback') || req.params.get('fallback') == 'false') {
        fallback=false;
        req.params.delete('fallback');
    }

    // Build a URL to the requested image/video
    let imagePath = `${req.route}`
    let imageUrl = new URL(`https://${imagePath}?${req.params.toString()}`);

    try {
        if ( req.method == 'GET' && ( isImage(req.url) || isVideo(req.url) ) ) {
            
            // Lookup the image URL in the cache and return that if found
            let cacheKey = createHash('sha256').update(imageUrl.href).digest('hex');        
            if (cache.query(cacheKey)) {

            }

            
            
            // Massage the request headers to create a new connection to the target Lemmy instance
            req.headers.delete('origin')
            req.headers.delete('host')
            req.headers.set('Host', imageUrl.host);
            
            // Fetch the media
            const data = await fetch(imageUrl, {
                method: req.method,
                headers: req.headers,
                redirect: "follow",
                //@ts-ignore
                duplex: 'half',
                //@ts-ignore
                signal: AbortSignal.timeout(20 * 1000),
            }).catch((error) => console.log(error))


            // Check if data was returned and either perform fallback redirect or return an error
            if (!data) {
                // Fallback and redirect the request to the original image URL
                if (fallback) return res.setHeader('Location', imageUrl).status(302).send();
                return res.error('The proxy failed to fetch the media from the server').send();
                
            }
            
            // HTTP 304 trips up the checks so except it from the failure responses
            if (!data.ok && data.status != 304) {
                if (fallback) return res.setHeader('Location', imageUrl).status(302).send();
                return res.error(await data.text(), data.status).send();
            }
            

            // Add the response headers from the fetch to the response to the client
            for (const header of data.headers.keys()) {
                res.setHeader(header, data.headers.get(header))
            }

            // Let the upstream/proxy server set the content encoding header
            res.headers.delete('content-encoding');
            
            const image = await data.blob();
            return  res
                .type(image.type)
                .send(await image.arrayBuffer());
        }
    }
    catch (error) {
        // Log the error and fallback to redirecting the request to the original image URL
        console.log( error)
        if (fallback)return res.setHeader('Location', imageUrl).status(302).send();
        return res.error('An non-fetch error occurred during the proxy process').send();
    }
}


// Check if the provided URL is an image
function isImage  (url: string | undefined) {
    if (!url) return false
    return /\.(jpeg|jpg|gif|png|svg|bmp|webp)$/i.test(new URL(url).pathname)
}

// Check if provided URL is a video
function isVideo (inputUrl: string | undefined) {
  if (!inputUrl) return false

  const url = new URL(inputUrl).pathname.toLowerCase()

  return url.endsWith('mp4') || url.endsWith('webm') || url.endsWith('mov') || url.endsWith('m4v')
}

