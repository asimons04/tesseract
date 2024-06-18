// In-memory cache
interface IDictionary {
    [index: string]: {
        value: string,
        ttl: number
    }
}

let store = {} as IDictionary
let defaultTTL:number = 3600

export const cache = {
    store: store,

    delete: function(key:string) {
        delete store[key];
    },
    
    get: function(key:string) {
        if (store[key]) {
            return store[key].value;
        }
    },

    flush: function() {
        store = {} as IDictionary
    },
    
    length: function() {
        return store.length;
    },

    set: function(key:string, value:string, ttl:number=defaultTTL) {
        store[key] = {
            value:value,
            ttl: ttl
        };
    },

    tick: function() {
        for (const key of Object.keys(store)) {
            store[key].ttl--;
    
            if (store[key].ttl < 0) {
                delete store[key];
            }
        }
    },
    
    ttl: function(key:string, seconds?:number) {
        if (store[key] && seconds) {
            store[key].ttl = seconds;
            return true;
        }
        
        if (!store[key]) {
            return false;
        }
        
        if (store[key] && !seconds) {
            return store[key].ttl;
        }
        
        return false;
    }

}

