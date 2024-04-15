import { page } from '$app/stores'
import { get } from 'svelte/store'

/** Store data for the current page + params to session storage but one snapshot per key to avoid storage constraints */
export const PageSnapshot = {
   
    /** Stores the provided data object to storage under the key of the current page route*/
    capture: function(data:any):void {
        const Page = get(page)
        if (!page) return 
        
        const key = this.getKey()
        storage.session.set(key, data)    
    },

    /** Clears the current page's data from localStorage */
    clear: function(): void {
        const Page = get(page)
        if (!page) return
        
        const key = this.getKey()
        storage.session.remove(key)
    },

    getKey: function(): string {
        const Page = get(page)
        const path = Page.url.pathname != '/' && Page.url.pathname.endsWith('/')
            ? Page.url.pathname.substring(0, Page.url.pathname.length-1)
            : Page.url.pathname

        return 'tesseract_snapshots_' + path
    },

    /** Returns the stored data object from localStorage for the key of the current page route */
    restore: function(): any {
        const Page = get(page)
        if (!page) return {}
        
        const key = this.getKey()
        const snapshot = storage.session.get(key)
        
        if (snapshot) return snapshot
        else return {}
    }
}

// Low-level basic local and sessionstorage functions. 

export const storage = {
    session: {
    
        remove: function (key:string): void {
            try {
                //localStorage.removeItem(key)
                sessionStorage.removeItem(key)
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
                //const value = localStorage.getItem(key)
                const value = sessionStorage.getItem(key)
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
                //localStorage.setItem(key, JSON.stringify(value))
                sessionStorage.setItem(key, JSON.stringify(value))
                return true
            }
            catch (err) {
                console.error(err);
                return false
            }
        }
    },

    local: {
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
}