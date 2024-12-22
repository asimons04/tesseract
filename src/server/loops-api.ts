import { access, mkdir, open, writeFile } from 'node:fs/promises'

const cacheDir = '/app/cache/loops'
const cacheFile = `${cacheDir}/video-maps.json`
let cache = {} as LoopsVideoMap

interface LoopsVideoMap {
    [key:string]: string
}

// Create the cache directory if it does not exist.
try {
    await access(cacheDir)
}
catch {
    try {
        await mkdir(cacheDir);
    }
    catch {
        console.log("Unable to create cache directory")
    }
}

/** Loads the JSON file containing the on-disk lookup cache */
async function load() {
    try {
        
        let file = await open(cacheFile)
        let buffer = await file.readFile()
        await file.close()

        cache = JSON.parse(buffer.toString())
    }
    catch (err) {console.log("Failed to load cache file", err)}
}

/** Saves the current cache object to a JSON file on disk */
async function save() {
    try {
        await writeFile(cacheFile, JSON.stringify(cache))
    }
    catch (err) {console.log("Failed to save cache file", err)}
}

/** Lookup the video source URL for a given Loops video link
 * @param loopsURL The Loops page link for the video
*/
export async function getVideoURL(loopsURL:string) {
    // Load the latest cache
    await load()

    // If video URL is found in the cache, return that
    let video_url = cache[loopsURL]
    if (video_url) return video_url

    // If video URL not found in cache, fetch the page, scrape for the video-src, and cache the successful response
    try {
        const response = await fetch(loopsURL)
        const body = await response.text()
        const matches = body.match(/(video-src=").*\"/gi)
        
        if (matches) {
            let video_url = matches[0].split('=')[1].replaceAll('"', '')
            
            if (video_url?.startsWith('http') && video_url.endsWith('.mp4')) {
                cache[loopsURL] = video_url
                await save()
                return video_url
            }
            return undefined
        }
    }
    catch (err) {
        console.log(err)
        return undefined
    } 

}



export async function loops_router(event:any) {
    let req = event.req;
    let res = event.res;

    if (req.method == 'GET' && req.route == '/lookup') {
        let loops_url = req.params.get('loops_url');

        if (loops_url) {
            let video_url = await getVideoURL(loops_url);

            if (video_url) {
                return res.json({video_url}).send();
            }
            else {
                return res
                    .error(`No results for ${loops_url}`)
                    .send();
            }
        }
        else {
            return res.error("No or invalid 'loops_url' specified").send();
        }

    }



    return res.error("Invalid API method requested").send()

}

