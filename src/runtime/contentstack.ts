import contentstack from '@contentstack/delivery-sdk'
import type { StackConfig } from '@contentstack/delivery-sdk'
import { ContentstackLivePreview, type IStackSdk } from '@contentstack/live-preview-utils'
import type { LivePreviewSdkOptions } from '../utils'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((_nuxtApp) => {
  const { deliverySdkOptions, livePreviewSdkOptions }: {
    deliverySdkOptions: StackConfig
    livePreviewSdkOptions: LivePreviewSdkOptions
  } = _nuxtApp.$config.public.contentstack

  const stack = contentstack.stack(deliverySdkOptions)
  const livePreviewEnabled = deliverySdkOptions.live_preview.enable
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
      livePreviewEnabled,
      editableTags,
      stack,
      ContentstackLivePreview,
    },
  }
})
