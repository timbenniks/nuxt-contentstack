export default defineNuxtConfig({
  'compatibilityDate': '2025-08-31',
  'devtools': {
    enabled: false,
  },
  'modules': ['@nuxt/image', '../src/module', '@nuxt/devtools'],

  'nuxt-contentstack': {
    // Required core settings
    apiKey: process.env.NUXT_CONTENTSTACK_API_KEY as string,
    deliveryToken: process.env.NUXT_CONTENTSTACK_DELIVERY_TOKEN as string,
    environment: process.env.NUXT_CONTENTSTACK_ENVIRONMENT as string,
    region: process.env.NUXT_CONTENTSTACK_REGION as string,

    // Optional core settings
    branch: 'main',
    locale: 'en-us',

    // Live Preview settings (simplified)
    livePreview: {
      enable: process.env.NUXT_CONTENTSTACK_PREVIEW === 'true',
      previewToken: process.env.NUXT_CONTENTSTACK_PREVIEW_TOKEN as string,
      editableTags: true,
      editButton: true,
      mode: 'builder',
      ssr: false
    },

    debug: true
  },

  image: {
    providers: {
      contentstack: {
        name: 'contentstack',
        provider: '../dist/runtime/providers/contentstack.ts'
      }
    }
  }
})
