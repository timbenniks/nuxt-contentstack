import { Region } from '@contentstack/delivery-sdk'

export default defineNuxtConfig({
  'modules': ['../src/module'],
  'devtools': { enabled: false },
  'compatibilityDate': '2024-11-13',

  'nuxt-contentstack': {
    debug: true,
    deliverySdkOptions: {
      apiKey: 'bltf1a2bb701d537d95',
      deliveryToken: 'csa5b6b7935b22e4f08772c1d0',
      region: Region.EU,
      environment: 'preview',
      live_preview: {
        preview_token: 'csd1571d7d8b2386120730db85',
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
      enable: true,
      projectUid: '671a14b9658bc90e1fa85cf5',
    },
  },
})
