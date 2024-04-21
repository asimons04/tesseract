import { lookup as MBFCLookup } from './MBFC/client'

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
    'tbsnews.net',
    'www.infoterkiniviral.com',
    'www.kaggle.com',
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
    'zpr.io'
]

// Internal blacklist
const URL_BLACKLIST = [] as string[]

// To-do:  Read in list of domains from env var defined by admin
const UDF_BLACKLIST = [] as string[]

export function validateURL(testURL?:string): URLValidateResponse {
    if (!testURL) return { allowed: false, reason: 'No URL Supplied'}
    try {
        new URL(testURL)
        return { allowed: true, reason: 'Allowed' }
    }
    catch {
        return { allowed: false, reason: 'Invalid or malformed URL' }
    }

    /*  
        Commenting out for now as I forgot I left this in here.  This is incomplete and is meant to read config options from the admin
        to set instance-specific blacklists and different block options.  As-is, it just applies the stock blacklists 100% of the time
        which is not the intended behavior.

    try {
        const url = new URL(testURL)
        if (URL_BLACKLIST.includes(url.hostname))   return {allowed: false, reason: 'URL is on the Tesseract blacklist'}
        if (UDF_BLACKLIST.includes(url.hostname))   return {allowed: false, reason: 'URL is blacklisted by the instance administrator.'}
        if (LINK_SHORTENERS.includes(url.hostname)) return {allowed: false, reason: 'Link shorteners are not allowed and are stupid when people can click on the link. Use the actual link to the resource.'}
        if (FAKE_NEWS.includes(url.hostname))       return {allowed: false, reason: 'You are attempting to link to a non-credible news source.'}
        
        // Reject URLs if MBFC rates them as non-credible
        const mbfc = MBFCLookup(testURL)
        if (mbfc) {
            if (mbfc.bias == 'fake-news' || mbfc.credibility == 'Low Credibility') 
                return {
                    allowed: false, 
                    reason: `You are attempting to link to a non-credible news source. See: ${mbfc.url}`
                }
        }
        return { allowed: true, reason: 'Allowed' }
    }
    catch {
        return {allowed: false, reason: 'Invalid URL supplied'}
    }
    */
}