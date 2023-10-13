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

interface DirectoryList {
    path: string,
    stats: Stats
}


export class FSCache {
    config =  {
        cacheDir: '/app/cache',
        duration: (12*60),
        keepHot: true,
        maxSize: 1000,
    };
    
    initialized = false
    
    stats = {
        items: 0,
        size: 0,
        sizeMB: 0,
        percentFull: 0,
        hitRate: 0,
        hits: 0,
        misses: 0,
    }
    
    constructor(
        path:string|undefined       = undefined,
        maxSize:number | undefined  = undefined,
        duration:number | undefined = undefined,
        keepHot:boolean|undefined   = undefined
    ){
        if (path)       this.config.cacheDir = path;
        if (maxSize)    this.config.maxSize = maxSize;
        if (duration)   this.config.duration = duration;
        if (keepHot)    this.config.keepHot = keepHot
    }
    
    
    createKey(value:string):string {
        return createHash('sha256').update(value).digest('hex') + '.cache';        
    }
    
    async evict(key:string):Promise<boolean> {
        if (!this.initialized) return false;
        try {
            await rm(`${this.config.cacheDir}/${key}`);
            return true;
        }
        catch (err) {
            console.log(`filesystem-cache.ts:evict:${key}`);
            console.log(err);
            return false;
        }
        
        
    }


    async evictExpiredItems():Promise<number> {
        if (!this.initialized) return 0;
        let directoryList:Array<DirectoryList> = await this.getDirContents()
        let evictedItems: number = 0;
    
        for ( let i:number=0; i<directoryList.length; i++) {
            let entry:Stats = directoryList[i];
    
            let lastAccessTime:number   = entry.stats.atimeMs;
            let now:number              = new Date().valueOf();
            let timeDiff:number         = Math.floor ( ( (now - lastAccessTime) /1000 / 60 ) );  // floor(ms to minutes)
            
            if (timeDiff > this.config.duration) {
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
    }

    async evictOldestItems():Promise<number> {
        if (!this.initialized) return 0;
        
        // Purges the oldest 25% of items in the cache
        console.log(`Cache at ${this.stats.percentFull.toString()}% - purging oldest 25%`);

        let directoryList:Array<DirectoryList> = await this.getDirContents()
        let evictedItems: number = 0;
        let numItems = Math.round(this.stats.items * 0.25);

        directoryList = this.sortDirectoryContents(directoryList, 'atimeMs', 'asc');
        
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

        await this.updateStats();
        
        // Call this function recursively until percent full is less than 95%
        if (this.stats.percentFull > 95) {
            await this.evictOldestItems();
        }
        return evictedItems;
    }

    async flush():Promise<boolean> {
        if (!this.initialized) return false;
        let directoryList:Array<DirectoryList> = await this.getDirContents()
        let errors:number = 0;

        for ( let i:number=0; i<directoryList.length; i++) {
            let entry:Stats = directoryList[i];
            try {
                await rm(entry.path)
            }
            catch (err) {
                console.log(`Failed to delete ${entry.path} from cache during flush`);
                console.log(err);
                errors++;
            }
        }
        
        if (errors > 0) return false;
        return true;
    }
    
    async get(key:string):Promise<Blob|boolean>  {
        if (!this.initialized) return false;
        let file;
        
        try {
            file = await open(`${this.config.cacheDir}/${key}`);
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
                    console.log(`Removing malformed cache item: ${this.config.cacheDir}/${key}`);
                    await rm(`${this.config.cacheDir}/${key}`)
                    return false
                }
            }
            
            // Update the access time to keep it in the cache until it's not been accessed for more than the cache duration. 
            if (this.config.keepHot) {
                let now = new Date();
                await utimes(`${this.config.cacheDir}/${key}`, now, now)
            }

            // Update hit count
            this.stats.hits++;

            // Create a blob from the array buffer and return it
            let blob = new Blob([buffer], { type: mime });
            return blob;
        }
        // Typical error is when bad/partially written cache item can't have its mime detected. Silently delete the cache item.
        catch (err) {
            console.log("filesystem-cache.ts:cache:get");
            console.log(err)
            return false;
        }

    }


    async getDirectorySize ():Promise<number> {
        let totalSize:number = 0;
        try {
            let dir = await opendir(this.config.cacheDir);
            for await (const entry of dir) {    
                if (entry.path != '/app/cache') {
                    let stats = await stat(entry.path);
                    totalSize += stats.size;
                }
            }
        }
        catch (err) {
            console.log("filesystem-cache.ts:getDirectorySize");
            console.log(err);
        }

        return totalSize;
    }

    async getDirContents (): Promise<Array<DirectoryList>> {
        try {
            let dir = await opendir(this.config.cacheDir);
            let contents:Array<DirectoryList> = []
            
            for await (const entry of dir) {
                if (entry.path != '/app/cache') {
                    let item = {
                        path: entry.path,
                        stats: await stat(entry.path)
                    }
                    contents.push(item)
                }
            }
            return contents;
        }
        catch (err) {
            console.log(`filesystem-cache.ts:getDirContents: ${this.config.cacheDir}`);
            console.log(err);
            return [] as Array<DirectoryList>;
        }
    }

    async housekeep():Promise<void|boolean> {
        if (!this.initialized) return false;

        // Update and report the cache stats
        await this.updateStats();

        // Evict items older than the defined cache duration
        try {
            let evictedCount:number = await this.evictExpiredItems();
            
            if (evictedCount > 0) {
                console.log(`Evicted ${evictedCount.toString()} expired items from the proxy cache.`);
                await this.updateStats();
            }
            
        }
        catch (err) {
            console.log("filesystem-cache.ts:cache:housekeep:evict-expired");
            console.log(err);
        }

        // Evict oldest items when cache is above 95% full
        if (this.stats.percentFull > 95) {
            try {
                let purgedCount = await this.evictOldestItems();
                console.log(`Purged ${purgedCount.toString()} items from the proxy cache.`);
            }
            catch (err) {
                console.log("filesystem-cache.ts:cache:housekeep:evict-oldest");
                console.log(err);
            }
        }
        
        // Update and report the cache stats
        await this.updateStats(true);
    }

    async init():Promise<boolean> {
        try {
            await access(this.config.cacheDir, constants.R_OK | constants.W_OK);
            console.log("Cache Options:")
            console.log(`\tMax Size: ${this.config.maxSize} MB`);
            console.log(`\tKeep hot: ${this.config.keepHot.toString()}`);
            console.log(`\tDuration: ${this.config.duration.toString()} minutes`)
            this.initialized = true;
            return true;
        }
        catch {
            console.log("filesystem-cache.ts:cache:init");
            console.log(`Unable to open cache directory (${this.config.cacheDir}) for write access. Make sure it is present and writable by UID/GID 1000`);
            return false;
        }
    }

    async put(key:string, data:Blob):Promise<boolean> {
        if (!this.initialized) return false;

        if (this.stats.percentFull < 95) {
            try {
                let buffer = Buffer.from (await data.arrayBuffer() );
                await writeFile(`${this.config.cacheDir}/${key}`, buffer)
                // Update miss count
                this.stats.misses++;
                return true;
            }
            catch (err) {
                console.log("filesystem-cache.ts:cache:put");
                console.log(err);
                return false
            }
        }
        return false;
        
    }

    async query(key:string):Promise<boolean> {
        if (!this.initialized) return false;
        try {
            await access(`${this.config.cacheDir}/${key}`, constants.R_OK)
            return true;
        }
        // Since this is a lookup to see if the file exists, silently ignore failures since cache misses will throw useless errors.
        catch {
            return false;
        }
    }

    sortDirectoryContents(contents:Array<Stats>, attr:string = 'atimeMs', dir:string='asc' ):Array<Stats> {
    
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

    async updateStats(report:boolean = false):Promise<void> {
        if (!this.initialized) return;
        
        try {
            let contents:Array<DirectoryList> = await this.getDirContents()

            this.stats.items           = contents.length
            this.stats.size            = await this.getDirectorySize();
            this.stats.sizeMB          = Math.round(this.stats.size/1000/1000);
            this.stats.percentFull     = Math.round((this.stats.sizeMB / this.config.maxSize) * 100);
            this.stats.hitRate         = Math.round((this.stats.hits / (this.stats.hits + this.stats.misses)) * 100) || 0
            
            if (report) {
                console.log("Cache stats:");
                console.log(`\t Cached Items: ${this.stats.items.toString()}`);
                console.log(`\t Utilization: ${this.stats.percentFull.toString()}% (${this.stats.sizeMB.toString()} MB / ${this.config.maxSize} MB)`);
                console.log(`\t Hit Rate: ${this.stats.hitRate.toString()}% (Hits: ${this.stats.hits.toString()} Misses: ${this.stats.misses.toString()}) `);
            }
        }
        catch (err) {
            console.log("filesystem-cache.ts:cache:updateStats");
            console.log(err)
        }
    }
    

}




