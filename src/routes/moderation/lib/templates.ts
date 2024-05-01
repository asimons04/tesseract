import type {
    CommentReportView,
    PostReportView,
    PrivateMessageReportView,
} from 'lemmy-js-client'


import type {
    ContentRemovalTemplate,
    ContentRemovalTemplateReturn
} from './types'

import type { StandardReport } from '../components/helpers'

import { isCommentReport, isPostReport } from '$lib/lemmy/item.js'
import {
    lookup as MBFCLookup, generateModerationPreset as MBFCModerationPreset
} from '$lib/MBFC/client'


let removalPresets:ContentRemovalTemplate[] = [];
let communityBanPresets:ContentRemovalTemplate[] = [];
let instanceBanPresets:ContentRemovalTemplate[] = [];


export const getRemovalTemplates = function (item:StandardReport):ContentRemovalTemplateReturn {
    removalPresets = [];
    
    addStandardReasons();
    addMBFCPreset(item);
    
    removalPresets.sort( (a,b) => {
        if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
        if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
        return 0;
    })
    
    let options:string[] = [];
    let optionNames:string[] = [];

    removalPresets.forEach((entry) => {
        optionNames.push(entry.name);
        options.push(entry.message);
    })
    
    return { options: options, names: optionNames };
}

// Adds the MBFC report as a removal option (if found)
function addMBFCPreset(item:StandardReport) {
    let results = (item.type=='post' && item.post_view!.post.url) ? MBFCLookup(item.post_view!.post.url) : undefined
    let template = results ? MBFCModerationPreset(item.post_view!, results)?.replaceAll('\n', ' -- ') : undefined
    
    if (template) {
        let preset:ContentRemovalTemplate = {
            name: "MBFC Lookup Result",
            message: template
        };
        removalPresets.push(preset);
    }
    
}


// Add some standard reasons to the removal modal
function addStandardReasons() {
    removalPresets.push({name: 'Custom', message: ''});
    removalPresets.push({name: '<Use Report Text>', message: 'REPORTTEXT'});
    removalPresets.push({name: 'Spam', message: 'Spam'});
    removalPresets.push({name: 'Violence', message: 'Calling for violence'});
    removalPresets.push({name: 'Misinformation', message: 'Content contains misinformation'});
    
}
