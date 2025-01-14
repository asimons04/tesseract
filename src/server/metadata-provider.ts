/*
    Provides a server-side hook so that when a remote server fetch comes in, the request will be handled by this rather than 
    sending the app's Javascript (which most can't parse for metadata).

    Route:  /tesseract/api/metadata
    
    In hooks.server.ts, the UA is evaluated.  If the request is from a server (Lemmy, GoogleBot, curl, etc), the url.pathname will be modified
    to go here:

    e.g. Request from UA containing "Lemmy":  /post/12345 -> /tesseract/api/metadata/post/12345


    This module performs server-side API fetches and returns a minimal HTML document containing just the header with metadata tags populated with the 
    post, comment, user, community, or site info.
*/

interface MetaDataToProvide {
    title?: string,
    url?: string,
    image?: string,
    description?: string
    body?: string
    video?: string
}

import { DEFAULT_INSTANCE_URL } from '$lib/instance'
import { LemmyHttp } from 'lemmy-js-client'
import { isAudio, isImage, isVideo } from './helpers'

// Escapes single quotes, double quotes, and backslashes
function replaceDoubleQuotes(str:string) {
    return str.replace(/["]/g, '\'')
  }

function generateMetadataStub(metadata:MetaDataToProvide) {
    let doc = `<!DOCTYPE html>`
    doc += '<html>'
    doc += '<head>'
    if (metadata.title)         doc += `<title>${replaceDoubleQuotes(metadata.title)}</title>`
    if (metadata.title)         doc += `<meta property="og:title" content="${replaceDoubleQuotes(metadata.title)}" />`
    if (metadata.url)           doc += `<meta property="og:url" content="${metadata.url}" />`
    if (metadata.image)         doc += `<meta property="og:image" content="${metadata.image}" />`
    if (metadata.description)   doc += `<meta property="og:description" content="${replaceDoubleQuotes(metadata.description)}" />`
    if (metadata.video)         doc += `<meta property="og:video" content="${metadata.video}" />`
    doc += '</head>'

    if (metadata.body)          doc += `<body>${metadata.body}</body>`
    doc += '</html>'

    return doc
}


export async function metadata_router(event:any) {
    let req = event.req;
    let res = event.res;

    try {
        // Post Metadata Requests
        if (req.route.startsWith('/post')) {
            
            let path = req.route.split('/')
            let postID = path.pop()
            let instance = path.pop()
            
            if (instance == 'post') instance = DEFAULT_INSTANCE_URL

            const client = new LemmyHttp(`https://${instance}`)

            const results = await client.getPost({
                id: postID
            })

            const data = {
                title: results.post_view.post.name,
                url: results.post_view.post.url,
                image: isImage(results.post_view.post.url) ? results.post_view.post.url : results.post_view.post.thumbnail_url,
                description: results.post_view.post.body?.substring(0, 300),
                video: isVideo(results.post_view.post.url) ? results.post_view.post.url : results.post_view.post.embed_video_url
            }

            return res.setHeader('Content-Type', "text/html").send(generateMetadataStub(data))

        }

        // Comment Metadata Requests
        if (req.route.startsWith('/comment')) {
            let path = req.route.split('/')
            let commentID = path.pop()
            let instance = path.pop()

            if (instance == 'comment') instance = DEFAULT_INSTANCE_URL
            
            const client = new LemmyHttp(`https://${instance}`)
            const results = await client.getComment({ id: commentID})
            const data = {
                title: `${results.comment_view.creator.display_name ?? results.comment_view.creator.name}'s Comment on "${results.comment_view.post.name}"`,
                image: results.comment_view.creator.avatar,
                url: results.comment_view.comment.ap_id,
                description: results.comment_view.comment.content
            }
            
            return res.setHeader('Content-Type', "text/html").send(generateMetadataStub(data))
        }

        // Community Metadata Request
        if (req.route.startsWith('/c/')) {
            let path = req.route.split('/')
            let communityName = path.pop()
            const client = new LemmyHttp(`https://${DEFAULT_INSTANCE_URL}`)
            const results = await client.getCommunity({
                name: communityName
            })
            const data = {
                title: (results.community_view.community.title ?? results.community_view.community.name) + ` (${results.community_view.community.name}@${new URL(results.community_view.community.actor_id).hostname})`,
                image: results.community_view.community.icon,
                description: results.community_view.community.description
            }
            return res.setHeader('Content-Type', "text/html").send(generateMetadataStub(data))
        }

        // User Metadata
        if (req.route.startsWith('/u/')) {
            let path = req.route.split('/')
            let userName = path.pop()
            const client = new LemmyHttp(`https://${DEFAULT_INSTANCE_URL}`)
            const results = await client.getPersonDetails({
                username: userName
            })
            const data = {
                title: (results.person_view.person.display_name ?? results.person_view.person.name) + ` (${results.person_view.person.name}@${new URL(results.person_view.person.actor_id).hostname})`,
                image: results.person_view.person.avatar,
                description: results.person_view.person.bio
            }
            return res.setHeader('Content-Type', "text/html").send(generateMetadataStub(data))
        }

        // Site Metadata
        if (req.route == '/') {
            const client = new LemmyHttp(`https://${DEFAULT_INSTANCE_URL}`)
            const results = await client.getSite()
            const data = {
                title: results.site_view.site.name,
                image: results.site_view.site.icon,
                description: results.site_view.site.description
            }
            return res.setHeader('Content-Type', "text/html").send(generateMetadataStub(data))
        }

    }
    catch (err) {
        console.log(err)
        let data = {
            title: 'Failed to Fetch Metadata',
            description: 'Failed to fetch the metadata for the provided resource'
        }
        return res.setHeader('Content-Type', "text/html").send(generateMetadataStub(data))

    }

   



    return res.error("Invalid API method requested").send()

}

