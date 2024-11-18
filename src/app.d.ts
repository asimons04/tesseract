/// <reference types="@sveltejs/kit" />
/// <reference types="svelte-gestures" />
declare global {
    
    namespace App {
        // interface Error {}
        interface Locals {
            instance?: string
        }
        // interface PageData {}
        // interface Platform {}
    }
    
    // Custom HTML prop extensions for our custom events so VSCode won't bitch and throw type errors
    declare namespace svelteHTML {
        interface HTMLProps<T> {
            "on:banUser"?:          (event: CustomEvent<number> & { target: EventTarget & T }) => any;
            "on:banCommunity"?:     (event: CustomEvent<number> & { target: EventTarget & T }) => any;
            "on:blockCommunity"?:   (event: CustomEvent<number> & { target: EventTarget & T }) => any;
            "on:blockInstance"?:    (event: CustomEvent<number> & { target: EventTarget & T }) => any;
            "on:blockUser"?:        (event: CustomEvent<number> & { target: EventTarget & T }) => any;
            "on:subscribe"?:        (event: CustomEvent<number> & { target: EventTarget & T }) => any;
        }
    }
    declare const __VERSION__: string
    declare const __CODENAME__: string  
    
    interface ReadableStream<R = any> {
        [Symbol.asyncIterator](): AsyncIterableIterator<R>;
    }
}



export {}
declare const __VERSION__: string
declare const __CODENAME__: string
