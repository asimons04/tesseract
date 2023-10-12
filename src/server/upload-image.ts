// annoying hack to fix lemmy's CORS
export async function proxy_pictrs_upload(event) {
    const req = event.req;
    const res = event.res;
    const url = buildUrl(req.url)

    // Massage the request headers to create a new connection to the target Lemmy instance
    req.headers.delete('origin')
    req.headers.delete('host')
    req.headers.set('Host', url.host);

    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'POST');

    try {
        // Route:  POST: /pictrs/image (requires Authorization header)
        if ( req.method == 'POST' && url.pathname == '/pictrs/image') {
            let jwt = req.headers.get('authorization').replace("Bearer ", "")
            
            if (!jwt) return res.error('Authorization required: no token supplied').send();
            
            req.headers.set('cookie', `jwt=${jwt}`)             // Set JWT as cookie for backwards compatibility with 0.18.x
            req.headers.set('authorization', `Bearer ${jwt}`)   // Send JWT as authorization header for 0.19.0+
            
            const data = await fetch(url, {
                method: req.method,
                headers: req.headers,
                body: event.request.body,
                //@ts-ignore
                duplex: 'half',
                //@ts-ignore
                signal: AbortSignal.timeout(20 * 1000),
            }).catch((_) => undefined)
            
            if (!data) {
                return res.error('Proxy failed to fetch').send();
            }

            if (!data.ok) {
                return res.error(await data.text(), data.status).send();
            }

            const json = await data.json()

            return res.status(data.status).json(json).send();
        } 

        return res.error('Invalid request to pict-rs proxy').send();
            
    } catch (error) {
        console.log(error)
        return res.error('The proxy failed to fetch from server').send();
    }


}


function buildUrl(inputUrl: URL): URL {
    let withoutCors = inputUrl.pathname.replace('/cors/', '')

    if (!withoutCors.startsWith('https://')) {
        withoutCors = 'https://' + withoutCors
    }

    return new URL(`${withoutCors}?${inputUrl.searchParams.toString()}`)
}