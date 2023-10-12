interface CookieOptions {
    domain?:string,
    expires?:string,
    httponly?: boolean,
    maxage?:number,
    path?:string,
    secure?:boolean,
    samesite?: 'Strict' | 'Lax' | 'None'
}

// Express-like Request
interface ExpRequest {
    route: string,
    path: string,
    method: string,
    params: URLSearchParams,
    headers: Headers,
    url: URL,
}

// Express-like Response
interface ExpResponse {
    headers: Headers,
    statusCode: number,
    body: string,
    appendHeader: Function,
    error: Function,
    json: Function,
    length: Function,
    redirect: Function,
    send: Function,
    setCookie: Function,
    setHeader: Function,
    status: Function,
    type: Function,
    unsetCookie: Function
}

export async function router(event:any, resolve:any, routes:any) {
    // Create an Express-like request object    
    if(!event.req) { 
        event.req = {
            route: '',
            path: event.url.pathname,
            method: event.request.method,
            params: event.url.searchParams,
            headers: event.request.headers,
            url: event.url,
        } as ExpRequest
    }
    
    // Update the relative route and path values for the request
    event.req.route = event.url.pathname.replace(event.req.route, '');

    // Create Express-like response object if it doesn't exist on the event yet
    if (!event.res) {
        event.res = {
            headers: new Headers(),
            statusCode: 200,
            body: '',
            
            appendHeader: function(key:string, value:string): ExpResponse {
                event.res.headers.append(key, value);
                return event.res;
            },

            error: function(message:any, status:number=404): ExpResponse {
                event.res.headers.set('Content-Type', 'application/json');
                event.res.status(status);
                event.res.body = JSON.stringify( {
                    message: message
                });
                return event.res;
            },
            
            json: function(message:any): ExpResponse {
                event.res.headers.set('Content-Type', 'application/json');
                event.res.body =  JSON.stringify(message)
                return event.res;
            },
            
            length: function(length:number): ExpResponse {
                event.res.headers.set('Content-Length', length);
                return event.res;
            },
            
            redirect: function(location:string): ExpResponse {
                event.res.headers.set('Location', location)
                event.res.statusCode = 302;
                return event.res;
            },

            send: function(data:string | undefined = undefined):Response {
                return new Response(
                    data ?? event.res.body,
                    {
                        headers: event.res.headers,
                        status: event.res.statusCode
                    }
                )
            },

            setCookie: function(key:string, value:string, options:CookieOptions={}): ExpResponse {
                let cookieOptions = '';
                
                if (options.domain) cookieOptions +=    `; Domain=${options.domain}` 
                if (options.expires) cookieOptions +=   `; Expires=${options.expires}` 
                if (options.httponly) cookieOptions +=  `; HttpOnly`
                if (options.maxage) cookieOptions +=    `; Max-Age=${options.maxage}`
                if (options.path) cookieOptions +=      `; Path=${options.path}`
                if (options.secure) cookieOptions +=    `; Secure`
                if (options.samesite) cookieOptions +=  `; SameSite=${options.samesite}`

                event.res.headers.append('Set-Cookie', `${key}=${value}${cookieOptions}`);
                
                return event.res;
            },

            setHeader: function(key:string, value:string): ExpResponse {
                event.res.headers.set(key, value);
                return event .res;
            },

            status: function(status:number=200): ExpResponse {
                event.res.statusCode = status;
                return event.res;
            },

            type: function(contentType:string): ExpResponse {
                event.res.headers.set('Content-Type', contentType);
                return event.res;
            },

            unsetCookie: function(key:string): ExpResponse {
                event.res.setCookie(key, '', {maxage:-1});
                return event.res;
            }
        } as ExpResponse
    }



    // Parse the routes and call their handlers if any match
    for (let i:number=0; i < routes.length; i++) {
        let route = routes[i];

        // Wildcard Path Endings
        if (route.route.endsWith('*')) {
            let wildcardPath = route.route.split('*')[0];
            if (event.url.pathname.startsWith(wildcardPath)) {
                event.req.path = wildcardPath;
                event.req.route = event.url.pathname.replace(wildcardPath, '');
                return route.handler(event)
            }
        }
        else {
            if (event.url.pathname == route.route) {
                event.req.route = event.url.pathname;
                return route.handler(event)
            }
        }
    }
    
    // If no route hits, return false without a response    
    return false;

}