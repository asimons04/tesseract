interface SessionStorage {
    lastSeenCommunity?: {
        id: number
        name: string
    }
    postDraft?:{
        community: number | null
        title: string
        body: string
        image: FileList | null
        url: string | undefined
        nsfw: boolean
        loading: boolean
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

export const getSessionStorage = (key: keyof SessionStorage): SessionStorage[typeof key] => {
    return JSON.parse(sessionStorage.getItem(key)!)
}
