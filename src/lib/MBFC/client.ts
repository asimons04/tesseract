import type { MBFCReport } from './types'

export async function MBFC_lookup(domain:string):Promise<MBFCReport|undefined> {
    try {
        // Normalize domains to remove any "www', "amp", and other prefixes that trip up detection.  Also replace some domains with their main aliases
        domain = domain
            .replace('www.', '')
            .replace('amp.', '')
            .replace('edition.', '')
            .replace(/.*\.businessinsider\.com/, 'businessinsider.com')
            .replace(/.*\.medium\.com/, 'medium.com')
            .replace(/.*\.yahoo\.com/, 'news.yahoo.com')
            .replace(/.*\.apnews\.com/, 'apnews.com')
            .replace(/.*\.elpais\.com/, 'elpais.com')
            .replace('bbc.co.uk', 'bbc.com')
            .replace('news.antiwar.com', 'antiwar.com')
            .replace('mronline.org', 'monthlyreview.org')
            .replace('bbc.in', 'bbc.com')



        let result = await fetch(`/tesseract/api/mbfc/lookup?domain=${domain}`);

        if (result.ok) {
            return await result.json() as MBFCReport;
        }

        return undefined

    }
    catch {
        return undefined
    }

}