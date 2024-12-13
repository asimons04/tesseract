import type { Community } from 'lemmy-js-client'

interface SessionStorage {
    postDraft?:{
        community?: Community
        name: string
        body: string
        image: FileList | null
        url: string | undefined
        nsfw: boolean
        loading: boolean
        alt_text?: string
    }
    lastClickedPost?: {
        postID: number | undefined
    }
}

export const setSessionStorage = (key: keyof SessionStorage, value: SessionStorage[typeof key]) => {
    if (value == undefined) {
        sessionStorage.removeItem(key)
    } else {
        sessionStorage.setItem(key, JSON.stringify(value))
    }
}

export const getSessionStorage = (key: keyof SessionStorage): SessionStorage => {
    return JSON.parse(sessionStorage.getItem(key)!)
}
