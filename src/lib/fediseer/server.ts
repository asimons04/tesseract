import {getFediseerInfo} from './client.js'
import { cache } from '$lib/redisCache.js'

export async function fediseer_router(event) {
    let res = event.res;
    let req = event.req;
    
    console.log(cache);

    if (req.route == '/lookup') {
        let instance = req.params.get('instance');

        if (instance) {

            let key = `cache:fediseer:${req.route}:${instance}`
            
            let results
            if(cache.get(key)) {
                results = JSON.parse(cache.get(key));
                res.setHeader('X-Cache-Status', 'hit');
                res.setHeader('X-Cache-TTL', cache.ttl(key));
            }
            
            else {
                results = await getFediseerInfo(instance);
                if (results) {
                    cache.set(key, JSON.stringify(results));
                    res.setHeader('X-Cache-Status', 'miss');
                }
            }

            if (results) {
                return res.json(results).send();
            }
            else {
                return res
                    .error(`Failed to get results from Fediseer for ${instance}`)
                    .send();
            }
        }
        else {
            return res.error("No or invalid instance specified").send();
        }

    }

    // Route : /test
    if (req.method == 'GET' && req.route == '/test') {
        return res
            .json('The server is correctly handling this from the fediseer library server hook')
            .send();
    }

    if (req.method == 'GET' && req.route == '/test2') {
        return res
            .status(201)
            .setCookie('foobar', 'This is a test cookie with options', {secure: true, samesite: 'Lax', httponly: true, path: '/api/fediseer'})
            .setCookie('asdfasdf', 'thisISANOTHER cookie')
            .setCookie('COOKIE', "MONSTER")
            .unsetCookie('asdfasdf')
            .json('TEST2')
            .send();
    }

    return res.error("Invalid API method requested").send()

}

