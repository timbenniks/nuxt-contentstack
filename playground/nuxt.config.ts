import { Region } from '@contentstack/delivery-sdk'

export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  compatibilityDate: '2024-10-12',

  contentstack: {
    debug: true,
    deliverySdkOptions: {
      apiKey: 'blte766efb491f96715',
      deliveryToken: 'cs620decb0e6bb175e31210ce9',
      region: Region.EU,
      environment: 'preview',
      live_preview: {
        preview_token: 'csa128deacffe0b26386090915',
        enable: true,
      },
    },
    livePreviewSdkOptions: {
      editableTags: true,
      editButton: {
        enable: true,
      },
    },
  },
})
