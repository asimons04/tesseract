import { open } from 'node:fs/promises'

import type {
    MBFCBiases,
    MBFCReport,
    MBFCDataSet
} from './types'


export async function lookup(domain:string): Promise<MBFCReport|undefined> {
    // Load data from JSON
    let data:MBFCDataSet|undefined = undefined
    try {
        let file = await open('/app/src/lib/MBFC/data/data.json');
        let buffer = await file.readFile();
        await file.close();

        data = JSON.parse(buffer) as MBFCDataSet;
    }
    catch (err) {
        console.log(err);
    }
    
    // Return undefined if no data loaded
    if (!data) return undefined

    // Lookup the provided domain and return the results
    let info:MBFCReport = {} as MBFCReport
    let found:boolean = false;


    try {
        data.sources.map((item) => { 
            if (item.domain==domain) {
                info=item
                found=true;
            }
        });
        
        // Resolve bias, credibility descriptions
        
        
        if (found) {
            // Create a numeric bias score (-100, -50, 0, 50, 100)
            switch (info.bias) {
                case "left":
                    info.score = -100;
                    break;
                case "left-center":
                    info.score = -50;
                    break;
                case "center":
                    info.score = 0;
                    break;
                case "right-center":
                    info.score = 50;
                    break;
                case "right":
                    info.score = 100;
                    break;
                case "pro-science":
                    info.score = 0;
                    break;
                case "conspiracy-pseudoscience":
                    info.score = 101;
                    break;
                
                case "satire":
                    info.score = 102;
                    break;
                
                case "fake-news":
                    info.score = 103;
                    break;
            }
            
            // Biases
            data.biases.map((item) => { 
                if (info?.bias == item.bias) info.biases = item;
                
            })
            
            // Map credibility rating to pretty-printed string
            data.credibility.map((item) => { 
                if (info?.credibility == item.credibility) info.credibility = item.pretty;
                
            })
            
            // Map questionable tags to pretty-printed strings
            data.questionable.map((item) => { 
                if (info?.questionable) {
                    for (let i:number=0; i < info.questionable.length; i++) {
                        let question = info.questionable[i];
                        if (question == item.questionable) info.questionable[i] = item.pretty;
                    }
                }
            })

            // Map Reporting rating to pretty-printed string
            data.reporting.map((item) => { 
                if (info?.reporting == item.reporting) info.reporting = item.pretty;
                
            })



            return info
        }
    }
    catch (err){
        console.log(err);
        // If no results, return undefined
        return undefined
    }
    
    // Catchall for other failures with lookup
    return undefined
}

export async function mbfc_router(event:any) {
    let req = event.req;
    let res = event.res;

    if (req.method == 'GET' && req.route == '/lookup') {
        let domain = req.params.get('domain');

        if (domain) {
            let report = await lookup(domain);
            

            if (report) {
                return res.json(report).send();
            }
            else {
                return res
                    .error(`No results for ${domain}`)
                    .send();
            }
        }
        else {
            return res.error("No or invalid domain specified").send();
        }

    }

    // Route : /test
    if (req.method == 'GET' && req.route == '/test') {
        return res
            .json('The server is correctly handling this from the MBFC library server hook')
            .send();
    }

    return res.error("Invalid API method requested").send()

}

