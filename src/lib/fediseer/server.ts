import {getFediseerInfo} from './client.js'
import { cache } from '$lib/cache/memory.js'

export async function fediseer_router(event:any) {
    let req = event.req;
    let res = event.res;

    if (req.method == 'GET' && req.route == '/lookup') {
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
                    if (results.success) { 
                        cache.set(key, JSON.stringify(results));
                    }
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

    return res.error("Invalid API method requested").send()

}

