import type { MarkdownOptions } from '@magidoc/plugin-svelte-marked'

import { get } from 'svelte/store'
import { userSettings } from '$lib/settings'

const $userSettings = get(userSettings)

export interface CustomMarkdownOptions extends MarkdownOptions {
    custom: {
        noPreview?: boolean
        noImages?: boolean
    }
}


export function filterAnnoyingCCLicenseOnComments(source:string) {
    return source.replaceAll(/\[.*]\(https:\/\/creativecommons.org\/licenses\/by-nc-sa\/.*\)/gi, '')
}


export function hashtagsToMDLinks(source:string) {
    if (!$userSettings.linkifyHashtags) return source
    
    //const hashtagRE = /(?<!\[.*|http.*|`.*|[A-Za-zÀ-ÿ!\?\$])#[A-Za-zÀ-ÿ!\?\$]+(?!`)/gi
    const hashtagRE = /^#[A-Za-zÀ-ÿ!\?\$]+$/gi
    let hashtags = source.matchAll(hashtagRE)
    
    for (let tag of hashtags) {
        let replacementText = `[${tag[0].trim()}](/search?q=${encodeURIComponent(tag[0].trim())})`
        let find = new RegExp(tag[0] + '\\b')
        source = source.replace(find, replacementText)
    }
    return source
}


export function findLemmyverseLinks(source:string) {
    // Convert Lemmyverse links to local links
    
    // Lemmyverse Post Links
    const lvPostRE = /https:\/\/lemmyverse.link\/(?<instance>[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)\/post\/(?<post_id>[0-9]+)/i
    let post = source.match(lvPostRE)
    if (post?.groups?.instance && post?.groups?.post_id) {
        let replacementText = `https://${post.groups.instance}/post/${post.groups.post_id}`
        let find = new RegExp(post[0] + '(?!.*`|.*\])', "gi")
        source = source.replace(find, replacementText)
        return source
    }
    
    // Lemmyverse Comment Links
    const lvCommentRE = /https:\/\/lemmyverse.link\/(?<instance>[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)\/comment\/(?<comment_id>[0-9]+)/i
    let comment = source.match(lvCommentRE)
    if (comment?.groups?.instance && comment?.groups?.comment_id) {
        let replacementText = `https://${comment.groups.instance}/comment/${comment.groups.comment_id}`
        let find = new RegExp(comment[0] + '(?!.*`|.*\])', "gi")
        source = source.replace(find, replacementText)
        return source
    }

    // Lemmyverse User Links
    const lvUserRE = /https:\/\/lemmyverse.link\/u\/((?<username>[a-zA-Z0-9._-]+)@(?<instance>[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+))/i
    let user = source.match(lvUserRE)
    if (user?.groups?.instance && user?.groups?.username) {
        let replacementText = `https://${user.groups.instance}/u/${user.groups.username}`
        let find = RegExp(user[0] + '(?!.*`|.*\])', "gi")
        source = source.replace(find, replacementText)
        return source
    }

    // Lemmyverse Community Links
    const lvCommunityRE = /https:\/\/lemmyverse.link\/c\/((?<community>[a-zA-Z0-9._-]+)@(?<instance>[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+))/i
    let community = source.match(lvCommunityRE)
    if (community?.groups?.instance && community?.groups?.community) {
        let replacementText = `https://${community.groups.instance}/c/${community.groups.community}`
        let find = RegExp(community[0] + '(?!.*`|.*\])', "gi")
        source = source.replace(find, replacementText)
    }

    return source
}

export function findUniversalPostLinks(source:string) {
    // Pre-process the #12345@instance.xyz universal post links into markdown links
    // The "photonify" processor in the Linkx renderer will handle other formats and process those

    const postRE = /^#(?<postID>[0-9]+)@(?<instance>[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi
    let posts = source.matchAll(postRE)

    for (let post of posts) {
        if (post.groups?.postID && post.groups?.instance) {
            let replacementText = `[${post.groups.postID}@${post.groups.instance}](/post/${post.groups.instance}/${post.groups.postID})`
            let find = new RegExp(post[0] + '(?!.*`|.*\])', "gi")
            source = source.replaceAll(find, replacementText)
        }
    }

    return source
}

export function findUniversalCommentLinks(source:string) {
    // Pre-process the #12345@instance.xyz universal post links into markdown links
    // The "photonify" processor in the Linkx renderer will handle other formats and process those

    const postRE = /^~(?<commentID>[0-9]+)@(?<instance>[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi
    let comments = source.matchAll(postRE)

    for (let comment of comments) {
        if (comment.groups?.commentID && comment.groups?.instance) {
            let replacementText = `[${comment.groups.commentID}@${comment.groups.instance}](/comment/${comment.groups.instance}/${comment.groups.commentID})`
            let find = new RegExp(comment[0] + '(?!.*`|.*\])', "gi")
            source = source.replaceAll(find, replacementText)
        }
    }

    return source
}

export function findUserCommunityLinks(source: string) {
    // Pre-process the ! and @ community and person (respective) links to markdown links
    // The 'photonify' processor in the Links renderer will handle other formats and further process these

    // Find @user@instance.xyz and turn into localized links
    const userRE = /(?<!\w|`|\/|\[|\()@((?<username>[a-zA-Z0-9._-]+)@(?<instance>[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+))(?!.*`|.*\]|\))/gi
    let users = source.matchAll(userRE)

    // Find '!community@instance.xyz'and turn into localized links
    const communityRE = /(?<!\w|`|\/|\[|\()!((?<community>[a-zA-Z0-9._-]+)@(?<instance>[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+))(?!.*`|.*\]|\))/gi
    let communities = source.matchAll(communityRE)

    for (let user of users) {
        if (user.groups?.username && user.groups?.instance) {
            let replacementText = `[@${user.groups.username}@${user.groups.instance}](/u/${user.groups.username}@${user.groups.instance})`
            let find = new RegExp(user[0] + '(?!.*`|.*\])', "gi")
            source = source.replaceAll(find, replacementText)
        }
    }

    

    for (let community of communities) {
        if (community.groups?.community && community.groups?.instance) {
            let replacementText = `[!${community.groups.community}@${community.groups.instance}](/c/${community.groups.community}@${community.groups.instance})`
            let find = new RegExp(community[0] + '(?!.*`|.*\])', "gi")
            source = source.replaceAll(find, replacementText)
        }
    }


    return source
}

const regexes = {
    post: /^https:\/\/([a-zA-Z0-9\.\-]+)\/post\/(\d+)$/,
    comment: /^https:\/\/([a-zA-Z0-9\.\-]+)\/comment\/(\d+)$/,
    comment2: /^https:\/\/([a-zA-Z0-9\.\-]+)\/post\/\d+\/(\d+)$/,
    user: /^https:\/\/([a-zA-Z0-9\.\-]+)\/u\/([^@/]+)$/,
    community: /^https:\/\/([a-zA-Z0-9\.\-]+)\/c\/([^@/]+)$/
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

    if (regexes.comment2.test(link)) {
        const match = link.match(regexes.comment2)
        if (!match) return
        return `/comment/${match?.[1]}/${match?.[2]}`
    }
  
    
    if (regexes.user.test(link)) {
        const match = link.match(regexes.user)
        if (!match) return
        // These also use /u/ but should not be localized
        let exceptionsRe = /(reddit.com|youtube.com|youtu.be|y2u.be)/i
        if (link.match(exceptionsRe)) return
        
        return `/u/${match?.[2]}@${match?.[1]}`
    }

    if (regexes.community.test(link)) {
        const match = link.match(regexes.community)
        if (!match) return
        return `/c/${match?.[2]}@${match?.[1]}`
    }

}
