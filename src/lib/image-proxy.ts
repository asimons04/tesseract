import { get } from 'svelte/store'
import { getInstance } from '$lib/lemmy.js'
import { page } from '$app/stores'
import { unproxyImage } from '$lib/components/lemmy/post/helpers'
import { 
    userSettings, 
    ENABLE_MEDIA_PROXY,
    ENABLE_MEDIA_PROXY_LOCAL,
    MEDIA_PROXY_BLACKLIST,
    MEDIA_PROXY_LEMMY_ONLY
} from '$lib/settings.js'

// Accepts an image URL as input and determines whether to convert it into a proxied image URL or keep the original
export function imageProxyURL(url:string, size?:number, format?:string): string {
    const $page = get(page)
    const $userSettings = get(userSettings)
    const origin = new URL($page.url.href).origin

    if (!url) return url

    const applySizeFormat = function (image_url:string, size?:number, format?: string): string {
        
        // Only add the thumbnail and format parameters to pictrs URLs (to avoid caching multiple version of a GIF from Giphy, etc where those aren't respected)
        try {
            if (image_url.includes('/pictrs/image') && !(image_url.includes('.gif')) ) {
                const u = new URL(image_url)
                if (size)   u.searchParams.set('thumbnail', size.toString())
                if (format && !image_url.endsWith(format)) u.searchParams.set('format', format)
                return u.href
            }
            else return image_url
        }
        catch {
            return image_url
        }
    }


    // Return original URL if media proxying is globally disabled
    if (!ENABLE_MEDIA_PROXY) return applySizeFormat(url, size, format)
    
    // Return original URL if user preference for media proxing is disabled
    if (!$userSettings?.proxyMedia.enabled) return applySizeFormat(url, size, format);     

    // Return original URL if image url matches an entry in the blacklist
    if (MEDIA_PROXY_BLACKLIST.length > 0) {
        for (let i:number=0; i< MEDIA_PROXY_BLACKLIST.length; i++) {
            if ( url.includes(MEDIA_PROXY_BLACKLIST[i]) ) return applySizeFormat(url, size, format);
        }
    }

    // Return original URL if image is not on another Lemmy instance (identified by /pictrs/image in the url) and admin configured to only proxy Lemmy images
    if (MEDIA_PROXY_LEMMY_ONLY && !url.includes('/pictrs/image')) return url;             
    
    // Return original URL if local media/home instance image proxying is disabled
    if ( !ENABLE_MEDIA_PROXY_LOCAL && url.includes(getInstance())) return applySizeFormat(url, size, format);

    // Don't proxy local blobs
    if (url.startsWith('blob:')) return url;

    // Don't proxy inline data images
    if (url.startsWith('data:')) return url;

    // Don't proxy images that are already going through the local proxy
    if (url.includes(`${origin}/image_proxy/`)) return url;


    // Build the image proxy URL to return
    try {
        // Before building a proxied URL, un-proxy it from Lemmy's fucking stupid proxy URL that's federated for stupid, stupid, STUPID reasons.
        url = unproxyImage(url)
        url = applySizeFormat(url, size, format)

        let image = new URL(url);
        
        let host = image.host;
        let params = image.searchParams;
        let path = image.pathname;

        if ($userSettings?.proxyMedia.fallback) {
            params.append('fallback', 'true');
        }


        return `${origin}/image_proxy/${host}${path}?${params}`
    }
    
    // If building the URL fails, fallback to returning the original
    catch {
        return url;
    }
}