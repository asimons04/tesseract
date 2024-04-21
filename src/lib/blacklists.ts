import { lookup as MBFCLookup } from './MBFC/client'
import { BLACKLIST_CONFIG } from '$lib/settings'


export interface URLValidateResponse {
    allowed: boolean,
    reason: string
}

// Fake news sites that MBFC doesn't have on file
const FAKE_NEWS = [
    'cctv.com',
    'infoterkiniviral.com',
    'kaggle.com',
    'news.cctv.com',
    'tass.com',
    'www.infoterkiniviral.com',
    'www.kaggle.com',
    ...BLACKLIST_CONFIG.FAKE_NEWS_BLACKLIST
]

// Disallow link shorteners
const LINK_SHORTENERS = [
    'apple.news',
    'archive.is',
    'archive.ph',
    'bit.ly',
    'bl.ink',
    'ghostarchive.org',
    'goo.gl',
    'ow.ly',
    'rb.gy',
    'short.cm',
    'tinyurl.com',
    'web.archive.org',
    'zpr.io',
    ...BLACKLIST_CONFIG.LINK_SHORTENER_BLACKLIST
]


export function validateURL(testURL?:string): URLValidateResponse {
    if (!testURL) return { allowed: false, reason: 'No URL Supplied'}

    try {
        const url = new URL(testURL)
               
        if (BLACKLIST_CONFIG.DOMAIN_BLACKLIST.includes(url.hostname))   
            return {allowed: false, reason: `${url.hostname} is blacklisted by the instance administrator.`}
        
        
        if (BLACKLIST_CONFIG.REJECT_LINK_SHORTENERS && !(BLACKLIST_CONFIG.LINK_SHORTENER_ALLOWLIST.includes(url.hostname)) && LINK_SHORTENERS.includes(url.hostname) ) 
            return {allowed: false, reason: 'Link shorteners are not allowed and are stupid when people can click on the link. Use the actual link to the resource.'}
        
        if (BLACKLIST_CONFIG.REJECT_FAKE_NEWS && FAKE_NEWS.includes(url.hostname)) 
            return {allowed: false, reason: 'You are attempting to link to a non-credible news source.'}
        
        // Reject URLs if MBFC rates them as non-credible
        if (BLACKLIST_CONFIG.REJECT_LOW_CRED_MBFC) {
            const mbfc = MBFCLookup(testURL)
            if (mbfc && (mbfc.bias == 'fake-news' || mbfc.credibility == 'Low Credibility')) {
                return {
                    allowed: false, 
                    reason: `Whoa there!  You are attempting to link to a known non-credible news source. Consider posting that story from somewhere with more credibility.  See: ${mbfc.url}`
                }
            }
        }
        // If URL hasn't been denied yet, allow it to pass
        return { allowed: true, reason: 'Allowed' }
    }
    catch {
        return {allowed: false, reason: 'Invalid URL supplied'}
    }
    
}