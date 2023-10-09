/*
    To do: 
    1.  Finish filesystem cache
    2.  Move image fetch to separate function and put into a retry loop.
        a. Define config item for retry attempts.   Default: 3
        b. Define config item for retry interva.    Default: 250ms
    3.  
*/
interface FilesystemCache {
    full: boolean,
    createKey: Function,
    get: Function,
    flush: Function,
    init: Function,
    put: Function
    query: Function,
    housekeep: Function,
}

interface DirectoryList {
    path: string,
    stats: Stats
}

import { 
    ENABLE_MEDIA_PROXY,
    ENABLE_MEDIA_CACHE,
    MEDIA_CACHE_KEEP_HOT_ITEMS,
    MEDIA_CACHE_DURATION,
    MEDIA_CACHE_MAX_SIZE,
    

} from '$lib/settings'

import { Buffer } from 'buffer';
import { createHash } from 'node:crypto'
import {fileTypeFromBuffer} from 'file-type';
import { 
    type Stats,

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
    
    full: false,
    createKey: function(value:string) {
        return createHash('sha256').update(value).digest('hex') + '.cache';        
    },
    
    flush: async function() {
        // Not yet implemented.  Just clear the contents of /app/cache for now.
        return false;
    },

    get: async function(key:string)  {
        let file;
        try {
            file = await open(`${cacheDir}/${key}`);
            let buffer = await file.readFile();
            
            let mimetype = await fileTypeFromBuffer(buffer);
            let blob = new Blob([buffer], { type: mimetype.mime });

            // Close the file handle
            await file.close();
                        
            // Update the access time to keep it in the cache until it's not been accessed for more than the cache duration. 
            if (MEDIA_CACHE_KEEP_HOT_ITEMS && !cache.full) {
                try {
                    let now = new Date();
                    await utimes(`${cacheDir}/${key}`, now, now)
                }
                catch (err) {
                    console.log(err)
                }
            }
            return blob;
        }
        // Typical error is when bad/partially written cache item can't have its mime detected. Silently delete the cache item.
        catch (err) {
            try {
                await rm(`${cacheDir}/${key}`)
            }
            catch {
                return false;
                
            }
        }

    },
    

    housekeep: async function() {
        // Evict items older than the defined cache duration
        try {
            //let files:Array<DirectoryList>  = await getDirContents(cacheDir);
            let evictCount:number           = await evictExpiredItems(MEDIA_CACHE_DURATION);
            console.log(`Evicted ${evictCount.toString()} expired items from the proxy cache.`);
        }
        catch (err) {
            console.log("image-proxy.ts:cache:housekeep:evict-expired");
            console.log(err);
        }

        // Check cache directory size and evict oldest items
        try {
            let cacheDirSize: number     = await getDirectorySize(cacheDir);
            let cacheDirSizeMB: number   = Math.round(cacheDirSize/1000/1000);
            let percentFull: number      = Math.round((cacheDirSizeMB / MEDIA_CACHE_MAX_SIZE) * 100);
            
            // Start evicting items at 98% full
            if (percentFull > 99) {
                cache.full = true;

                // Loop through cache directory and evict items older than half of the cache duration
                try {
                    let dir = await opendir(cacheDir);
                    let evictCount: number = 0;

                    for await (const entry of dir) {
                        let filestat = await stat(entry.path);
        
                        let lastAccessTime: number  = filestat.atimeMs;
                        let now: number             = new Date().valueOf();
                        let timeDiff: number        = Math.floor ( ( (now - lastAccessTime) /1000 / 60 ) );  // floor(ms to minutes)
                        
                        let halfDuration = parseInt(MEDIA_CACHE_DURATION) * 0.5;
                        
                        if (timeDiff > halfDuration ) {
                            console.log(`Evicting ${entry.path} from cache to remain under quota.`);
                            try {
                                await rm(entry.path)
                                evictCount++;
                            }
                            catch (err) {
                                console.log(err);
                            }   
                        }
                    }
                    console.log(`Evicted ${evictCount.toString()} items from the proxy cache to remain under quota.`);
                }
                catch (err) {
                    console.log("image-proxy:housekeep:evict-quota");
                    console.log(err);
                }
            }
            else {
                cache.full = false;
            }
            
            // Status to output after each run
            console.log(`Media proxy cache usage: ${cacheDirSizeMB.toString()} MB / ${MEDIA_CACHE_MAX_SIZE} MB, Full: ${cache.full.toString()}` );
            

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
        if (!cache.full) {
            try {
                let buffer = Buffer.from (await data.arrayBuffer() );
                await writeFile(`${cacheDir}/${key}`, buffer)
            }
            catch (err) {
                console.log(err);
                return false
            }
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

// Web Request Handler
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
        
    }
    req.params.delete('fallback');

    // Build a URL to the requested image/video
    let imagePath = `${req.route}`
    let imageUrl = new URL(`https://${imagePath}?${req.params.toString()}`);

    try {
        if ( req.method == 'GET' && ( isImage(req.url) || isVideo(req.url) ) ) {
            
            // Lookup the image URL in the cache and return that if found
            let cacheKey
            if (ENABLE_MEDIA_CACHE) {
                cacheKey = cache.createKey(imageUrl.href);
                if (cacheKey && await cache.query(cacheKey)) {
                    //console.log(`Key (${cacheKey}) found in cache. Loading and returning cached version of the file.`);
                    let image = await cache.get(cacheKey);
                    return res
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
            }
            
            // Fetch the media
            let data = await fetchMedia(imageUrl, req)

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
            if (ENABLE_MEDIA_CACHE) {
                await cache.put(cacheKey, image);
            }
            
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


// Fetch an image
const fetchMedia = async function(imageUrl:URL|string, req:any): Promise<void|Response> {
    const data = await fetch(imageUrl, 
        {
            method: req.method,
            //headers: req.headers,
            redirect: "follow",
            //@ts-ignore
            signal: AbortSignal.timeout(60 * 1000),
        }
    )
    .catch((error) => {
        console.log(req.headers);
        console.log(imageUrl);
        console.log(error);
    })
    
    return data;
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



// Return a list of files and their stats
const getDirContents = async function(path:string): Promise<Array<DirectoryList>> {
    try {
        let dir = await opendir(path);
        let contents:Array<DirectoryList> = []
        
        for await (const entry of dir) {
            let item = {
                path: entry.path,
                stats: await stat(entry.path)
            }
            contents.push(item)
        }
        return contents;
    }
    catch (err) {
        console.log(`getDirContents: ${path}`);
        console.log(err);
        return [] as Array<DirectoryList>;
    }
}

const sortDirectoryContents = function(contents:Array<Stats>, attr:string = 'atimeMs', dir:string='asc' ) {
    
    const asc = function (a:Stats, b:Stats) {
        if (a[attr] > b[attr]) return 1
        if (a[attr] < b[attr]) return -1
        return 0
    }

    const desc = function (a:Stats, b:Stats) {
        if (a[attr] > b[attr]) return -1
        if (a[attr] < b[attr]) return 1
        return 0
    }

    if (dir=='asc') contents.sort(asc)
    if (dir=='desc') contents.sort(desc)

    return contents;
}

const evictExpiredItems = async function(minutes:number=MEDIA_CACHE_DURATION): Promise <number> {
    let directoryList:Array<DirectoryList> = await getDirContents(cacheDir)
    let evictedItems: number = 0;

    for ( let i:number=0; i<directoryList.length; i++) {
        let entry:Stats = directoryList[i];

        let lastAccessTime:number   = entry.atimeMs;
        let now:number              = new Date().valueOf();
        let timeDiff:number         = Math.floor ( ( (now - lastAccessTime) /1000 / 60 ) );  // floor(ms to minutes)

        if (timeDiff > minutes) {
            console.log(`Evicting ${entry.path} from cache due to expiration`);
            try {
                await rm(entry.path)
                evictedItems++;
            }
            catch (err) {
                console.log(err);
            }   
        }
    }
    return evictedItems
}

const evictOldestPercentage = async function(percent:number) {
    //let cacheDirSize: number     = await getDirectorySize(cacheDir);
    
    //let cacheDirSizeMB: number   = Math.round(cacheDirSize/1000/1000);
    //let percentFull: number      = Math.round((cacheDirSizeMB / MEDIA_CACHE_MAX_SIZE) * 100);

    let targetBytes = (MEDIA_CACHE_MAX_SIZE * 1000 * 1000) * (percent/100)

    let files = sortDirectoryContents(await getDirContents(cacheDir), 'atimeMs', 'asc')
    


}

/*
const { opendir, stat} = require('node:fs/promises');
const getDirContents = async function(path) {
    let dir = await opendir(path);
    let contents = []

    for await (const entry of dir) {
        contents[entry.path] = await stat(entry.path);
    }
    return contents;
}
*/

