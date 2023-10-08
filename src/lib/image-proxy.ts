import { get } from 'svelte/store'
import { getInstance } from '$lib/lemmy.js'
import { userSettings, ENABLE_MEDIA_PROXY } from '$lib/settings.js'

// Domains which shouldn't be proxied for whatever reason (usually some fuckery on their end to restrict embedding)
let blacklist = [
    'media.giphy.com',
]

// Accepts an image URL as input and determines whether to convert it into a proxied image URL or keep the original
export function imageProxyURL(url:string, size:number|undefined = undefined, format:string|undefined = undefined): string|boolean {
    
    if (!url) return false
    
    // Return original URL if one of the following conditions are met:
    if (!ENABLE_MEDIA_PROXY) return url;                        // Media proxying is globally disabled
    if (!get(userSettings)?.proxyMedia.enabled) return url;     // User preference for media proxing is disabled
    
    // Don't proxy domains in the blacklist
    for (let i:number=0; i< blacklist.length; i++) {
        if (url.includes(blacklist[i])) return url;
    }

    //if (!url.includes('/pictrs/image')) return url;             // The media URL is not to another /pict-rs 
    if (url.includes(getInstance())) return url;                // Media is hosted on home instance

    try {
        let image = new URL(url);
        
        let instance = image.host;
        let params = image.searchParams;
        let path = image.pathname;

        if (get(userSettings)?.proxyMedia.fallback) {
            params.append('fallback', 'true');
        }

        if (size) {
            params.append('thumbnail', size.toString());
        }

        if (format) {
            params.append('format', format)
        }
        
        let origin = new URL(window.location.href).origin;
        let imagePath = `${instance}${path}`;
        return `${origin}/image_proxy/${imagePath}?${params}`
    }
    catch {
        return url;
    }
}