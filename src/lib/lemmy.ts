import { type GetSiteResponse, LemmyHttp } from 'lemmy-js-client'
import { get, writable } from 'svelte/store'
import { profile, profileData } from '$lib/auth.js'
import { error } from '@sveltejs/kit'
import { LINKED_INSTANCE_URL, instance } from '$lib/instance.js'

export interface BlockInstanceResponse {
    blocked: boolean
}

/** Returns the current instance */
export const getInstance = () => get(instance)

export const site = writable<GetSiteResponse | undefined>(undefined)

/** Returns a LemmyHttp API client
 * @param instanceURL is the instance domain it should work against (default is current instance)
 * @param jwt is the auth token to be used (defaults to profile, but need to supply it in some cases to bootstrap profile
*/
export function getClient(instanceURL?: string, jwt?:string): LemmyHttp {
    // Use current instance is not otherwise defiend
    if (!instanceURL)   instanceURL = get(instance)
    jwt = jwt ?? get(profile)?.jwt

    // Add the authorization header if JWT is supplied or if present in profile and instance is the same as the one the profile belongs to
    const headers = {} as { [key: string]: string; }
    if (jwt && instanceURL == get(instance)) headers['Authorization'] = `Bearer ${jwt}`

    headers['User-Agent'] = `Tesseract/v${__VERSION__} (${__CODENAME__})`

    // Override Lemmy's stupid server-side cache on the only fscking endpoint that will return the local_user profile
    const cachelessFetch = async function (input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response> {
        if (init) init.cache = 'no-store'
        else init = { cache: 'no-store'}
        
        const res = await fetch(input, init)
        if (!res.ok) throw error(res.status, await res.text())
        return res
    }

    return new LemmyHttp(`https://${instanceURL}`, 
        {
            fetchFunction: cachelessFetch,
            headers: headers
        }
    )
}



/** Validates an instance by calling getSite() and optionallly sets the current site store to its GetSiteResponse
 * @param instance The instance domain to check
 * @param setSite Default false to discard the results and true to set the current site store details to the results of that
*/
export async function validateInstance(instance: string, setSite:boolean=false): Promise<boolean> {
    if (!instance) return false
    try {
        let siteData = await getClient(instance).getSite()
        if (setSite) site.set(siteData)
        return true
    } catch (err) {
        return false
    }
}

export async function hideCommunity(communityID:number, hidden:boolean, reason:string = '') {
    if (!communityID || !get(profile)?.jwt) return

    try {
        const body = {
            community_id: communityID,
            hidden: hidden,
            reason: reason
        }
        const response = await fetch(`https://${get(instance)}/api/v3/community/hide`,
            {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${get(profile)?.jwt}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            }
        )

        const json = await response.json();
        
        if (response.status != 200) {
            throw new Error(
                `${
                    (await response.text().catch((_) => undefined)) ??
                    'Failed to hide community'
                }: ${response.status}: ${response.statusText}`
            )
        }

        return
    } 
    catch {
        throw new Error(
            `API call failed`
        )
    }

    


}

// Deprecated: 5/16/2024
/*
export async function uploadImage(image: File | null | undefined): Promise<string | undefined> {
    if (!image || !get(profile)?.jwt) return
    
    const formData = new FormData()
    formData.append('images[]', image)

    const response = await fetch(
        `${window.location.origin}/cors/${getInstance()}/pictrs/image?`,
        {
            method: 'POST',
            body: formData,
            headers: { 'Authorization': `Bearer ${get(profile)?.jwt}`}
        }
    )

    const json = await response.json()

    if (json.msg == 'ok') {
        return `https://${get(profile)?.instance}/pictrs/image/${
            json.files?.[0]?.file
        }`
    }

    throw new Error(
        `${
            (await response.text().catch((_) => undefined)) ??
            'Failed to upload image'
        }: ${response.status}: ${response.statusText}`
    )
}
*/


export let sortOptions:string[] = [
    'Active',
    'Scaled',
    'Hot',
    'New',
    'Old',
    'TopAll',
    'TopNineMonths',
    'TopSixMonths',
    'TopThreeMonths',
    'TopMonth',
    'TopWeek',
    'TopDay',
    'TopTwelveHour',
    'TopSixHour',
    'TopHour',
    'MostComments',
    'NewComments',
];

export let sortOptionNames:string[] = [
    'Active',
    'Scaled',
    'Hot',
    'New',
    'Old',
    'Top All',
//  'Top 9 Months',
//  'Top 6 Months',
    'Top 3 Months',
    'Top Month',
    'Top Week',
    'Top Day',
    'Top 12 Hour',
    'Top 6 Hour',
    'Top Hour',
    'Most Comments',
    'New Comments',
];


export function parseAPIError(err:any) {
    let errMsg:string
    try { 
        let parsed = JSON.parse(err.body.message)
        errMsg = parsed.error
    }
    catch {
        errMsg = ''
    }
    return errMsg
}

// Do an initial fetch of the site so the logo and site name gets set properly
// DummyJWT is so the auth module doesn't try to access the profile before it's initialized

getClient(get(instance), 'dummyJWT').getSite().then((getSiteResponse) => {
    site.set(getSiteResponse)
})