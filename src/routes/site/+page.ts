import { LINKED_INSTANCE_URL } from "$lib/instance.js";
import { redirect } from "@sveltejs/kit";
import { getInstance } from '$lib/lemmy.js'


export const load = () => {
    if (LINKED_INSTANCE_URL) {
        throw redirect(300, `/site/${LINKED_INSTANCE_URL}`)
    }
    else {
        throw redirect(300, `/site/${getInstance()}`)
    }
}