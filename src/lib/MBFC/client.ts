import type { MBFCBiases, MBFCCredibility, MBFCQuestionable, MBFCReport, MBFCReporting, MBFCDataSet } from './types'
import type { PostView } from 'lemmy-js-client'

import MBFCData from '$lib/MBFC/data/data.json'

function normalizeDomain(domain:string):string {
    // Normalize domains to remove any "www', "amp", and other prefixes that trip up detection.  Also replace some subdomains with their main aliases
    domain = domain
        .replace('www.', '')
        .replace('amp.', '')
        .replace(/^m\./,'')
        .replace('bbc.co.uk', 'bbc.com')
        .replace('bbc.in', 'bbc.com')
        .replace('english.aawsat.com', 'aawsat.com')
        .replace('eu.usatoday.com', 'usatoday.com')
        .replace('messaging-custom-newsletters.nytimes.com', 'nytimes.com')
        .replace('mronline.org', 'monthlyreview.org')
        .replace('presstv.co.uk', 'presstv.ir') 
        .replace('reutersagency.com', 'reuters.com')
        .replace('tvpworld.com', 'tvp.info')
        .replace('wapo.st', 'washingtonpost.com')
        .replace('yahoo.com', 'news.yahoo.com')
        .replace(/.*\.antiwar\.com/, 'antiwar.com')
        .replace(/.*\.apnews\.com/, 'apnews.com')
        .replace(/.*\.businessinsider\.com/, 'businessinsider.com')
        .replace(/.*\.cnn\.com/, 'cnn.com')
        .replace(/.*\.ctvnews\.ca/, 'ctvnews.ca')
        .replace(/.*\.elpais\.com/, 'elpais.com')
        .replace(/.*\.medium\.com/, 'medium.com')
        .replace(/.*\.yahoo\.com/, 'news.yahoo.com')
    
    return domain;
}

export async function api_lookup(url:string):Promise<MBFCReport|undefined> {
    try {
        if (!url) return
        
        let domain = normalizeDomain(new URL(url).host);
        let result = await fetch(`/tesseract/api/mbfc/lookup?domain=${domain}`);

        if (result.ok) {
            return await result.json() as MBFCReport;
        }

        return undefined

    }
    catch {
        return undefined
    }

}

export const lookup = function (url:string):MBFCReport|undefined {
    try {
        if (!url) return
        let domain = normalizeDomain(new URL(url).host);

        // Lookup the provided domain and return the results
        let info:MBFCReport = {} as MBFCReport
        let found:boolean = false;

        (MBFCData as MBFCDataSet).sources.map((item:MBFCReport) => { 
            if (item.domain==domain) {
                info=item
                found = true
            }
        });
        
        // Resolve bias, credibility descriptions
        if (found) {
            
            // Biases
            MBFCData.biases.map((item:MBFCBiases) => { 
                if (info?.bias == item.bias) info.biases = item;
                
            })
            
            // Map credibility rating to pretty-printed string
            MBFCData.credibility.map((item:MBFCCredibility) => { 
                if (info?.credibility == item.credibility) info.credibility = item.pretty;
                
            })
            
            // Map questionable tags to pretty-printed strings
            MBFCData.questionable.map((item:MBFCQuestionable) => { 
                if (info?.questionable) {
                    for (let i:number=0; i < info.questionable.length; i++) {
                        let question = info.questionable[i];
                        if (question == item.questionable) info.questionable[i] = item.pretty;
                    }
                }
            })

            // Map Reporting rating to pretty-printed string
            MBFCData.reporting.map((item:MBFCReporting) => { 
                if (info?.reporting == item.reporting) info.reporting = item.pretty;
                
            })

            return info
        }
        else {
            return undefined
        }
    }
    catch (err) {
        console.log(err);
        return undefined;
    }
}

export const generateModerationPreset = function (post:PostView, results:MBFCReport):string {
    let template:string = "Post has been removed because it is not from a reputable or credible source:";
    if (post.post.url) {
        template += `\nSource: ${new URL(post.post.url).host}`
    }
    
    if (results) {
        if (results.credibility) {
            template += `\nCredibility: ${results.credibility}`
        }

        if (results.reporting) {
            template += `\nFactual Reporting: ${results.reporting}`
        }

        if (results.questionable?.length > 0) {
            template += `\nReasoning: `
            for (let i:number=0; i<results.questionable.length; i++) {
                template += `${results.questionable[i]}, `   
            }
        }

        if (results.url) {
            template += `\nFull Report: ${results.url}`
        }
    }
    
    return template;
}

export const generateReportPreset = function(post:PostView, results:MBFCReport):string {
    let template:string = "Low credibility source";
    
    if (post.post.url) {
        template += ` -- Source: ${new URL(post.post.url).host}`
    }
    
    if (results) {
        if (results.credibility) {
            template += ` -- Credibility: ${results.credibility}`
        }

        if (results.reporting) {
            template += ` -- Factual Reporting: ${results.reporting}`
        }

        if (results.questionable?.length > 0) {
            template += ` -- Reasoning: `
            for (let i:number=0; i<results.questionable.length; i++) {
                template += `${results.questionable[i]}, `   
            }
        }

        if (results.url) {
            template += ` -- Full Report: ${results.url}`
        }
    }
    
    return template;
}