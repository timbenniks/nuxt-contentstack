export default defineNuxtConfig({
  'compatibilityDate': '2025-08-31',
  'devtools': { enabled: true },
  'modules': ['../src/module', '@nuxt/image', '@nuxt/devtools'],

  'nuxt-contentstack': {
    // Required core settings
    apiKey: process.env.NUXT_CONTENTSTACK_API_KEY as string,
    deliveryToken: process.env.NUXT_CONTENTSTACK_DELIVERY_TOKEN as string,
    environment: process.env.NUXT_CONTENTSTACK_ENVIRONMENT as string,
    region: 'eu',

    // Optional core settings
    branch: 'main',
    locale: 'en-us',

    // Live Preview settings (simplified)
    livePreview: {
      enable: process.env.NUXT_CONTENTSTACK_PREVIEW === 'true',
      previewToken: process.env.NUXT_CONTENTSTACK_PREVIEW_TOKEN as string,
      editableTags: true,
      editButton: true,
      mode: 'builder'
    },

    // Personalization settings (simplified)
    personalization: {
      enable: false,
      // projectUid: 'your-project-uid'
    },

    // General settings
    debug: true
  },

  // Configure @nuxt/image to use Contentstack provider by default
  image: {
    // provider: 'contentstack', // Will be registered by the module
  },
})
