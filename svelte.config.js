import auto from '@sveltejs/adapter-auto';
import node from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: process.env.ADAPTER == 'node' ? node() : auto(),
        csrf: {
            checkOrigin: true,
        },
        csp: {
            directives: {
                'default-src':  ['self'],
                'connect-src':  ['*'],
                'manifest-src': ['self'],
                'img-src':      ['*', 'data:', 'blob:'],
                'script-src':   ['self'],
                'style-src':    ['self', 'unsafe-inline'],
                'form-action':  ['self'],
                'base-uri':     ['self'],
                'frame-src':    ['*'],
                'media-src':    ['*', 'data:'],
                'object-src':   ['none'],
            },
            mode: 'nonce'
        }
		
	},
};

export default config;
