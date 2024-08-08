import type { MarkdownOptions } from '@magidoc/plugin-svelte-marked'

import { get } from 'svelte/store'
import { userSettings } from '$lib/settings'

const $userSettings = get(userSettings)

export interface CustomMarkdownOptions extends MarkdownOptions {
    custom: {
        noPreview?: boolean
    }
}


export function filterAnnoyingCCLicenseOnComments(source:string) {
    return $userSettings.uiState.filterAnnoyingCCLicense
        ? source.replaceAll(/\[.*]\(https:\/\/creativecommons.org\/licenses\/by-nc-sa\/.*\)/gi, '')
        : source
}


export function hashtagsToMDLinks(source:string) {
    if (!$userSettings.linkifyHashtags) return source
    
    const hashtagRE = /(?<!\[.*|http.*|```[\s\S]|`)#[A-Z]\w+(?![\S]+`|[\s\S]+```)/gi
    let hashtags = source.matchAll(hashtagRE)
    
    for (let tag of hashtags) {
        let replacementText = `[${tag[0].trim()}](/search?q=${encodeURIComponent(tag[0].trim())})`
        source = source.replace(tag[0], replacementText)
    }
    return source
}

export function findUserCommunityLinks(source: string) {
    // Pre-process the ! and @ community and person (respective) links to markdown links
    // The 'photonify' processor in the Links renderer will handle other formats and further process these

    // Find @user@instance.xyz and turn into localized links
    const userRE = /(?<!\w)@((?<username>[a-zA-Z0-9._-]+)@(?<instance>[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+))/gi
    let users = source.matchAll(userRE)
    for (let user of users) {
        if (user.groups?.username && user.groups?.instance) {
            let replacementText = `[@${user.groups.username}@${user.groups.instance}](/u/${user.groups.username}@${user.groups.instance})`
            source = source.replaceAll(user[0], replacementText)
        }
    }

    // Find '!community@instance.xyz'and turn into localized links
    const communityRE = /!((?<community>[a-zA-Z0-9._-]+)@(?<instance>[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+))/gi
    let communities = source.matchAll(communityRE)
    for (let community of communities) {
        if (community.groups?.community && community.groups?.instance) {
            let replacementText = `[!${community.groups.community}@${community.groups.instance}](/c/${community.groups.community}@${community.groups.instance})`
            source = source.replaceAll(community[0], replacementText)
        }
    }


    return source
}

const regexes = {
    post: /^https:\/\/([a-zA-Z0-9\.\-]+)\/post\/(\d+)$/,
    comment: /^https:\/\/([a-zA-Z0-9\.\-]+)\/comment\/(\d+)$/,
    user: /^https:\/\/([a-zA-Z0-9\.\-]+)\/u\/(.*)$/,
    community: /^https:\/\/([a-zA-Z0-9\.\-]+)\/c\/(.*)$/
}

/**
 * Convert links to photon links
 * Kept name to honor heritage (and I've only patched this up rather than re-write it)
 */
export const photonify = (link: string) => {
    if (regexes.post.test(link)) {
        const match = link.match(regexes.post)
        if (!match) return
        return `/post/${match?.[1]}/${match?.[2]}`
    }
  
    if (regexes.comment.test(link)) {
        const match = link.match(regexes.comment)
        if (!match) return
        return `/comment/${match?.[1]}/${match?.[2]}`
    }
  
    if (regexes.user.test(link)) {
        const match = link.match(regexes.user)
        if (!match) return
        return `/u/${match?.[2]}@${match?.[1]}`
    }

    if (regexes.community.test(link)) {
        const match = link.match(regexes.community)
        if (!match) return
        return `/c/${match?.[2]}@${match?.[1]}`
    }

}
