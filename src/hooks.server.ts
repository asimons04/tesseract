// Router
import { router } from './server/router.js'

// Handlers
import { fediseer_router } from './lib/fediseer/server.js'
import { proxy_pictrs_upload } from './server/upload-image.js'

// Routes
const routes = [
    {
        route: '/cors/*',
        handler: proxy_pictrs_upload
    },

    {
        route: '/tesseract/api/fediseer*',
        handler: fediseer_router
    },
    
]

// Svelte Handler
export async function handle({event, resolve }) {
    
    // Send the defined server-side routes to their handlers 
    let routed =  await router(event, resolve, routes)
    if (routed) return routed



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

//// Update TTLs in cache once per second
import { cache } from '$lib/redisCache.js'

setInterval(() => {
    cache.tick();
}, 1000);
