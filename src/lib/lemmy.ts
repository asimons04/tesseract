import { type GetSiteResponse, LemmyHttp } from 'lemmy-js-client'
import { get, writable } from 'svelte/store'
import { profile, profileData } from '$lib/auth.js'
import { error } from '@sveltejs/kit'
import { LINKED_INSTANCE_URL, instance } from '$lib/instance.js'

interface CustomFetchFunction {
    ( input: RequestInfo | URL, init?: RequestInit | undefined):  Promise<Response>
}


async function customFetch(func: CustomFetchFunction, input: RequestInfo | URL, init?: RequestInit | undefined): Promise<Response> {
    const res = await func(input, init)
    if (!res.ok) throw error(res.status, await res.text())
    return res
}

export function getClient(instanceURL?: string, func?: CustomFetchFunction ,jwt?:string): LemmyHttp {
    if (!instanceURL)   instanceURL = get(instance)
    
    try {
        if (!jwt) jwt = get(profile)?.jwt 
    } catch {
        jwt = ''
    }

    return new LemmyHttp(`https://${instanceURL}`, 
        {
            fetchFunction: func
                ? (input: RequestInfo | URL, init: RequestInit | undefined) => customFetch(func, input, init)
                : undefined,
            headers: { 'Authorization': `Bearer ${jwt}`}
        }
    )
}

export const getInstance = () => get(instance)

export const site = writable<GetSiteResponse | undefined>(undefined)

export async function validateInstance(instance: string, setSite:boolean=false): Promise<boolean> {
    if (instance == '') return false
    try {
        let siteData = await getClient(instance).getSite({})
        // Optionally 
        if (setSite) {
            site.set(siteData);
        }
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
            auth: get(profile)?.jwt,
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


export let sortOptions:string[] = [
    'Active',
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
    'Hot',
    'New',
    'Old',
    'Top All',
    'Top 9 Months',
    'Top 6 Months',
    'Top 3 Months',
    'Top Month',
    'Top Week',
    'Top Day',
    'Top 12 Hours',
    'Top 6 Hours',
    'Top Hour',
    'Most Comments',
    'New Comments',
];


if (LINKED_INSTANCE_URL) {
    getClient(LINKED_INSTANCE_URL)
      .getSite({})
      .then((s) => site.set(s))
}
else {
    getClient(getInstance())
    .getSite({})
    .then((s) => site.set(s))
}