interface FediseerResponse {
    id: number,
    domain: string,
    software: string,
    claimed: number,
    open_registrations:boolean,
    email_verify: boolean,
    approval_required: boolean,
    has_captcha: boolean,
    approvals: number | null,
    endorsements: number | null,
    guarantor: string | null,
    sysadmins: number | null,
    moderators: number | null,
    state: string | null,
    tags: Array<string> | null
}

interface Censures extends FediseerResponse{
    censure_reasons: Array<string> | null,
    censure_evidence: Array<string> | null,
    censure_count: number | null,
    
}

interface Endorsements extends FediseerResponse {
    endorsement_reasons: Array<string> | null,
}

interface Hesitations extends FediseerResponse {
    hesitation_reasons: Array<string> | null,
    hesitation_evidence: Array<string> | null,
    hesitation_count: number | null
}

// What gets returned to the client on calls to /lookup
interface FediseerInfo {
    site?: GetSiteResponse | undefined
    censures?: Array<Censures>,
    endorsements?: Array<Endorsements>
    hesitations?: Array<Hesitations>
    badges?: {
        guarantor?: string,
        endorsements?: string,
    }
    instance: string
    success:boolean
}

import type { GetSiteResponse, SiteView } from 'lemmy-js-client'
import { getClient } from '$lib/lemmy.js'


const fediseerAPI:string = 'https://fediseer.com/api/v1'

// Fetch the Fediseer info from the local API caching proxy 
export async function fediseerLookup(instance:string){
    try {
        const response  = await fetch(`/tesseract/api/fediseer/lookup?instance=${instance}`);
        if (response.ok) {
            try {
                return await response.json();
                
            }
            catch {
                return {} as FediseerInfo;
            }
        }
        else {
            return {} as FediseerInfo;
        }
    }
    catch {
        return {} as FediseerInfo;
    }
}

// Fetch the Fediseer info directly from the Fediseer API
export async function getFediseerInfo(instance:string) {
    let siteInfo: GetSiteResponse | undefined
    
    try {
        siteInfo = await getClient(instance, undefined).getSite({})
    } catch {
        siteInfo = undefined
    }

    
    const data:FediseerInfo = {
        censures:       await getCensures(instance),
        hesitations:    await getHesitations(instance),
        endorsements:   await getEndorsements(instance),
        site:           siteInfo,
        badges: {
            endorsements:   await getEndorsementsBadge(instance),
            guarantor:      await getGuarantorBadge(instance),
        },
        instance:       instance,
        success:        true
    }

    // Split single-element comma-delmited arrays into proper arrays
    if (data.endorsements && data.endorsements.length) {
        for (let i:number=0; i<data.endorsements.length; i++) {
            //@ts-ignore
            if (data.endorsements[i].endorsement_reasons?.length > 0) {
                //@ts-ignore
                data.endorsements[i].endorsement_reasons = data.endorsements[i].endorsement_reasons[0].split(',');
            }
        }
    }
    
    // Split single-element comma-delmited arrays into proper arrays
    if (data.censures && data.censures.length) {
        for (let i:number=0; i<data.censures.length; i++) {
            //@ts-ignore
            if (data.censures[i].censures_reasons?.length > 0) {
                //@ts-ignore
                data.censures[i].censures_reasons = data.censures[i].censures_reasons[0].split(',');
            }
        }
    }

    // Split single-element comma-delmited arrays into proper arrays
    if (data.hesitations && data.hesitations.length) {
        for (let i:number=0; i<data.hesitations.length; i++) {
            //@ts-ignore
            if (data.hesitations[i].hesitation_reasons?.length > 0) {
                //@ts-ignore
                data.hesitations[i].hesitation_reasons = data.hesitations[i].hesitation_reasons[0].split(',');
            }
        }
    }

    if (data.badges?.endorsements == '' || data.badges?.guarantor == '') {
        data.success = false;
    }

    return data;

}

export async function getEndorsementsBadge(instance:string) {
    try {
        const response = await fetch(`${fediseerAPI}/badges/endorsements/${instance}.svg`);
        if (response.ok) {
            return await response.text();
        }
        else {
            return ''
        }
    }
    catch {
        return ''
    }
}

export async function getGuarantorBadge(instance:string) {
    try {
        const response = await fetch(`${fediseerAPI}/badges/guarantees/${instance}.svg`);
        if (response.ok) {
            return await response.text();
        }
        else {
            return ''
        }
    }
    catch {
        return ''
    }
}


export async function getCensures(instance:string) {
    try {
        const response  = await fetch(`${fediseerAPI}/censures/${instance}`);
        if (response.ok) {
            try {
                const instances = await response.json();
                return instances.instances as Array<Censures>
            }
            catch {
                return [] as Array<Censures>;
            }
        }
        else {
            return [] as Array<Censures>;
        }
    }
    catch {
        return [] as Array<Censures>;
    }
}

export async function getHesitations(instance:string) {
    try {
        const response  = await fetch(`${fediseerAPI}/hesitations/${instance}`);
        if (response.ok) {
            try {
                const instances = await response.json();
                return instances.instances as Array<Hesitations>
            }
            catch {
                return [] as Array<Hesitations>;
            }
        }
        else {
            return [] as Array<Hesitations>;
        }
    } 
    catch {
        return [] as Array<Hesitations>;
    }
}

export async function getEndorsements(instance:string) {
    try {
        const response  = await fetch(`${fediseerAPI}/endorsements/${instance}`);
        
        if (response.ok) {
            try {
                const instances = await response.json();
                return instances.instances as Array<Endorsements>
            }
            catch {
                return [] as Array<Endorsements>;
            }
        }
        else {
            return [] as Array<Endorsements>;
        }
    }
    catch (err) {
        console.log(err)
        return [] as Array<Endorsements>;
    }
}