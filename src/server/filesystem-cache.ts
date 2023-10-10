interface FilesystemCache {
    cacheDir: string,
    createKey: Function,
    evictExpiredItems: Function,
    evictOldestItems: Function,
    flush: Function,
    get: Function,
    housekeep: Function,
    init: Function,
    initialized: boolean,
    put: Function
    query: Function,
    stats: {
        items: number,
        size: number,
        sizeMB:number,
        percentFull: number
        hits: number,
        misses:number,
        hitRate: number,
    },
    updateStats: Function,
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


export const cache:FilesystemCache = {
    cacheDir: '/app/cache',
    initialized: false,
    stats: {
        items: 0,
        size: 0,
        sizeMB: 0,
        percentFull: 0,
        hitRate: 0,
        hits: 0,
        misses: 0,
    },

    createKey: function(value:string) {
        return createHash('sha256').update(value).digest('hex') + '.cache';        
    },

    evictExpiredItems: async function(minutes:number=MEDIA_CACHE_DURATION):Promise<number> {
        if (!cache.initialized) return 0;
        let directoryList:Array<DirectoryList> = await getDirContents(cache.cacheDir)
        let evictedItems: number = 0;
    
        for ( let i:number=0; i<directoryList.length; i++) {
            let entry:Stats = directoryList[i];
    
            let lastAccessTime:number   = entry.stats.atimeMs;
            let now:number              = new Date().valueOf();
            let timeDiff:number         = Math.floor ( ( (now - lastAccessTime) /1000 / 60 ) );  // floor(ms to minutes)
            
            if (timeDiff > minutes) {
                console.log(`\t Evicting ${entry.path} from cache due to expiration`);
                try {
                    await rm(entry.path)
                    evictedItems++;
                }
                catch (err) {
                    console.log(err);
                }   
            }
        }
        return evictedItems;
    },

    evictOldestItems: async function():Promise<number> {
        if (!cache.initialized) return 0;
        // Purges the oldest 25% of items in the cache
        console.log(`Cache at ${cache.stats.percentFull.toString()}% - purging oldest 25%`);

        let directoryList:Array<DirectoryList> = await getDirContents(cache.cacheDir)
        let evictedItems: number = 0;
        let numItems = Math.round(cache.stats.items * 0.25);

        directoryList = sortDirectoryContents(directoryList, 'atimeMs', 'asc');
        
        for ( let i:number=0; i<numItems; i++) {
            let entry:Stats = directoryList[i];
            console.log(`\t Evicting ${entry.path} from cache to remain under quota.`);
                try {
                    await rm(entry.path)
                    evictedItems++;
                }
                catch (err) {
                    console.log(err);
                }  
        }

        await cache.updateStats();
        
        // Call this function recursively until percent full is less than 95%
        if (cache.stats.percentFull > 95) {
            await cache.evictOldestItems();
        }
        return evictedItems;
    },

    flush: async function() {
        // Not yet implemented.  Just clear the contents of /app/cache for now.
        return false;
    },

    get: async function(key:string)  {
        if (!cache.initialized) return false;
        let file;
        
        try {
            file = await open(`${cache.cacheDir}/${key}`);
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
                    console.log(`Removing malformed cache item: ${cache.cacheDir}/${key}`);
                    await rm(`${cache.cacheDir}/${key}`)
                    return false
                }
            }
            
            // Update the access time to keep it in the cache until it's not been accessed for more than the cache duration. 
            if (MEDIA_CACHE_KEEP_HOT_ITEMS) {
                let now = new Date();
                await utimes(`${cache.cacheDir}/${key}`, now, now)
            }

            // Update hit count
            cache.stats.hits++;

            // Create a blob from the array buffer and return it
            let blob = new Blob([buffer], { type: mime });
            return blob;
        }
        // Typical error is when bad/partially written cache item can't have its mime detected. Silently delete the cache item.
        catch (err) {
            console.log("filesystem-cache.ts:cache:get");
            console.log(err)
        }

    },
    

    housekeep: async function() {
        if (!cache.initialized) return false;

        // Update and report the cache stats
        await cache.updateStats();

        // Evict items older than the defined cache duration
        try {
            let evictedCount:number = await cache.evictExpiredItems(MEDIA_CACHE_DURATION);
            
            if (evictedCount > 0) {
                console.log(`Evicted ${evictedCount.toString()} expired items from the proxy cache.`);
                await cache.updateStats();
            }
            
        }
        catch (err) {
            console.log("filesystem-cache.ts:cache:housekeep:evict-expired");
            console.log(err);
        }

        // Evict oldest items when cache is above 95% full
        if (cache.stats.percentFull > 95) {
            try {
                let purgedCount = await cache.evictOldestItems();
                console.log(`Purged ${purgedCount.toString()} items from the proxy cache.`);
            }
            catch (err) {
                console.log("filesystem-cache.ts:cache:housekeep:evict-oldest");
                console.log(err);
            }
        }
        
        // Update and report the cache stats
        await cache.updateStats(true);
    },

    init: async function(path:string|undefined = undefined) {
        if (path) { 
            cache.cacheDir = path;
        }
        try {
            await access(cache.cacheDir, constants.R_OK | constants.W_OK);
            console.log("Cache Options:")
            console.log(`\tMax Size: ${MEDIA_CACHE_MAX_SIZE} MB`);
            console.log(`\tKeep hot: ${MEDIA_CACHE_KEEP_HOT_ITEMS.toString()}`);
            console.log(`\tDuration: ${MEDIA_CACHE_DURATION.toString()} minutes`)
            cache.initialized = true;
            return true;
        }
        catch {
            console.log("filesystem-cache.ts:cache:init");
            console.log(`Unable to open cache directory (${cache.cacheDir}) for write access. Make sure it is present and writable by UID/GID 1000`);
            return false;
        }
    },

    put: async function(key:string, data:Blob) {
        if (!cache.initialized) return false;

        if (cache.stats.percentFull < 95) {
            try {
                let buffer = Buffer.from (await data.arrayBuffer() );
                await writeFile(`${cache.cacheDir}/${key}`, buffer)
                // Update miss count
                cache.stats.misses++;
            }
            catch (err) {
                console.log("filesystem-cache.ts:cache:put");
                console.log(err);
                return false
            }
        }
        
    },

    query: async function(key:string) {
        if (!cache.initialized) return false;
        try {
            await access(`${cache.cacheDir}/${key}`, constants.R_OK)
            return true;
        }
        // Since this is a lookup to see if the file exists, silently ignore failures since cache misses will throw useless errors.
        catch {
            return false;
        }
    },

    updateStats: async function(report:boolean = false) {
        if (!cache.initialized) return false;
        try {
            let contents:Array<DirectoryList> = await getDirContents(cache.cacheDir)

            cache.stats.items           = contents.length
            cache.stats.size            =  await getDirectorySize(cache.cacheDir);
            cache.stats.sizeMB          = Math.round(cache.stats.size/1000/1000);
            cache.stats.percentFull     = Math.round((cache.stats.sizeMB / MEDIA_CACHE_MAX_SIZE) * 100);
            cache.stats.hitRate         = Math.round((cache.stats.hits / cache.stats.misses) * 100) || 0
            
            if (report) {
                console.log("Media proxy cache stats:");
                console.log(`\t Cached Items: ${cache.stats.items.toString()}`);
                console.log(`\t Utilization: ${cache.stats.percentFull.toString()}% (${cache.stats.sizeMB.toString()} MB / ${MEDIA_CACHE_MAX_SIZE} MB)`);
                console.log(`\t Hit Rate: ${cache.stats.hitRate.toString()}% (Hits: ${cache.stats.hits.toString()} Misses: ${cache.stats.misses.toString()}) `);
            }
        }
        catch (err) {
            console.log("filesystem-cache.ts:cache:updateStats");
            console.log(err)
        }
    }
   
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

const sortDirectoryContents = function(contents:Array<Stats>, attr:string = 'atimeMs', dir:string='asc' ):Array<Stats> {
    
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



const evictOldestPercentage = async function(percent:number):Promise<number> {
    

    let targetBytes = (MEDIA_CACHE_MAX_SIZE * 1000 * 1000) * (percent/100)

    let files = sortDirectoryContents(await getDirContents(cacheDir), 'atimeMs', 'asc')
    return 0;


}