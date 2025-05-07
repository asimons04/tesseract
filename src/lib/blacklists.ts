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
    'www.libsoftiktok.com',
    'libsoftiktok.com',
    'tiblur.com',
    'www.tiblur.com',
    'todaycnn.com',
    'www.todaycnn.com',
    ...BLACKLIST_CONFIG.FAKE_NEWS_BLACKLIST
]

// Disallow link shorteners
const LINK_SHORTENERS = [
    'apple.news',
    'archive.is',
    'archive.ph',
    'bit.ly',
    'bl.ink',
    'blobstreaming.org',
    'g.co',
    'ghostarchive.org',
    'goo.gl',
    'm.me',
    'ow.ly',
    'rb.gy',
    'search.app',
    'short.cm',
    'shorturl.at',
    't.co',
    'tinyurl.com',
    'web.archive.org',
    'zpr.io',
    ...BLACKLIST_CONFIG.LINK_SHORTENER_BLACKLIST
]

const FACEBOOK = [
    'facebook.com',
    'www.facebook.com',
    'm.me'
]

const REDDIT = [
    'reddit.com',
    'old.reddit.com',
    'new.reddit.com',
    'out.reddit.com'
]

const TWITTER = [
    'x.com',
    't.co',
    'twitter.com',
    'www.twitter.com',
    'www.x.com',

]

// Very non-comprehensive list of domains that host disposable/temporary/throwaway email aliases. Basically just the low-hanging fruit to aid in decision making.
export const THROWAWAY_EMAIL_DOMAINS = [
    'addy.io',
    'asciibinder.net',
    'azuretechtalk.net',
    'barplane.com',
    'bltiwd.com',
    'chansd.com',
    'cmhvzylmfc.com',
    'cyclelove.cc',
    'daouse.com',
    'dreamclarify.org',
    'dygovil.com',
    'guerrillamail.biz',
    'guerrillamail.com',
    'guerrillamail.de',
    'guerrillamail.info',
    'guerrillamail.net',
    'guerrillamail.org',
    'guerrillamailblock.com',
    'grr.la',
    'hthlm.com',
    'ibolinva.com',
    'illubd.com',
    'imbetain.com',
    'javbing.com',
    'jkotypc.com',
    'jxpomup.com',
    'knmcadibav.com',
    'logsmarter.net',
    'mkzaso.com',
    'mozmail.com',
    'mrotzis.com',
    'nbmbb.com',
    'nutrv.com',
    'osxofulk.com',
    'pokemail.net',
    'polkaroad.net',
    'poplk.com',
    'proton.me',
    'qacmjeq.com',
    'qejjyl.com',
    'qzueos.com',
    'sharklasers.com',
    'smykwb.com',
    'spam4.me',
    'teleg.eu',
    'thetechnext.net',
    'tidissajiiu.com',
    'tmprator.win',
    'vafyxh.com',
    'vuket.org',
    'vwhins.com',
    'wywnxa.com',
    'wyoxafp.com',
    'xkxkud.com',
    'ytnhy.com',
    'zudpck.com',
    'zvvzuv.com'
]
/** Returns true if the provided email address belongs to a known throwaway email provider
 * @param email 
*/
export function isThrowawayEmail(email?:string): boolean {
    if (!email) return false
    try {
        const domain = email.split('@')[1]
        if (!domain) return false
    
        // Lazy way to see if the email is a subdomain under mozmail
        if (email.includes('.mozmail.com')) return true
    
        return THROWAWAY_EMAIL_DOMAINS.includes(domain)
    }
    // Err on the side of caution and return false (non-throwaway) on error
    catch (err) {
        return false
    }
}


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