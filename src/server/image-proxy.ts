/*
    To do: 
    1.  Finish filesystem cache
    2.  Move image fetch to separate function and put into a retry loop.
        a. Define config item for retry attempts.   Default: 3
        b. Define config item for retry interva.    Default: 250ms
    3.  
*/
interface FilesystemCache {
    createKey: Function,
    get: Function,
    flush: Function,
    init: Function,
    put: Function
    query: Function,
    housekeep: Function,
}


import { 
    ENABLE_MEDIA_PROXY,
    ENABLE_MEDIA_CACHE,
    MEDIA_CACHE_DURATION,
    MEDIA_CACHE_MAX_SIZE,
    

} from '$lib/settings'

import { Buffer } from 'buffer';
import { createHash } from 'node:crypto'
import {fileTypeFromBuffer} from 'file-type';
import { 
    access,
    constants,
    open,
    opendir,
    readFile,
    rm,
    stat,
    utimes,
    writeFile,

} from 'node:fs/promises'




const cacheDir:string = "/app/cache";

export const cache:FilesystemCache = {
    createKey: function(value:string) {
        return createHash('sha256').update(value).digest('hex') + '.cache';        
    },
    
    flush: async function() {
        
        return false;
    },

    get: async function(key:string)  {
        let file;
        try {
            file = await open(`${cacheDir}/${key}`);
            let buffer = await file.readFile();
            
            let mimetype = await fileTypeFromBuffer(buffer);
            let blob = new Blob([buffer], { type: mimetype.mime });

            return blob;
        }
        catch (err) {
            console.log(err)
            return false;
        }
        finally {
            // Close the file handle
            await file.close();
            
            // Update the access time to keep it in the cache until it's not been accessed for more than the cache duration
            try {
                let now = new Date();
                await utimes(`${cacheDir}/${key}`, now, now)
                console.log(`Updated last access time for ${cacheDir}/${key}`);
            }
            catch (err) {
                console.log(err)
            }
            
        }
    },
    

    housekeep: async function() {
        // Evict items older than the defined cache duration
        try {
            let dir = await opendir(cacheDir);
            for await (const entry of dir) {
                let filestat = await stat(entry.path);

                let lastAccessTime:number = filestat.atimeMs;
                let now:number = new Date().valueOf();
                let timeDiff:number = Math.floor ( ( (now - lastAccessTime) /1000 / 60 ) );  // floor(ms to minutes)
                
                if (timeDiff > parseInt(MEDIA_CACHE_DURATION)) {
                    console.log(`Evicting ${entry.path} from cache due to expiration`);
                    try {
                        await rm(entry.path)
                    }
                    catch (err) {
                        console.log(err);
                    }   
                }
            }
        }
        catch (err) {
            console.log("image-proxy:housekeep:evict");
            console.log(err);
        }

        // Check cache directory size and evict oldest items
        try {
            let cacheDirSize:number = await getDirectorySize(cacheDir);
            let cacheDirSizeMB:number = Math.round(cacheDirSize/1000/1000);
            let percentFull:number = Math.round((cacheDirSizeMB / MEDIA_CACHE_MAX_SIZE) * 100);
            
            // Start evicting items at 95% full
            if (percentFull > 95) {

            }

            
            
            console.log(cacheDirSize.toString() + " --- " + cacheDirSizeMB.toString());
            

        }
        catch (err) {
            console.log(err)
        }

    },

    init: async function(path:string) {
        try {
            await access(cacheDir, constants.R_OK | constants.W_OK);
            return true;
        }
        catch {
            console.log(`Unable to open cache directory (${cacheDir}) for write access. Make sure it is present and writable by UID/GID 1000`);
            return false;
        }
    },

    put: async function(key:string, data:Blob) {
        try {
            let buffer = Buffer.from (await data.arrayBuffer() );
            await writeFile(`${cacheDir}/${key}`, buffer)
        }
        catch (err) {
            console.log(err);
            return false
        }
        
    },

    query: async function(key:string) {
        try {
            await access(`${cacheDir}/${key}`, constants.R_OK)
            return true;
        }
        catch {
            return false;
        }
    },
   
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
            
            //// Check Filesystem Cache
            // Lookup the image URL in the cache and return that if found
            let cacheKey = cache.createKey(imageUrl.href);
            if (cacheKey && await cache.query(cacheKey)) {
                
                console.log(`Key (${cacheKey}) found in cache. Loading and returning cached version of the file.`);
                
                let image = await cache.get(cacheKey);
                return  res
                    .setHeader('X-Tesseract-Image-Cache', 'hit')
                    .setHeader('X-Tesseract-Image-Cache-Key', cacheKey)
                    .setHeader('Cache-Control', 'max-age=3600') 
                    .type(image.type)
                    .send(await image.arrayBuffer());
            }
            
            // Massage the request headers to create a new connection to the target Lemmy instance
            req.headers.delete('origin');
            req.headers.delete('host');
            req.headers.delete('if-modified-since');
            req.headers.set('Host', imageUrl.host);
            
            // Fetch the media
            const data = await fetch(imageUrl, {
                method: req.method,
                headers: req.headers,
                redirect: "follow",
                //@ts-ignore
                duplex: 'half',
                //@ts-ignore
                signal: AbortSignal.timeout(45 * 1000),
            }).catch((error) => console.log(error))


            // Check if data was returned and either perform fallback redirect or return an error
            if (!data) {
                // Fallback and redirect the request to the original image URL
                if (fallback) return res.setHeader('Location', imageUrl).status(302).send();
                
                // If fallback redirect is disabled by user, return an error.
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
            
            // Convert the data response into a blob
            const image = await data.blob();
            
            // Store image data to cache
            await cache.put(cacheKey, image);
            
            return  res
                .setHeader('X-Tesseract-Image-Cache', 'miss')  
                .setHeader('Cache-Control', 'max-age=3600') 
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

// Calculate directory size
async function getDirectorySize (dirPath:string) {
    let totalSize:number = 0;
    
    let dir = await opendir(dirPath);
    for await (const entry of dir) {    
        let stats = await stat(entry.path);
        totalSize += stats.size;
    }
    return totalSize;
}