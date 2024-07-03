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
    declare const __VERSION__: string
    declare const __CODENAME__: string  
}

export {}
declare const __VERSION__: string
declare const __CODENAME__: string
