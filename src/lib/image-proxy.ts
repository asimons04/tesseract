import { get } from 'svelte/store'
import { getInstance } from '$lib/lemmy.js'
import { 
    userSettings, 
    ENABLE_MEDIA_PROXY,
    ENABLE_MEDIA_PROXY_LOCAL,
    MEDIA_PROXY_BLACKLIST,
    MEDIA_PROXY_LEMMY_ONLY
} from '$lib/settings.js'

// Domains which shouldn't be proxied for whatever reason (usually some fuckery on their end to restrict embedding)
let blacklist = MEDIA_PROXY_BLACKLIST.split(',')

// Accepts an image URL as input and determines whether to convert it into a proxied image URL or keep the original
export function imageProxyURL(url:string, size:number|undefined = undefined, format:string|undefined = undefined): string|undefined {
    
    if (!url) return undefined

    // Return original URL if one of the following conditions are met:
    
    // Media proxying is globally disabled
    if (!ENABLE_MEDIA_PROXY) return url;                        
    
    // User preference for media proxing is disabled
    if (!get(userSettings)?.proxyMedia.enabled) return url;     

    // Image url matches an entry in the blacklist
    for (let i:number=0; i< blacklist.length; i++) {
        if ( url.includes(blacklist[i].trim()) ) return url;
    }

    // Image is not on another Lemmy instance (identified by /pictrs/image in the url)
    if (MEDIA_PROXY_LEMMY_ONLY && !url.includes('/pictrs/image')) return url;             
    
    // Local media/home instance image proxying is disabled
    if ( !ENABLE_MEDIA_PROXY_LOCAL && url.includes(getInstance())) return url;

    // Build the image proxy URL to return
    try {
        let image = new URL(url);
        
        let host = image.host;
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
        let imagePath = `${host}${path}`;
        
        return `${origin}/image_proxy/${imagePath}?${params}`
    }
    
    // If building the URL fails, fallback to returning the original
    catch {
        return url;
    }
}