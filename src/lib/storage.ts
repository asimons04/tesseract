import { page } from '$app/stores'
import { get } from 'svelte/store'

/** Store data for the current page + params to localStorage */
export const snapshot = {
    /** Stores the provided data object to localStorage under the key of the current page route + params */
    capture: function(data:any):void {
        console.log("Capturing snapshot")
        const Page = get(page)
        if (!page) return

        const key = `snapshot_${Page.url.pathname}`
        // ?${Page.url.searchParams.toString()}`
        storage.set(key, data)
    },

    /** Clears the current page's data from localStorage */
    clear: function(): void {
        console.log("Clearing snapshot")
        const Page = get(page)
        if (!page) return undefined
        
        const key = `snapshot_${Page.url.pathname}`
        //?${Page.url.searchParams.toString()}`
        storage.remove(key)
    },

    /** Returns the stored data object from localStorage for the key of the current page route + params */
    restore: function(): any {
        console.log("Restoring snapshot")
        const Page = get(page)
        if (!page) return undefined
        
        const key = `snapshot_${Page.url.pathname}`
        //?${Page.url.searchParams.toString()}`
        return storage.get(key)
    }
}


export const storage = {
    remove: function (key:string): void {
        try {
            localStorage.removeItem(key)
            return
        }
        catch (err) {
            console.error(err)
            return
        }
    },
    
    get: function (key:string): any {
        if (!key) return
        
        try {
            const value = localStorage.getItem(key)
            if (value) return JSON.parse(value)
            return undefined
        }
        catch (err) {
            console.error(err)
            return undefined
        }
    },
    
    set: function (key: string, value: any): boolean {
        try {
            localStorage.setItem(key, JSON.stringify(value))
            return true
        }
        catch (err) {
            console.error(err);
            return false
        }
    }



}