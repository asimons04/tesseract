import type { CommentSortType, CommunityView, SortType } from 'lemmy-js-client'
import type { PostType} from '$lib/components/lemmy/post/helpers'
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

export type YouTubeFrontend = "YouTube" | "Custom"

export type PostViewType = 'card' | 'compact' | 'compacter' | 'wide-compact' | 'more-compact' | 'ultra-compact' | 'reader' | 'hybrid'

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
    markReadOnScroll: boolean
    hidePosts: {
        deleted: boolean
        removed: boolean
        keywords: boolean
        keywordList: string[]
        newAccounts: boolean
        newAccountMinAge: number
        MBFCLowCredibility: boolean
        minimizeBotComments: boolean
        hideUsersFromBlockedInstances: boolean      
    }
    notifications: {
        enabled: boolean                                                // Technically used to enable/disable notifications, but it's hardcoded to true
        pollRate: number                                                // How often to check for new notifications from the API
        // how often to check in the background
        notifRate: number                                               // Unsure. Inherited from Photon, but I belive it's vestigial and can be removed.
    }
    displayNames: boolean                                               // Enable to show user/community display names. Disable to use their system names.
    nsfwBlur: boolean                                                   // Enable to blur NSFW posts
    tagNSFWCommunities: boolean                                         // No longer used; need to remove
    moderation: {
        removalReasonPreset: string                                     // The preset template for moderation replies
    },
    openInNewTab: {
        links: boolean,                                                 // Enable to open external links in a new tab
        posts: boolean,                                                 // Enable to load posts in a new tab
    },
    debugInfo: boolean                                                  // Enable to show a 'debug' button on post/comments and other objects for development purposes
    embeddedMedia: {
        feed: boolean                                                   // Whether to enable media embeds in the feed
        post: boolean                                                   // Whether to enable media embeds on post pages
        YTFrontend: YouTubeFrontend                                     // YouTube or Custom - which YT frontend to use
        customInvidious: string                                         // The currently selected/active Invidious/Piped instance to use in alternate links/player
        userDefinedInvidious: string[],                                 // An array of invidious/piped domains to use as alternate  Youtube Frontends
        autoplay: boolean                                               // Whether to autoplay media when clicking into a post.
        loop:boolean                                                    // Whether media should loop. Pretty much only works with direct videos (mp4, etc)
    }
    linkifyHashtags: boolean                                            // Enable to extract hashtags and turn them into search links
    extractFlairsFromTitle: boolean,                                    // Enable to turn [bracketed text] in post titles into flairs
    uiState: {
        disableDownvotes: boolean                                       // Enable to disable downvotes and hide downvote counts.
        linkPreviews: boolean,                                          // Enable to preview markdown links in modals. Disable to go directly to the link target
        postBodyPreviewLength: number,                                  // The number of characters to show in the post body preview in the feed
        expandSidebar: boolean                                          // Used internally to control hiding/showing the lefthand sidebar 
        expandCommunitySidebar: boolean                                 // Used internally to control hiding/showing the site/community/user sidebar (key name is vestigial)
        feedMargins:boolean                                             // Enable to have margins on the side of the post feed, disable to make posts full width
        postsPerPage: number                                            // Number of posts to fetch per page (infinite scroll or manual pagination)
        maxScrollPosts: number                                          // The maximum number of posts to keep in the infinite scroll buffer
        MBFCBadges: boolean                                             // Enable to show MBFC badges on posts that have a domain in its dataset
        showInstances: boolean                                          // Enable to show instances for users and communities on posts/comments
        showInstancesSidebarCommunityList: boolean                      // Enable to show the instances for communities in the sidebar and "My Communities" dropdown
        showFullURL: boolean                                            // Enable to show the full URLs on post links; disable to show just the domain
        expandCrossPosts: boolean                                       // Enable to expand the crosspost lists by default. Disable to show them collapsed by default
        matchCrossPostOnTitle: boolean                                  // Enable to match crossposts on title as well as URL
        showBannersInCards: boolean                                     // Enable to show site/community/user banners in their cards or disable to have blank cards
        stretchCardBanner: boolean                                      // Enable to stretch the banner images to fill the card or center them (disable)
        reverseActionBar: boolean                                       // Enable to reverse the direction of the post/comment action bars
        showScores: boolean                                             // Enable to show post/comment scores in the UI; disable to hide
        showAltText:boolean                                             // Enable to show alt text as a caption on markdown images
        filterAnnoyingCCLicense: boolean                                // Whether to pre-process posts/comments to filter out by regex those annoying CC licenses
        infiniteScroll: boolean                                         // Whether to use infinite scroll or manual pagination
        view: PostViewType                                              // Selected/active post view type
        hideCompactThumbnails: boolean                                  // Hide thumbnails when viewing posts in compact mode (used for 'ultra-compact')
        autoUpdateDates: boolean                                        // Whether to use an interval to live update the post publish/edit times
        defaultCommunityDropdownPanel: 'subscribed' | 'favorites'       // What panel should be displayed in the "My Communities" dropdown by default.
        dedicatedModButton: boolean                                     // Enable to put a dedicated "mod" button posts; disable to access mod actions from post menu
        hybridViewAsCardTypes: PostType[]                               // The post types which should display by default as cards when using "Hybrid" view mode
        hybridViewKeepReadCollapsed: boolean                            // Enable to keep read posts collapsed in compact view rather than auto expanding to cards
    }
    highlightCode: boolean                                              // Enable to use highlight.js code highlighting on code blocks
    highlightInlineCode: boolean                                        // Enable to use highlight.js code hightlighting on inline code
    inlineImages: boolean                                               // Enable to render markdown images inline. Disable to show an image link instead.
    experimentalFeatures: boolean                                       // Enable features marked 'experimental'
    proxyMedia: {                                                       // Media proxy options: Only used if the server settings to enable media proxying/caching are enabled.
        enabled: boolean,                                               // Enable to proxy direct media (images, video) through the image proxy
        fallback: boolean,                                              // Enable to fallback to direct fetch if the proxy cannot fetch the resource.
        useForImageUploads: boolean                                     // Enable to re-write image uploads to go through the local image proxy rather than direct from pict-rs
    }
    convertUploadsToWebp: boolean,                                      // Used internally to keep setting of whether uploaded and pasted images should be converted to webp locally before uploading
    convertUploadQuality: number                                        // The quality level used when converting to webp
    


}

// Default settings
export const defaultSettings: Settings = {
    version: 13,
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
    highlightCode: true,
    highlightInlineCode: false,
    inlineImages: true,
    linkifyHashtags: true,
    extractFlairsFromTitle:                                             true,
    uiState: {
        disableDownvotes:                                               false,
        linkPreviews:                                                   true,
        postBodyPreviewLength:                                          240,
        expandSidebar:                                                  true,
        expandCommunitySidebar:                                         true,
        feedMargins:                                                    true,
        postsPerPage:                                                   20,
        maxScrollPosts:                                                 100,
        MBFCBadges:     toBool(env.PUBLIC_ENABLE_MBFC_BADGES)           ?? true,
        showInstances:                                                  true,
        showInstancesSidebarCommunityList:                              true,
        showFullURL:                                                    false,
        expandCrossPosts:                                               true,
        matchCrossPostOnTitle: toBool(env.PUBLIC_MATCH_XPOST_TITLE)     ?? true,
        showBannersInCards:                                             true,
        stretchCardBanner: toBool(env.PUBLIC_STRETCH_CARD_BANNERS)      ?? false,
        reverseActionBar:                                               false,
        showScores:                                                     true,
        showAltText:                                                    false,
        filterAnnoyingCCLicense:                                        false,
        infiniteScroll:                                                 true,
        view:                                                           'card',
        hideCompactThumbnails:                                          false,
        autoUpdateDates:                                                true,
        defaultCommunityDropdownPanel:                                  'favorites',
        dedicatedModButton:                                             true,
        hybridViewAsCardTypes:                                          ['image'],
        hybridViewKeepReadCollapsed:                                    true,
    },

    markReadPosts:      toBool(env.PUBLIC_MARK_READ_POSTS)              ??  false,
    
    showCompactPosts:   toBool(env.PUBLIC_SHOW_COMPACT_POSTS)           ??  false,
    
    defaultSort: {
        sort:       env.PUBLIC_DEFAULT_FEED_SORT as SortType            ??  'Active',
        feed:       env.PUBLIC_DEFAULT_FEED as FeedType                 ??  'Local',
        comments:   env.PUBLIC_DEFAULT_COMMENT_SORT as CommentSortType  ??  'Hot'
    },
    markReadOnScroll:                                                   false,
    hidePosts: {
        deleted:    toBool(env.PUBLIC_HIDE_DELETED)                     ??  true,
        removed:    toBool(env.PUBLIC_HIDE_REMOVED)                     ??  false,
        keywords:                                                       false,
        keywordList:                                                    [],
        MBFCLowCredibility:                                             false,
        newAccounts:                                                    false,
        newAccountMinAge:                                               5,
        minimizeBotComments:                                            false,
        hideUsersFromBlockedInstances:                                  false,

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
        userDefinedInvidious:                                           [],
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
        'inv.nadeko.net',
        'inv.zzls.xyz',
        'invidious.incogniweb.net',
        'invidious.perennialte.ch',
        'invidious.privacyredirect.com',
        'anontube.lvkaszus.pl',
        'invidious.fdn.fr',
        'iv.datura.network',
        'iv.melmac.space',
        'invidious.asir.dev',
        'invidious.private.coffee',
        'iv.nboeck.de',
        'video.fosswelt.org',
        'yt.drgnz.club',
        'yt.oelrichsgarcia.de',
        'yt.artemislena.eu',
        'yt.whateveritworks.org',
        
        // Piped
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
        ...strToArray(env.PUBLIC_CUSTOM_INVIDIOUS),
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
    try {
        // Update legacy versions of user settings to the first controlled version
        if (!old.version) {
            // Change image size from string to object; populate with default vaules
            if (typeof old.imageSize == 'string') {
                delete old.imageSize;
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
            try { delete old.systemUI }
            catch {}
            old.version = 0.8
        }

        // 0.8 -> 0.9
        if (old.version == 0.8) {
            try { delete old.embeddedMedia.enabledSources}
            catch {}
            old.version = 0.9
        }

        if (old.version == 0.9) {
            try { delete old.uiState.fediseerBadges }
            catch {}
            old.version = 10
        }

        if (old.version == 10) {
            if (old?.embeddedMedia?.customPiped) delete old.embeddedMedia.customPiped
            if (old?.embeddedMedia?.userDefinedPiped) delete old.embeddedMedia.userDefinedPiped
            old.version = 11
        }

        if (old.version == 11) {
            try { delete old.imageSize }
            catch {}
            old.version = 12
        }

        if (old.version == 12) {
            // Cleanup some old settings keys that are no longer used and may still be present
            try { delete old.newComments }
            catch {}
            try { delete old.newVote }
            catch {}
            try { delete old.revertColors}
            catch {}
            try { delete old.showEmbeds }
            catch {}
            try { delete old.youtubeFrontend }
            catch {}

            old.version = 13
        }
    }
    catch (err) {
        console.log("Error during settings migration:", err)
        return defaultSettings
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
        uiState:        {...defaultSettings.uiState, ...old.uiState},
        proxyMedia:     {...defaultSettings.proxyMedia, ...old.proxyMedia}
    }
}

