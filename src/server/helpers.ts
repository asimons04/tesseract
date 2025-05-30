export function isImage  (url: string | undefined) {
    try {
        if (!url) return false
        if (/\.(avif|jpeg|jpg|gif|apng|png|img|svg|bmp|webp)$/i.test(new URL(url).href)) return true
        if (/\.(avif|jpeg|jpg|gif|apng|png|img|svg|bmp|webp)\??/i.test(new URL(url).href)) return true
    }
    catch {
        return false
    }

}

// Check if provided URL is a video
export function isVideo (inputUrl: string | undefined) {
    try {
        if (!inputUrl) return false
        const url = new URL(inputUrl).pathname.toLowerCase()
        return url.endsWith('mp4') || url.endsWith('webm') || url.endsWith('mov') || url.endsWith('m4v') || url.endsWith('ogv')
    }
    catch {
        return false
    }
}

export const isAudio = (inputUrl: string | undefined) => {
    try {
        if (!inputUrl) return false
        const testURL = new URL(inputUrl)
        return /\.(mp3|oga|opus|aac)$/i.test(testURL.href)
    }
    catch {
        return false
    }
}


// Check if user agent string belongs to a browser
export function isBrowserUA(ua?:string) {
    if (!ua) return false
    const browserList = ['Mozilla', 'Tesseract']
    for (let item of browserList) {
        if (ua.toLowerCase().startsWith(item.toLowerCase())) return true
    }
    return false

}