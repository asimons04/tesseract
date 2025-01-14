import { isBrowserUA } from './server/helpers'

// Router
import { router } from './server/router.js'

// Route Handlers
import { fediseer_router }      from './lib/fediseer/server.js'
import { image_proxy }          from './server/image-proxy.js'
import { loops_router }         from './server/loops-api.js'
import { mbfc_router }          from './lib/MBFC/server.js'
import { metadata_router }      from './server/metadata-provider.js'
import { proxy_pictrs_upload }  from './server/upload-image.js'


// Routes
const api = '/tesseract/api'
const routes = [
    {
        route: '/cors/*',
        handler: proxy_pictrs_upload
    },

    {
        route: '/image_proxy/*',
        handler: image_proxy
    },
    {
        route: `${api}/fediseer*`,
        handler: fediseer_router
    },
    {
        route: `${api}/mbfc*`,
        handler: mbfc_router
    },
    {
        route: `${api}/loops*`,
        handler: loops_router
    },
    {
        route: `${api}/metadata*`,
        handler: metadata_router
    }
    
]

// Svelte Handler
export async function handle({event, resolve }: {event:any, resolve:any}) {

    // If a server-side UA makes a request, treat it as a request for metadata
    // by re-writing the url path and prefixing it with the local metadata lookup endpoint
    // e.g. For non-browsers, /post/12345 -> /tesseract/api/metadata/post/12345
    try {
        const UA = event.request.headers.get('user-agent')
        if (!isBrowserUA(UA) && !event.url.pathname.includes(api) && !event.url.pathname.includes('/image_proxy/')) {
            event.url.pathname = `/tesseract/api/metadata`+ event.url.pathname
        }
    }
    catch {}


    // Send the defined server-side routes to their handlers 
    const routed =  await router(event, resolve, routes)
    if (routed) return routed

    // Other server hooks can go here
    

    // Resolve the event if it hasn't already
    const response = await resolve(event)
    return response
}



export function handleError({ error, event }) {
    console.error(error)
    return {
        message: 'There was an error during rendering',
    }
}


// Scheduled Tasks

//// Update TTLs in memory cache once per second
import { cache as MemoryCache} from '$lib/cache/memory.js'
const task_memoryCache = setInterval(() => {
    MemoryCache.tick();
}, 1000);


//// Image Proxy Cache
import { FSCache } from './server/filesystem-cache'
import { 
    ENABLE_MEDIA_CACHE,
    ENABLE_MEDIA_PROXY,
    MEDIA_PROXY_BLACKLIST,
    MEDIA_CACHE_HOUSEKEEP_INTERVAL,
    MEDIA_CACHE_HOUSEKEEP_STARTUP,
    MEDIA_CACHE_KEEP_HOT_ITEMS,
    MEDIA_CACHE_DURATION,
    MEDIA_CACHE_MAX_SIZE,
} from '$lib/settings'



const cacheDir = '/app/cache';
export const imageCache = new FSCache(cacheDir, MEDIA_CACHE_MAX_SIZE, MEDIA_CACHE_DURATION, MEDIA_CACHE_KEEP_HOT_ITEMS);

console.log(`Image proxying: ${ENABLE_MEDIA_PROXY.toString()}`);
if (ENABLE_MEDIA_PROXY) console.log(`Image proxy caching: ${ENABLE_MEDIA_CACHE.toString()}`);
if (ENABLE_MEDIA_PROXY) console.log(`Media proxy blacklist: ${MEDIA_PROXY_BLACKLIST}`);

if (ENABLE_MEDIA_CACHE) {
    if (await imageCache.init()) { 
        console.log(`Initialized image proxy cache at ${cacheDir}`) 
        
        // Run housekeeping at startup, if option set, instead of waiting for the first interval run
        if (MEDIA_CACHE_HOUSEKEEP_STARTUP) await imageCache.housekeep();

        const task_imageCache = setInterval(async () => {
            console.log("Housekeeping proxy cache...");
            await imageCache.housekeep();

        }, (MEDIA_CACHE_HOUSEKEEP_INTERVAL * 60 * 1000))
    }
    else {
        console.log(`Failed to initialize image proxy cache at ${cacheDir}.  Caching is disabled`)
    }
}




console.log("Starting Tesseract server");