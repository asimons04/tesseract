const communityLinks = {
    validate: function (text: any, pos: any, self: any) {
        var tail = text.slice(pos)

        if (!self.re.community) {
            self.re.community = new RegExp(/^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z]{2,6})/)
        }

        if (self.re.community.test(tail)) {
            // Linkifier allows punctuation chars before prefix,
            // but we additionally disable `@` ("@@mention" is invalid)
            if (pos >= 2 && tail[pos - 2] === '!') {
                return false
            }
            return tail.match(self.re.community)![0].length
        }
        return 0
    },
  
    normalize: function (match: any) {
        let prefix = match.url
        prefix = prefix.startsWith('c/') ? prefix.slice(2) : prefix.slice(1)
        match.url = `/c/${prefix}`
    },
}

const userLinks = {
    validate: function (text: any, pos: any, self: any) {
        var tail = text.slice(pos)

        if (!self.re.user) {
            self.re.user = new RegExp(/^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z]{2,6})/)
        }
        if (self.re.user.test(tail)) {
            // Linkifier allows punctuation chars before prefix,
            // but we additionally disable `@` ("@@mention" is invalid)
        if (pos >= 2 && tail[pos - 2] === '!') {
            return false
        }
        return tail.match(self.re.user)![0].length
        }
        return 0
    },
    normalize: function (match: any) {
        let prefix = match.url
        prefix = prefix.startsWith('u/') ? prefix.slice(2) : prefix.slice(1)
        match.url = `/u/${prefix}`
    },
}

export function findUserCommunityLinks(source: string) {

    // Find @user@instance.xyz and turn into localized links
    const userRE = /@((?<username>[a-zA-Z0-9._-]+)@(?<instance>[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+))/gi
    let users = source.matchAll(userRE)
    for (let user of users) {
        if (user.groups?.username && user.groups?.instance) {
            let replacementText = `[@${user.groups.username}@${user.groups.instance}](/u/${user.groups.username}@${user.groups.instance})`
            source = source.replace(user[0], replacementText)
        }
    }

    // Find /u/user@instance.xyz and turn into localized links
    // find /c/community@instance.xyz and turn into localized links
    const userRE2 = /(?<!https:\/\/([a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+))(?<!\()(?<!\[)\/u\/((?<username>[a-zA-Z0-9._-]+)@(?<instance>[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+))/gi
    let users2 = source.matchAll(userRE2)
    for (let user of users2) {
        if (user.groups?.username && user.groups?.instance) {
            let replacementText = `[/u/${user.groups.username}@${user.groups.instance}](/u/${user.groups.username}@${user.groups.instance})`
            source = source.replace(userRE2, replacementText)
        }
    }

    // Find !community@instance.xyz and turn into localized links
    const communityRE = /!((?<community>[a-zA-Z0-9._-]+)@(?<instance>[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+))/gi
    let communities = source.matchAll(communityRE)
    for (let community of communities) {
        if (community.groups?.community && community.groups?.instance) {
            let replacementText = `[!${community.groups.community}@${community.groups.instance}](/c/${community.groups.community}@${community.groups.instance})`
            source = source.replace(community[0], replacementText)
        }
    }
    
    // find /c/community@instance.xyz and turn into localized links
    const communityRE2 = /(?<!https:\/\/([a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+))(?<!\()(?<!\[)\/c\/((?<community>[a-zA-Z0-9._-]+)@(?<instance>[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+))/gi
    let communities2 = source.matchAll(communityRE2)
    
    for (let community of communities2) {
        if (community.groups?.community && community.groups?.instance) {
            let replacementText = `[/c/${community.groups.community}@${community.groups.instance}](/c/${community.groups.community}@${community.groups.instance})`
            source = source.replace(communityRE2, replacementText)
        }
    }

    return source
}

const regexes = {
    post: /^https:\/\/([a-zA-Z0-9.-]+)\/post\/(\d+)$/,
    comment: /^https:\/\/([a-zA-Z0-9.-]+)\/comment\/(\d+)$/,
    user: /^https:\/\/([a-zA-Z0-9.-]+)\/user\/(\w+)$/,
    community: /^https:\/\/([a-zA-Z0-9.-]+)\/c\/(\w+)$/
}

/**
 * Convert links to photon links
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
