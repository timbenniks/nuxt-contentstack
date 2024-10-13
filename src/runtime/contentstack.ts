import contentstack from '@contentstack/delivery-sdk'
import { ContentstackLivePreview, type IStackSdk } from '@contentstack/live-preview-utils'
import type { Plugin } from 'nuxt/app'
import type { LivePreviewSdkOptions, DeliverySdkOptions } from '../utils'
import { defineNuxtPlugin } from '#app'

const contentstackPlugin: Plugin = (_nuxtApp) => {
  // @ts-expect-error Region is seen as String rather than Region...
  const { deliverySdkOptions, livePreviewSdkOptions }: {
    deliverySdkOptions: DeliverySdkOptions
    livePreviewSdkOptions: LivePreviewSdkOptions
  } = _nuxtApp.$config.public.contentstack

  const stack = contentstack.stack(deliverySdkOptions)
  const livePreviewEnabled = deliverySdkOptions?.live_preview?.enable
  const { editableTags } = livePreviewSdkOptions

  if (livePreviewEnabled) {
    ContentstackLivePreview.init({
      ...livePreviewSdkOptions,
      stackSdk: stack.config as IStackSdk,
      stackDetails: {
        apiKey: deliverySdkOptions.apiKey,
        environment: deliverySdkOptions.environment,
      },
    })
  }

  return {
    provide: {
      contentstack: {
        livePreviewEnabled,
        editableTags,
        stack,
        ContentstackLivePreview,
      },
    },
  }
}

export default defineNuxtPlugin(contentstackPlugin)
