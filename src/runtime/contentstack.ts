import contentstack from '@contentstack/delivery-sdk'
import ContentstackLivePreview, { type IStackSdk } from '@contentstack/live-preview-utils'
import type { Plugin } from 'nuxt/app'
import Personalize from '@contentstack/personalize-edge-sdk'
import type { LivePreviewSdkOptions, DeliverySdkOptions, PersonalizeSdkOptions } from '../utils'
import { defineNuxtPlugin, useState, useRequestEvent } from '#app'

const contentstackPlugin: Plugin = (_nuxtApp) => {
  const { deliverySdkOptions, livePreviewSdkOptions, personalizeSdkOptions }: {
    deliverySdkOptions: DeliverySdkOptions
    livePreviewSdkOptions: LivePreviewSdkOptions
    personalizeSdkOptions: PersonalizeSdkOptions
  } = _nuxtApp.$config.public.contentstack as {
    deliverySdkOptions: DeliverySdkOptions
    livePreviewSdkOptions: LivePreviewSdkOptions
    personalizeSdkOptions: PersonalizeSdkOptions
  }

  const stack = contentstack.stack(deliverySdkOptions)
  const livePreviewEnabled = deliverySdkOptions?.live_preview?.enable
  const { editableTags } = livePreviewSdkOptions
  const { enable: personalizationEnabled, host: personalizationHost, projectUid: personalizationProjectUid } = personalizeSdkOptions

  if (livePreviewEnabled && import.meta.client) {
    ContentstackLivePreview.init({
      ...livePreviewSdkOptions,
      stackSdk: stack.config as IStackSdk,
      stackDetails: {
        apiKey: deliverySdkOptions.apiKey,
        environment: deliverySdkOptions.environment,
      },
    })
  }

  const variantAlias = useState('variantAlias', () => '')

  if (personalizationEnabled && personalizationProjectUid) {
    Personalize.setEdgeApiUrl(`https://${personalizationHost}`)
    Personalize.init(personalizationProjectUid)

    if (import.meta.server) {
      const event = useRequestEvent()
      variantAlias.value = event?.context.p13n
    }
  }

  return {
    provide: {
      contentstack: {
        livePreviewEnabled,
        editableTags,
        stack,
        ContentstackLivePreview,
        Personalize,
        variantAlias,
      },
    },
  }
}

export default defineNuxtPlugin(contentstackPlugin)
