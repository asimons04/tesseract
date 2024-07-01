import type { CommentSortType, CommunityView, SortType } from 'lemmy-js-client'
import { type Writable, writable } from 'svelte/store'
import { env } from '$env/dynamic/public'


// Returns a proper boolean or null.  Used to set boolean values from env var strings while allowing nullish coalescing to set default values.
const toBool = (str: string | undefined) => {
  if (!str) {
    return null
  }
  return str.toLowerCase() === 'true'
}

const strToArray = (str:string | undefined): string[] => {
    if (!str) { return [] }

    // Reject empty strings
    if (str.trim() == "") { return [] }
    
    // Convert non-empty string into array, convert newlines into commas, remove scheme and slashes
    let arr:Array<string> =  str.split(',');
    
    // Deduplicate and sort the array of instances
    let uniqArr:Array<string> = [...new Set(arr)].sort();
    
    // Remove empty string elements and trim whitespace from each domain entry
    let trimmedArr:Array<string> = [];
    
    for (let i=0; i< uniqArr.length; i++) {
        let item:string = uniqArr[i].trim();
        if (item.length > 0) {
            trimmedArr.push(item);
        }
    }
    trimmedArr.sort()
    return trimmedArr;
}

const isBrowser = () => {
    if (typeof window != 'undefined') return true;
    return false;
}

export type FeedType = 'All' | 'Subscribed' | 'Local'

export type YouTubeFrontend = "YouTube" | "Invidious" | "Piped" 

interface Settings {
    version: number
    markReadPosts: boolean
    instance?: string
    showCompactPosts: boolean
    font: 'font-system' | 'font-sans' | 'font-serif' | 'font-roboto' | 'font-inter' | 'font-opendyslexic' | 'font-reddit' | 'font-ubuntu' | 'font-urbanist'
    defaultSort: {
        sort: SortType
        feed: FeedType
        comments: CommentSortType
    }
    hidePosts: {
        deleted: boolean
        removed: boolean
        keywords: boolean
        keywordList: string[]
        newAccounts: boolean
        newAccountMinAge: number
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
    embeddedMedia: {
        feed: boolean
        post: boolean
        YTFrontend: "YouTube" | "Invidious" | "Piped"
        customInvidious: string
        customPiped: string
        userDefinedInvidious: string[],
        userDefinedPiped: string[],
        autoplay: boolean
        loop:boolean
    }
    imageSize: {
        feed: 'max-w-sm' | 'max-w-md'| 'max-w-3xl' | 'max-w-4xl' | 'w-full'
        post: 'max-w-sm' | 'max-w-md'| 'max-w-3xl' | 'max-w-4xl' | 'w-full'
    }
    linkifyHashtags: boolean
    uiState: {
        expandSidebar: boolean
        expandCommunitySidebar: boolean
        feedMargins:boolean
        postsPerPage: number
        maxScrollPosts: number
        MBFCBadges: boolean
        showInstances: boolean
        showFullURL: boolean
        expandCrossPosts: boolean
        matchCrossPostOnTitle: boolean
        showBannersInCards: boolean
        stretchCardBanner: boolean
        reverseActionBar: boolean
        showScores: boolean
        showAltText:boolean
        filterAnnoyingCCLicense: boolean
        infiniteScroll: boolean
    }
    highlightCode: boolean
    highlightInlineCode: boolean
    inlineImages: boolean
    experimentalFeatures: boolean
    proxyMedia: {
        enabled: boolean,
        fallback: boolean,
        useForImageUploads: boolean
    }
    convertUploadsToWebp: boolean,
    convertUploadQuality: number
    


}

// Default settings
export const defaultSettings: Settings = {
    version: 10,
    notifications: {
        enabled:    false,
        pollRate:   60 * 1000,
        notifRate:  10 * 60 * 1000,
    },
    
    moderation: {
        removalReasonPreset: `Your submission in *"{{post}}"* was removed for {{reason}}.`,

    },
    font: 'font-roboto',
    debugInfo: false,
    imageSize: {
        feed: 'w-full',
        post: 'w-full'
    },
    highlightCode: true,
    highlightInlineCode: false,
    inlineImages: true,
    linkifyHashtags: true,
    uiState: {
        expandSidebar:                                                  true,
        expandCommunitySidebar:                                         true,
        feedMargins:                                                    true,
        postsPerPage:                                                   20,
        maxScrollPosts:                                                 100,
        MBFCBadges:     toBool(env.PUBLIC_ENABLE_MBFC_BADGES)           ?? true,
        showInstances:                                                  true,
        showFullURL:                                                    false,
        expandCrossPosts:                                               true,
        matchCrossPostOnTitle: toBool(env.PUBLIC_MATCH_XPOST_TITLE)     ?? true,
        showBannersInCards:                                             true,
        stretchCardBanner: toBool(env.PUBLIC_STRETCH_CARD_BANNERS)      ?? false,
        reverseActionBar:                                               false,
        showScores:                                                     true,
        showAltText:                                                    true,
        filterAnnoyingCCLicense:                                        false,
        infiniteScroll:                                                 true,

    },

    markReadPosts:      toBool(env.PUBLIC_MARK_READ_POSTS)              ??  false,
    
    showCompactPosts:   toBool(env.PUBLIC_SHOW_COMPACT_POSTS)           ??  false,
    
    defaultSort: {
        sort:       env.PUBLIC_DEFAULT_FEED_SORT as SortType            ??  'Active',
        feed:       env.PUBLIC_DEFAULT_FEED as FeedType                 ??  'Local',
        comments:   env.PUBLIC_DEFAULT_COMMENT_SORT as CommentSortType  ??  'Hot'
    },
    hidePosts: {
        deleted:    toBool(env.PUBLIC_HIDE_DELETED)                     ??  true,
        removed:    toBool(env.PUBLIC_HIDE_REMOVED)                     ??  false,
        keywords:                                                       false,
        keywordList:                                                    [],
        MBFCLowCredibility:                                             false,
        newAccounts:                                                    false,
        newAccountMinAge:                                               5

    },
   
    
    
    displayNames:   toBool(env.PUBLIC_DISPLAY_NAMES)                    ??  true,
    nsfwBlur:       toBool(env.PUBLIC_NSFW_BLUR)                        ??  true,
    tagNSFWCommunities: toBool(env.PUBLIC_TAG_NSFW_COMMUNITIES)         ??  true,
    openInNewTab: {
        links:      toBool(env.PUBLIC_OPEN_LINKS_NEW_TAB)               ??  false,
        posts:      toBool(env.PUBLIC_OPEN_POSTS_NEW_TAB)               ??  false,
    },
    experimentalFeatures:                                               false,
    
    embeddedMedia: {
        feed:     toBool(env.PUBLIC_ENABLE_EMBEDDED_MEDIA_FEED)         ??  false,
        post:     toBool(env.PUBLIC_ENABLE_EMBEDDED_MEDIA_POST)         ??  true,
        YTFrontend: env.PUBLIC_YOUTUBE_FRONTEND as YouTubeFrontend      ??  "YouTube" ,
        customInvidious:    env.PUBLIC_DEFAULT_CUSTOM_INVIDIOUS ??      'yewtu.be',
        customPiped:        env.PUBLIC_DEFAULT_CUSTOM_PIPED     ??      'piped.video',
        userDefinedInvidious:                                           [],
        userDefinedPiped:                                               [],
        autoplay:                                                       false,
        loop:                                                           true,
    },
    proxyMedia: {
        enabled:    toBool(env.PUBLIC_ENABLE_USER_MEDIA_PROXY)          ?? false,
        fallback:                                                       true,
        useForImageUploads:                                             false,
    },
    convertUploadsToWebp:                                               true,
    convertUploadQuality:                                               70
   
}


// Global option environment flags
export const ENABLE_MEDIA_PROXY             = toBool(env.PUBLIC_ENABLE_MEDIA_PROXY)                     ?? false
export const MEDIA_PROXY_LEMMY_ONLY         = toBool(env.PUBLIC_MEDIA_PROXY_LEMMY_ONLY)                 ?? false
export const MEDIA_PROXY_BLACKLIST          = [
    'img.shields.io',
    ...strToArray(env.PUBLIC_MEDIA_PROXY_BLACKLIST)
]
export const ENABLE_MEDIA_PROXY_LOCAL       = toBool(env.PUBLIC_ENABLE_MEDIA_PROXY_LOCAL)               ?? true
export const ENABLE_MEDIA_CACHE             = toBool(env.PUBLIC_ENABLE_MEDIA_CACHE)                     ?? ENABLE_MEDIA_PROXY ? true : false;
export const MEDIA_CACHE_DURATION           = parseInt(env.PUBLIC_MEDIA_CACHE_DURATION ?? '')           || 12*60    // Base unit: Minutes
export const MEDIA_CACHE_MAX_SIZE           = parseInt(env.PUBLIC_MEDIA_CACHE_MAX_SIZE ?? '')           || 1000     // Base unit: MB (Minimum 100 MB will be used if lower than that)
export const MEDIA_CACHE_HOUSEKEEP_INTERVAL = parseInt(env.PUBLIC_MEDIA_CACHE_HOUSEKEEP_INTERVAL ?? '') || 5        //Minutes
export const MEDIA_CACHE_HOUSEKEEP_STARTUP  = toBool(env.PUBLIC_MEDIA_CACHE_HOUSEKEEP_STARTUP)          ?? true
export const MEDIA_CACHE_KEEP_HOT_ITEMS     = toBool(env.PUBLIC_MEDIA_CACHE_KEEP_HOT_ITEMS)             ?? true


// URL Blacklist options
export const BLACKLIST_CONFIG = {
    DOMAIN_BLACKLIST:         strToArray(env.PUBLIC_DOMAIN_BLACKLIST),
    FAKE_NEWS_BLACKLIST:      strToArray(env.PUBLIC_FAKE_NEWS_BLACKLIST),
    LINK_SHORTENER_BLACKLIST: strToArray(env.PUBLIC_LINK_SHORTENER_BLACKLIST),
    LINK_SHORTENER_ALLOWLIST: strToArray(env.PUBLIC_LINK_SHORTENER_ALLOWLIST),
    
    REJECT_LOW_CRED_MBFC:   toBool(env.PUBLIC_BLACKLIST_DENY_LOW_CRED_MBFC)     ?? false,
    REJECT_LINK_SHORTENERS: toBool(env.PUBLIC_BLACKLIST_DENY_LINK_SHORTENERS)   ?? false,
    REJECT_FAKE_NEWS:       toBool(env.PUBLIC_BLACKLIST_DENY_FAKE_NEWS)         ?? false,
}


// Instances you want to feature for login (if not locked to instance), signup, and community browsing
export const FEATURED_INSTANCES = strToArray(env.PUBLIC_FEATURED_INSTANCES)

// Define Invidious and Piped instances to determine if embedded media is a Youtube et al video.
// Invidious Instance List:  https://docs.invidious.io/instances/#list-of-public-invidious-instances-sorted-from-oldest-to-newest
// Piped Instance List: https://github.com/TeamPiped/Piped/wiki/Instances
// Note:    The Invidious instances are used to both detect if a post URL is a video AND to populate the dropdown for which Invidious instance to use.
//          The Piped list is only used for detection of Piped video links; Piped is too slow to use as an embedded player.

export const YTFrontends = {
    invidious: [
        'yewtu.be',
        'vid.puffyan.us',
        'i.devol.it',
        'invidious.lunar.icu',
        'invidious.privacydev.net',
        'invidious.slipfox.xyz',
        'inv.bp.projectsegfau.lt',
        'inv.tux.pizza',
        'invidious.io.lol',
        'inv.makerlab.tech',
        'inv.zzls.xyz',
        'invidious.perennialte.ch',
        'invidious.privacyredirect.com',
        'anontube.lvkaszus.pl',
        'invidious.fdn.fr',
        'iv.datura.network',
        'invidious.asir.dev',
        'invidious.private.coffee',
        'iv.nboeck.de',
        'yt.drgnz.club',
        'yt.oelrichsgarcia.de',
        'yt.artemislena.eu',
        'yt.whateveritworks.org',
        ...strToArray(env.PUBLIC_CUSTOM_INVIDIOUS)
    ].sort(),

    piped: [
        'cf.piped.video',
        'piped.video',
        'piped.adminforge.de',
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
        'piped.privacydev.net',
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
        'piped.yt',
        ...strToArray(env.PUBLIC_CUSTOM_PIPED)
    ].sort()
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

    // 0.4 - 0.5
    if (old.version == 0.4) {
        // Match new posts per fetch setting to new range of 10, 20, or 30
        if (old.uiState.postsPerPage >=30) old.uiState.postsPerPage = 30
        else if (old.uiState.postsPerPage == 20) old.uiState.postsPerPage = 30
        else old.uiState.postsPerPage = 10

        old.version = 0.5
    }

    //0.5 -> 0.6
    if (old.version == 0.5) {
        if (old.uiState.maxScrollPosts > 150) old.uiState.maxScrollPosts = 150
        old.version = 0.6
    }
    
    // 0.6 -> 0.7
    if (old.version == 0.6) {
        if ( !('showScores' in old.uiState)) {
            old.uiState.showScores = true;   
        }
        old.version = 0.7
    }

    // 0.7 -> 0.8
    if (old.version == 0.7) {
        delete old.systemUI
        old.version = 0.8
    }

    // 0.8 -> 0.9
    if (old.version == 0.8) {
        delete old.embeddedMedia.enabledSources
        old.version = 0.9
    }

    if (old.version == 0.9) {
        delete old.uiState.fediseerBadges;
        old.version = 10
    }

    return { 
        ...defaultSettings, 
        ...old, 
        defaultSort:    {...defaultSettings.defaultSort, ...old.defaultSort },
        hidePosts:      {...defaultSettings.hidePosts, ...old.hidePosts},
        notifications:  {...defaultSettings.notifications, ...old.notifications},
        moderation:     {...defaultSettings.moderation, ...old.moderation},
        openInNewTab:   {...defaultSettings.openInNewTab, ...old.openInNewTab},
        embeddedMedia:  {
            ...defaultSettings.embeddedMedia,
            ...old.embeddedMedia,
        },
        imageSize:      {...defaultSettings.imageSize, ...old.imageSize},
        uiState:        {...defaultSettings.uiState, ...old.uiState},
        proxyMedia:     {...defaultSettings.proxyMedia, ...old.proxyMedia}
    }
}

