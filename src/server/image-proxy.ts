export async function image_proxy(event) {
    const req = event.req;
    const res = event.res;
    
    try {
        if ( req.method == 'GET' && (isImage(req.url) || isVideo(req.url)) ) {
            
            // Build a URL to the requested image/video
            let imageUrl = new URL(`https://${req.route}?${req.url.searchParams.toString()}`);
            
            // Massage the request headers to create a new connection to the target Lemmy instance
            req.headers.delete('origin')
            req.headers.delete('host')
            req.headers.set('Host', imageUrl.host);
            
            // Fetch the media
            const data = await fetch(imageUrl, {
                method: req.method,
                headers: req.headers,
                //@ts-ignore
                duplex: 'half',
                //@ts-ignore
                signal: AbortSignal.timeout(20 * 1000),
            }).catch((error) => console.log(error))



            if (!data) {
                return res.error('Proxy failed to fetch').send();
            }
            
            // HTTP 304 trips up the checks so except it from the failure responses
            if (!data.ok && data.status != 304) {
                return res.error(await data.text(), data.status).send();
            }
            
            // Add the response headers from the fetch to the response to the client
            for (const header of data.headers.keys()) {
                res.setHeader(header, data.headers.get(header))
            }

            // Let the upstream/proxy server set the content encoding header
            res.headers.delete('content-encoding');
            
            const image = await data.blob();
            return  res
                .type(image.type)
                .send(await image.arrayBuffer());
        }
    }
    catch (error) {
        console.log( error)
        return res.error('The proxy failed to fetch from server').send();
    }
}


// Check if the provided URL is an image
function isImage  (url: string | undefined) {
    if (!url) return false
    return /\.(jpeg|jpg|gif|png|svg|bmp|webp)$/i.test(new URL(url).pathname)
}

// Check if provided URL is a video
function isVideo (inputUrl: string | undefined) {
  if (!inputUrl) return false

  const url = new URL(inputUrl).pathname.toLowerCase()

  return url.endsWith('mp4') || url.endsWith('webm') || url.endsWith('mov') || url.endsWith('m4v')
}