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

interface FediseerInfo {
    site?: SiteView
    censures?: Array<Censures>,
    endorsements?: Array<Endorsements>
    hesitations?: Array<Hesitations>
    instance: string
}


import { getClient } from '$lib/lemmy.js'
import type { SiteView } from 'lemmy-js-client'


const fediseerAPI:string = 'https://fediseer.com/api/v1'

export async function getFediseerInfo(instance:string) {
    let siteInfo
    
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
        instance:       instance
    }

    if (data.endorsements) {
        for (let i:number=0; i<data.endorsements.length; i++) {
            //@ts-ignore
            if (data.endorsements[i].endorsement_reasons?.length > 0) {
                //@ts-ignore
                data.endorsements[i].endorsement_reasons = data.endorsements[i].endorsement_reasons[0].split(',');
            }
        }
    }

    if (data.censures) {
        for (let i:number=0; i<data.censures.length; i++) {
            //@ts-ignore
            if (data.censures[i].censures_reasons?.length > 0) {
                //@ts-ignore
                data.censures[i].censures_reasons = data.censures[i].censures_reasons[0].split(',');
            }
        }
    }

    if (data.hesitations) {
        for (let i:number=0; i<data.hesitations.length; i++) {
            //@ts-ignore
            if (data.hesitations[i].hesitation_reasons?.length > 0) {
                //@ts-ignore
                data.hesitations[i].hesitation_reasons = data.hesitations[i].hesitation_reasons[0].split(',');
            }
        }
    }

    return data;

}

export async function getCensures(instance:string) {
    const response  = await fetch(`${fediseerAPI}/censures/${instance}`);
    if (response.status == 200) {
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

export async function getHesitations(instance:string) {
    const response  = await fetch(`${fediseerAPI}/hesitations/${instance}`);
    if (response.status == 200) {
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

export async function getEndorsements(instance:string) {
    const response  = await fetch(`${fediseerAPI}/endorsements/${instance}`);
    if (response.status == 200) {
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