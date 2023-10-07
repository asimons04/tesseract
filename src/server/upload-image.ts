export async function proxy_pictrs_upload(event) {
    // annoying hack to fix lemmy's CORS
    try {
        event.request.headers.delete('origin')
        event.request.headers.delete('host')
        
        const url = buildUrl(event.url)
        let headers: Headers = event.request.headers

        headers.delete('origin')
        headers.delete('host')

        if (
            event.request.method == 'POST' &&
            url.pathname == '/pictrs/image' &&
            ( url.searchParams.get('auth') || headers.get('authorization') )
        ) {
            let jwt = url.searchParams.get('auth') ?? headers.get('authorization')?.replace("Bearer ", "")

            headers.set('cookie', `jwt=${jwt}`)
            headers.set('authorization', `Bearer ${jwt}`)
        } else {
            return new Response(
                JSON.stringify({message: 'Only CORS allowed is through /pictrs/image',}),
                {
                    status: 500,
                }
            )
        }

        const data = await fetch(url, {
            method: event.request.method,
            headers: headers,
            body: event.request.body,
            // @ts-ignore this works, idk why typescript complains
            duplex: 'half',
            signal: AbortSignal.timeout(20 * 1000),
            })
            .catch((_) => undefined)

            if (!data) {
                return new Response(
                    JSON.stringify({message: 'proxy failed to fetch',}),
                    {
                        status: 500,
                    }
                )
            }

            if (!data.ok) {
                return new Response(
                    JSON.stringify({
                        message: await data.text(),
                    }),
                    {
                        status: data.status,
                    }
                )
            }

            const json = await data.json()

            return new Response(JSON.stringify(json), {
                status: data.status,
            })
    } catch (error) {
        console.log(error)
        return new Response(
            JSON.stringify({message: 'the proxy failed to fetch from server', error: error}),
            {
                status: 500,
            }
        )
    }


}


function buildUrl(inputUrl: URL): URL {
    let withoutCors = inputUrl.pathname.replace('/cors/', '')

    if (!withoutCors.startsWith('https://')) {
        withoutCors = 'https://' + withoutCors
    }

    return new URL(`${withoutCors}?${inputUrl.searchParams.toString()}`)
}