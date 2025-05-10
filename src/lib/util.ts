import { goto } from '$app/navigation'
import { toast } from '$lib/components/ui/toasts/toasts.js'

import { userSettings } from '$lib/settings.js'
import { get, writable } from 'svelte/store'

export const findClosestNumber = (numbers: number[], target: number): number =>
  numbers.reduce((prev, curr) =>
    Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev
  )

export const searchParam = (url: URL, key: string|undefined, value: string, ...deleteKeys: string[] ) => {
    if (key) url.searchParams.set(key, value)
    deleteKeys.forEach((k) => url.searchParams.delete(k))
    goto(url, {
        invalidateAll: true,
    })
}

export const fullCommunityName = (name: string, actorId: string) => `${name}@${new URL(actorId).hostname}`


export function moveItem<T>(array: T[], currentIndex: number, newIndex: number): T[] {
    if ( currentIndex < 0 || currentIndex >= array.length || newIndex < 0 || newIndex >= array.length ) {
        throw new Error('Invalid index')
    }

    const newArray = [...array]

    // Remove the item from the current index
    const [item] = newArray.splice(currentIndex, 1)

    // Insert the item at the new index
    newArray.splice(newIndex, 0, item)

    return newArray
}

type Maybe<T> = T | undefined | void | null

export const trycatch = <T>(func: () => T): Maybe<T> => {
    try {
        return func()
    } 
    catch (err) {
        toast({
            content: err as any,
            type: 'error',
        })
    }
}

export const removeItem = <T>(array: T[], predicate: (item: T) => boolean) => {
    array.splice(array.findIndex(predicate), 1)
}

// Generates an array of numbers between start and stop.
export const arrayRange = (start:number, stop:number, step:number=1) => 
    Array.from( { length: (stop - start) / step + 1 }, (value, index) => start + index * step );

// Deep copy an object or array
export const objectCopy = function(input:any): any {
    try {
        return JSON.parse(JSON.stringify(input))
    }
    catch (err) {
        console.log(err);
        return {}
    }
}

export function capitalizeFirstLetter(string:string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Svelte-Gestures Types

export interface SvelteGesturePinchEvent extends CustomEvent {
    detail: {
        scale: number
        center: {
            x: number
            y: number
        }
    }
}

export interface SvelteGesturePressEvent extends CustomEvent {
    detail: {
        x: number
        y: number
        pointerType?: 'touch' | 'mouse' | 'pen'
        target: EventTarget
    }
}


export interface SvelteGestureSwipeEvent extends CustomEvent {
    detail: {
        direction: 'top' | 'right' | 'bottom' | 'left',
        target: EventTarget
    }
}

