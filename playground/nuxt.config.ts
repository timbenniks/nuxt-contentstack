import { Region } from '@contentstack/delivery-sdk'

export default defineNuxtConfig({
  'modules': ['../src/module'],
  'devtools': { enabled: true },
  'compatibilityDate': '2024-10-12',

  'nuxt-contentstack': {
    debug: true,
    deliverySdkOptions: {
      apiKey: 'blt34bdc2becb9eb935',
      deliveryToken: 'csd38b9b7f1076de03fc347531',
      region: Region.EU,
      environment: 'preview',
      live_preview: {
        preview_token: 'csa2fe339f6713f8a52eff086c',
        enable: true,
      },
    },
    livePreviewSdkOptions: {
      editableTags: true,
      editButton: {
        enable: true,
      },
    },
    personalizeSdkOptions: {
      enable: true,
      projectUid: '67054a4e564522fcfa170c43',
    },
  },
})
