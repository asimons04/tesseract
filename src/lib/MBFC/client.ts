import type { MBFCReport } from './types'

export async function MBFC_lookup(domain:string):Promise<MBFCReport|undefined> {
    try {
        domain = domain
            .replace('www.', '')
            .replace('amp.', '')
            .replace('edition.', '')

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