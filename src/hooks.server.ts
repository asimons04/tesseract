// Router
import { router } from './server/router.js'

// Route Handlers
import { fediseer_router }      from './lib/fediseer/server.js'
import { image_proxy }          from './server/image-proxy.js'
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
    
]

// Svelte Handler
export async function handle({event, resolve }) {
    
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
// Housekeeps every 5 minutes
import { cache as imageCache } from './server/image-proxy'

if (await imageCache.init()) { 
    console.log("Initialized image proxy cache") 
    
    const task_imageCache = setInterval(async () => {
        console.log("Housekeeping image cache...");
        await imageCache.housekeep();
    }, (5 * 60 * 1000))
}
else {
    console.log("Failed to initialize image proxy cache.  Caching is disabled")
}