export default defineNuxtConfig({
  'compatibilityDate': '2025-08-31',
  'devtools': { enabled: true },
  'modules': ['../src/module', '@nuxt/image'],

  'nuxt-contentstack': {
    // Required core settings
    apiKey: 'blte766efb491f96715',
    deliveryToken: 'cs472a3c0937285f8c943ce5f6',
    environment: 'preview',
    region: 'eu',

    // Optional core settings
    branch: 'main',
    locale: 'en-us',

    // Live Preview settings (simplified)
    livePreview: {
      enable: true,
      previewToken: 'csfe3a9b5ad7485d0baca60a45',
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
