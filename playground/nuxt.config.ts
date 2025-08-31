export default defineNuxtConfig({
  'compatibilityDate': '2025-08-31',
  'devtools': { enabled: false },
  'modules': ['../src/module'],

  'nuxt-contentstack': {
    debug: true,
    deliverySdkOptions: {
      apiKey: 'blt30ae6df7e6f1c9d7',
      deliveryToken: 'cs53e450f09a48db7a8341d40f',
      region: 'eu',
      environment: 'development',
      live_preview: {
        preview_token: 'cseaec9b60f755fa1f7ead4b78',
        enable: true,
      },
    },
    livePreviewSdkOptions: {
      editableTags: true,
      mode: 'builder',
      editButton: {
        enable: true,
      },
    },
    personalizeSdkOptions: {
      enable: false,
      projectUid: '',
    },
  },
})
