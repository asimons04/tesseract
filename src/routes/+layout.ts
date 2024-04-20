import { env } from '$env/dynamic/public'
export let ssr = false
//export let ssr = (env.PUBLIC_SSR_ENABLED?.toLowerCase() ?? 'false') == 'true'
