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
            await file.close();
            
            let { mime } = await fileTypeFromBuffer(buffer) ?? { mime: undefined};

            // If MIME type is not detected, check if it's an SVG as those often trip it up.            
            if (!mime) { 
                // SVG tends to trip up, so do manual detection of those
                let head:string = buffer.toString().slice(0,20);
                if (head.startsWith('<svg xmlns')) {
                    mime = 'image/svg+xml'
                }
                
                // If not manually detected as SVG, delete cache item since mime type detection failed (often due to aborted fetch and partial download)
                else {
                    console.log(`Removing malformed cache item: ${cacheDir}/${key}`);
                    await rm(`${cacheDir}/${key}`)
                    return false
                }
            }
            
            // Update the access time to keep it in the cache until it's not been accessed for more than the cache duration. 
            if (MEDIA_CACHE_KEEP_HOT_ITEMS && !cache.full) {
                let now = new Date();
                await utimes(`${cacheDir}/${key}`, now, now)
            }
            
            // Create a blob from the array buffer and return it
            let blob = new Blob([buffer], { type: mime });
            return blob;
        }
        // Typical error is when bad/partially written cache item can't have its mime detected. Silently delete the cache item.
        catch (err) {
            console.log("image-proxy.ts:cache:get");
            console.log(err)
        }

    },
    

    housekeep: async function() {
        // Evict items older than the defined cache duration
        try {
            let evictCount:number = await evictExpiredItems(cacheDir, MEDIA_CACHE_DURATION);
            console.log(`Evicted ${evictCount.toString()} expired items from the proxy cache.`);
        }
        catch (err) {
            console.log("image-proxy.ts:cache:housekeep:evict-expired");
            console.log(err);
        }

        // Check cache directory size and evict oldest items
        // The proc is buggy and needs replaced.
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
            console.log("image-proxy.ts:cache:housekeep:evict-quota");
            console.log(err)
        }

    },

    init: async function(path:string) {
        try {
            await access(cacheDir, constants.R_OK | constants.W_OK);
            return true;
        }
        catch {
            console.log("image-proxy.ts:cache:init");
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
                console.log("image-proxy.ts:cache:put");
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
        // Since this is a lookup to see if the file exists, silently ignore failures since cache misses will throw useless errors.
        catch {
            return false;
        }
    },
   
}

//// Utility Functions
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

const evictExpiredItems = async function(dir: string, minutes:number=MEDIA_CACHE_DURATION): Promise <number> {
    let directoryList:Array<DirectoryList> = await getDirContents(dir)
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