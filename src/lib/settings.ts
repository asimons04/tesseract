import type { CommentSortType, CommunityView, SortType } from 'lemmy-js-client'
import { type Writable, writable } from 'svelte/store'
import { env } from '$env/dynamic/public'

export const SSR_ENABLED = env.PUBLIC_SSR_ENABLED?.toLowerCase() == 'true'

// Returns a proper boolean or null.  Used to set boolean values from env var strings while allowing nullish coalescing to set default values.
const toBool = (str: string | undefined) => {
  if (!str) {
    return null
  }
  return str.toLowerCase() === 'true'
}

const strToArray = (str:string | undefined) => {
    if (!str) { return [] }

    // Reject empty strings
    if (str.trim() == "") { return [] }
    
    // Convert non-empty string into array, convert newlines into commas, remove scheme and slashes
    let arr:Array<String> =  str.split(',');
    
    // Deduplicate and sort the array of instances
    let uniqArr:Array<String> = [...new Set(arr)].sort();
    
    // Remove empty string elements and trim whitespace from each domain entry
    let trimmedArr:Array<String> = [];
    
    for (let i=0; i< uniqArr.length; i++) {
        let item:String = uniqArr[i].trim();
        if (item.length > 0) {
            trimmedArr.push(item);
        }
    }
    trimmedArr.sort();
    return trimmedArr;
}

const isBrowser = () => {
    if (typeof window != 'undefined') return true;
    return false;
}


interface Settings {
    version: number
    markReadPosts: boolean
    instance?: string
    showCompactPosts: boolean
    defaultSort: {
        sort: SortType
        feed: 'All' | 'Subscribed' | 'Local'
        comments: CommentSortType
    }
    hidePosts: {
        deleted: boolean
        removed: boolean
        keywords: boolean,
        keywordList: string[]
        MBFCLowCredibility: boolean
    }
    notifications: {
        enabled: boolean
        pollRate: number
        // how often to check in the background
        notifRate: number
    }
    displayNames: boolean
    nsfwBlur: boolean
    tagNSFWCommunities: boolean
    moderation: {
        removalReasonPreset: string
    },
    openInNewTab: {
        links: boolean,
        posts: boolean,
    },
    debugInfo: boolean
    systemUI: boolean
    embeddedMedia: {
        feed: boolean
        post: boolean
        YTFrontend: 'YouTube' | 'Invidious' 
        customInvidious: string
        autoplay: boolean
        loop:boolean
        enabledSources: {
            youtube: boolean,
            spotify: boolean,
            soundcloud: boolean,
            bandcamp: boolean,
            vimeo: boolean,
            odysee: boolean,
            songlink: boolean,
            generic: boolean
        }
    }
    imageSize: {
        feed: 'max-w-sm' | 'max-w-md'| 'max-w-3xl' | 'max-w-4xl' | 'w-full'
        post: 'max-w-sm' | 'max-w-md'| 'max-w-3xl' | 'max-w-4xl' | 'w-full'
    }
    uiState: {
        expandSidebar: boolean
        expandCommunitySidebar: boolean
        feedMargins:boolean
        postsPerPage: number
        fediseerBadges: boolean
        MBFCBadges: boolean
        showInstances: boolean
        showFullURL: boolean
        expandCrossPosts: boolean
        showBannersInCards: boolean
    }
    highlightCode: boolean
    highlightInlineCode: boolean
    inlineImages: boolean
    experimentalFeatures: boolean
    proxyMedia: {
        enabled: boolean,
        fallback: boolean
    }
    


}

export const defaultSettings: Settings = {
    version: 0.4,
    notifications: {
        enabled:    false,
        pollRate:   60 * 1000,
        notifRate:  10 * 60 * 1000,
    },
    
    moderation: {
        removalReasonPreset: `Your submission in *"{{post}}"* was removed for {{reason}}.`,

    },
    
    debugInfo: false,
    systemUI: true,
    imageSize: {
        feed: 'max-w-3xl',
        post: 'w-full'
    },
    highlightCode: true,
    highlightInlineCode: false,
    inlineImages: true,
    uiState: {
        expandSidebar:                                                  true,
        expandCommunitySidebar:                                         true,
        feedMargins:                                                    true,
        postsPerPage:                                                   20,
        fediseerBadges: toBool(env.PUBLIC_ENABLE_FEDISEER_BADGES)       ?? false,
        MBFCBadges:     toBool(env.PUBLIC_ENABLE_MBFC_BADGES)           ?? true,
        showInstances:                                                  true,
        showFullURL:                                                    false,
        expandCrossPosts:                                               true,
        showBannersInCards:                                             true,

    },

    markReadPosts:      toBool(env.PUBLIC_MARK_READ_POSTS)              ??  false,
    
    showCompactPosts:   toBool(env.PUBLIC_SHOW_COMPACT_POSTS)           ??  false,
    
    defaultSort: {
        sort:           env.PUBLIC_DEFAULT_FEED_SORT                    ??  ('Active' as any),
        feed:           env.PUBLIC_DEFAULT_FEED                         ??  ('Local' as any),
        comments:       env.PUBLIC_DEFAULT_COMMENT_SORT                 ??  ('Hot' as any),
    },
    hidePosts: {
        deleted:    toBool(env.PUBLIC_HIDE_DELETED)                     ??  true,
        removed:    toBool(env.PUBLIC_HIDE_REMOVED)                     ??  false,
        keywords:                                                       false,
        keywordList:                                                    [],
        MBFCLowCredibility:                                             false,

    },
   
    
    
    displayNames:   toBool(env.PUBLIC_DISPLAY_NAMES)                    ??  true,
    nsfwBlur:       toBool(env.PUBLIC_NSFW_BLUR)                        ??  true,
    tagNSFWCommunities: toBool(env.PUBLIC_TAG_NSFW_COMMUNITIES)         ??  true,
    openInNewTab: {
        links:  toBool(env.PUBLIC_OPEN_LINKS_NEW_TAB)               ??  false,
        posts:      toBool(env.PUBLIC_OPEN_POSTS_NEW_TAB)               ??  false,
    },
    experimentalFeatures:                                               false,
    
    embeddedMedia: {
        feed:     toBool(env.PUBLIC_ENABLE_EMBEDDED_MEDIA_FEED)         ??  true,
        post:     toBool(env.PUBLIC_ENABLE_EMBEDDED_MEDIA_POST)         ??  true,
        YTFrontend:     env.PUBLIC_YOUTUBE_FRONTEND                     ??  'YouTube',
        customInvidious:                                                    'yewtu.be',
        autoplay:                                                       false,
        loop:                                                           true,
        enabledSources: {
            youtube:    true,
            spotify:    true,
            soundcloud: true,
            bandcamp:   true,
            vimeo:      true,
            odysee:     true,
            songlink:   true,
            generic:    true
        },
    },
    proxyMedia: {
        enabled:    toBool(env.PUBLIC_ENABLE_USER_MEDIA_PROXY)          ?? false,
        fallback:                                                       true,
    },
   
}



// Global option environment flags
export const ENABLE_MEDIA_PROXY             = toBool(env.PUBLIC_ENABLE_MEDIA_PROXY)                 ?? false
export const MEDIA_PROXY_LEMMY_ONLY         = toBool(env.PUBLIC_MEDIA_PROXY_LEMMY_ONLY)             ?? false
export const MEDIA_PROXY_BLACKLIST          = strToArray(env.PUBLIC_MEDIA_PROXY_BLACKLIST)
export const ENABLE_MEDIA_PROXY_LOCAL       = toBool(env.PUBLIC_ENABLE_MEDIA_PROXY_LOCAL)           ?? true

export const ENABLE_MEDIA_CACHE             = toBool(env.PUBLIC_ENABLE_MEDIA_CACHE)                 ?? ENABLE_MEDIA_PROXY ? true : false;
export const MEDIA_CACHE_DURATION           = parseInt(env.PUBLIC_MEDIA_CACHE_DURATION)             || 12*60    // Base unit: Minutes
export const MEDIA_CACHE_MAX_SIZE           = parseInt(env.PUBLIC_MEDIA_CACHE_MAX_SIZE)             || 1000     // Base unit: MB (Minimum 100 MB will be used if lower than that)
export const MEDIA_CACHE_HOUSEKEEP_INTERVAL = parseInt(env.PUBLIC_MEDIA_CACHE_HOUSEKEEP_INTERVAL)   || 5        //Minutes
export const MEDIA_CACHE_HOUSEKEEP_STARTUP  = toBool(env.PUBLIC_MEDIA_CACHE_HOUSEKEEP_STARTUP)      ?? true
export const MEDIA_CACHE_KEEP_HOT_ITEMS     = toBool(env.PUBLIC_MEDIA_CACHE_KEEP_HOT_ITEMS)         ?? true

// Import custom Invidious/Piped instances
let custom_invidious_instances = strToArray(env.PUBLIC_CUSTOM_INVIDIOUS) as Array<string>
let custom_piped_instances = strToArray(env.PUBLIC_CUSTOM_PIPED) as Array<string>




// Define Invidious and Piped instances to determine if embedded media is a Youtube et al video.
// Invidious Instance List:  https://docs.invidious.io/instances/#list-of-public-invidious-instances-sorted-from-oldest-to-newest
// Piped Instance List: https://github.com/TeamPiped/Piped/wiki/Instances
// Note:    The Invidious instances are used to both detect if a post URL is a video AND to populate the dropdown for which Invidious instance to use.
//          The Piped list is only used for detection of Piped video links; Piped is too slow to use as an embedded player.

export const YTFrontends = {
    invidious: [
        'yewtu.be',
        'vid.puffyan.us',
        'invidious.lunar.icu',
        'invidious.privacydev.net',
        'invidious.slipfox.xyz',
        'inv.bp.projectsegfau.lt',
        'inv.tux.pizza',
        'invidious.io.lol',
        'inv.makerlab.tech',
        'inv.zzls.xyz',
        'anontube.lvkaszus.pl',
        'invidious.fdn.fr',
        'iv.datura.network',
        'invidious.asir.dev',
        'invidious.private.coffee',
        'iv.nboeck.de',
        'yt.oelrichsgarcia.de',
        'yt.artemislena.eu',
        'yt.whateveritworks.org'
    ],

    piped: [
        'piped.video',
        'pipedapi.tokhmi.xyz',
        'pipedapi.moomoo.me',
        'pipedapi.syncpundit.io',
        'api-piped.mha.fi',
        'piped-api.garudalinux.org',
        'pipedapi.rivo.lol',
        'pipedapi.aeong.one',
        'pipedapi.leptons.xyz',
        'piped-api.lunar.icu',
        'pipedapi-libre.kavin.rocks',
        'pa.mint.lgbt',
        'pa.il.ax',
        'piped-api.privacy.com.de',
        'api.piped.projectsegfau.lt',
        'pipedapi.in.projectsegfau.lt',
        'pipedapi.us.projectsegfau.lt',
        'watchapi.whatever.social',
        'api.piped.privacydev.net',
        'pipedapi.palveluntarjoaja.eu',
        'pipedapi.smnz.de',
        'pipedapi.adminforge.de',
        'pipedapi.qdi.fi',
        'piped-api.hostux.net',
        'pdapi.vern.cc',
        'pipedapi.pfcd.me',
        'pipedapi.frontendfriendly.xyz',
        'api.piped.yt',
        'pipedapi.astartes.nl',
        'pipedapi.osphost.fi',
        'pipedapi.simpleprivacy.fr',
        'pipedapi.drgns.space',
        'piapi.ggtyler.dev',
        'watchapi.pluto.lat',
        'piped.syncpundit.io',
        'piped.yt'

    ]
}

// Import custom Invidious/Piped instances
if (custom_invidious_instances.length > 0) {
    YTFrontends.invidious.push(...custom_invidious_instances);
}

// Add user-defined Piped instances
if (custom_piped_instances.length > 0) {
    YTFrontends.piped.push(...custom_piped_instances);
}


// Create a writable store for the user settings
export const userSettings = writable(defaultSettings)

if (isBrowser()) {

    let oldUserSettings = JSON.parse(
        localStorage.getItem('settings') ?? JSON.stringify(defaultSettings)
    )

    // Migrations from old settings styles to new and store them to localStorage.
    userSettings.set(migrateSettings(oldUserSettings));
}

// Subscribe to the store and save it to localStorage on change.
userSettings.subscribe((settings:Settings) => {
  if (isBrowser()) {
    localStorage.setItem('settings', JSON.stringify(settings))
  }
})


// Settings migrations
export function migrateSettings(old:any) {
    // Update legacy versions of user settings to the first controlled version
    if (!old.version) {
        // Change image size from string to object; populate with default vaules
        if (typeof old.imageSize == 'string') {
            delete old.imageSize;
            old.imageSize = defaultSettings.imageSize;
        }

        // Delete the old showInstances object and replace with single boolean under the uiState object
        old.showInstances && (old.showInstances?.user || old.showInstances?.community || old.showInstances?.comments)
            ? old.uiState.showInstances = true
            : old.uiState.showInstances = false
        delete old.showInstances;
        

        // Make sure the keyword filter list gets initialized
        if (!old.hidePosts.keywordList) {
            old.hidePosts.keywordList = []
        }

        // Set initial version control version
        old.version = 0;
    }

    // Version 0 -> 0.1
    if (old.version == 0) {
        // Add individual selectors for embedded media
        if (!old.embeddedMedia.enabledSources) {
            if (old.embeddedMedia.feed || old.embeddedMedia.post) {
                old.embeddedMedia.enabledSources = {...defaultSettings.embeddedMedia.enabledSources}
            }
        }
        old.version = 0.1;
    }

    // 0.1 -> 0.2
    if (old.version == 0.1) {
        delete old.uiState.expandModeratingList;
        delete old.uiState.expandSubscribedList;
        delete old.uiState.expandFavoritesList;
        delete old.uiState.expandAccountsList;


        // Rename the settings key to open external links in new tab
        old.openInNewTab.links = old.openInNewTab.postLinks
        delete old.openInNewTab.postLinks
        old.version = 0.2
    }
    
    // 0.2 -> 0.3
    if (old.version == 0.2) {
        delete old.modlogCardView
        old.version = 0.3
    }

    // 0.3 -> 0.4
    if (old.version == 0.3) {
        if (!old.uiState.hasOwnProperty('feedMargins')) old.uiState.feedMargins = defaultSettings.uiState.feedMargins;
        old.version = 0.4
    }

    return { ...defaultSettings, ...old }
}

