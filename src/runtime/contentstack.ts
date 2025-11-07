import contentstack from '@contentstack/delivery-sdk'
import ContentstackLivePreview, { type IStackSdk } from '@contentstack/live-preview-utils'
import Personalize from '@contentstack/personalize-edge-sdk'
import { defineNuxtPlugin, useState, useRequestEvent } from '#app'
import { getRegionForString } from '@timbenniks/contentstack-endpoints'
import type { StackConfig } from '@contentstack/delivery-sdk'
import type { LivePreviewSdkOptions, DeliverySdkOptions, PersonalizeSdkOptions } from './utils'
import { VB_EmptyBlockParentClass } from '@contentstack/live-preview-utils'
import { toRaw } from 'vue'

// Utility function
function convertToStackConfig(options: DeliverySdkOptions): StackConfig {
  const { region, ...rest } = options
  return {
    ...rest,
    region: getRegionForString(region || 'eu'),
  } as StackConfig
}

export default defineNuxtPlugin((_nuxtApp) => {
  const { deliverySdkOptions, livePreviewSdkOptions, personalizeSdkOptions }: {
    deliverySdkOptions: DeliverySdkOptions
    livePreviewSdkOptions: LivePreviewSdkOptions
    personalizeSdkOptions: PersonalizeSdkOptions
  } = _nuxtApp.$config.public.contentstack as {
    deliverySdkOptions: DeliverySdkOptions
    livePreviewSdkOptions: LivePreviewSdkOptions
    personalizeSdkOptions: PersonalizeSdkOptions
  }

  const stack = contentstack.stack(convertToStackConfig(toRaw(deliverySdkOptions)))
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
        VB_EmptyBlockParentClass,
      },
    },
  }
})
