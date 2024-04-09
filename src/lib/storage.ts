import { page } from '$app/stores'
import { get } from 'svelte/store'

const LS_KEY = 'tesseract_snapshots'

/** Store data for the current page + params to localStorage */
export const PageSnapshot = {
   
    /** Stores the provided data object to localStorage under the key of the current page route + params */
    capture: function(data:any):void {
        const Page = get(page)
        if (!page) return 
        
        const key = Page.url.pathname 
        //+ '?' + Page.url.searchParams.toString()

        let snapshots = storage.get(LS_KEY)
        
        if (snapshots) {
            snapshots[key] = data
            storage.set(LS_KEY, snapshots)
        }
        else {
            snapshots = {}
            snapshots[key] = data
            storage.set(LS_KEY, snapshots)
        }
    },

    /** Clears the current page's data from localStorage */
    clear: function(): void {
        const Page = get(page)
        if (!page) return undefined
        
        const key = Page.url.pathname 
        // + '?' + Page.url.searchParams.toString()
        
        let snapshots = storage.get(LS_KEY)
        if (snapshots) delete snapshots[key]
    },

    /** Deletes all Tesseract snapshots in LocalStorage */
    clearAll: function(): void {
        storage.remove(LS_KEY)
    },

    /** Returns the stored data object from localStorage for the key of the current page route + params */
    restore: function(): any {
        const Page = get(page)
        if (!page) return {}
        
        const key = Page.url.pathname 
        // + '?' + Page.url.searchParams.toString()
        let snapshots = storage.get(LS_KEY)
        
        if (snapshots && key in snapshots) return snapshots[key]
        else return {}
    }
}

// Low-level basic local storage functions. 
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