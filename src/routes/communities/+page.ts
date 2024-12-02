import { get } from 'svelte/store'
import { instance, LINKED_INSTANCE_URL } from "$lib/instance.js";
import { redirect } from "@sveltejs/kit";

export const load = () => {
    throw redirect(300, `/communities/${get(instance)}`)
}