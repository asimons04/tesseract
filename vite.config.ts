import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig, type PluginOption } from 'vite'
import { SvelteKitPWA } from '@vite-pwa/sveltekit'

export default defineConfig({
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: '/',
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 3000000
      },
      manifest: {
        name: 'Tesseract for Lemmy',
        short_name: 'Tesseract',
        description: 'A Lemmy client designed with rich media in mind.',
        theme_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: 'logo_512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'masked any',
          },
        ],
        start_url: '/',
      },
    }),
  ],

  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version),
    __CODENAME__: JSON.stringify("Intrepid")
    
  },
})
