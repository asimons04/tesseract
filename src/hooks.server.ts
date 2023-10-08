// Router
import { router } from './server/router.js'

// Handlers
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


// Task Scheduler

//// Update TTLs in memory cache once per second
import { cache } from '$lib/cache/memory.js'

setInterval(() => {
    cache.tick();
}, 1000);
