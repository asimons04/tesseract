import { profile } from '$lib/auth.js'
import { getClient } from '$lib/lemmy.js'
import { get } from 'svelte/store'

export async function load({ data, fetch, url }) {
    if (!get(profile)) return

    const { jwt } = get(profile)!
    if (!jwt) return

    const page = Number(url.searchParams.get('page')) || 1
    const unreadOnly = (url.searchParams.get('unreadOnly') || 'true') == 'true'
    const limit = 50
    
    const res = await getClient().listRegistrationApplications({
        page: page,
        limit: limit,
        unread_only: unreadOnly,
    })

    return {
        unreadOnly: unreadOnly,
        page: page,
        applications: res.registration_applications,
        limit: limit
    }
}
