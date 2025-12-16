import contentstack from '@contentstack/delivery-sdk'
import ContentstackLivePreview, { type IStackSdk } from '@contentstack/live-preview-utils'
import { defineNuxtPlugin, useState, useRequestEvent, type Plugin } from '#app'
import { getRegionForString } from '@timbenniks/contentstack-endpoints'
import type { StackConfig } from '@contentstack/delivery-sdk'
import type { LivePreviewSdkOptions, DeliverySdkOptions, PersonalizeSdkOptions } from './utils'
import { VB_EmptyBlockParentClass } from '@contentstack/live-preview-utils'
import { toRaw } from 'vue'
import { DEFAULT_REGION } from './constants'

// Utility function
function convertToStackConfig(options: DeliverySdkOptions): StackConfig {
  const { region, ...rest } = options
  return {
    ...rest,
    region: getRegionForString(region || DEFAULT_REGION),
  } as StackConfig
}

const contentstackPlugin: Plugin = async (_nuxtApp) => {
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

  // Handle personalization only on server
  let PersonalizeModule: any = null
  if (import.meta.server && personalizationEnabled && personalizationProjectUid) {
    try {
      PersonalizeModule = (await import('@contentstack/personalize-edge-sdk')).default
      PersonalizeModule.setEdgeApiUrl(`https://${personalizationHost}`)
      PersonalizeModule.init(personalizationProjectUid)

      const event = useRequestEvent()
      variantAlias.value = event?.context.p13n
    } catch (error) {
      console.error('Failed to initialize personalization:', error)
    }
  }

  return {
    provide: {
      contentstack: {
        livePreviewEnabled,
        editableTags,
        stack,
        ContentstackLivePreview,
        Personalize: PersonalizeModule,
        variantAlias,
        VB_EmptyBlockParentClass,
      },
    },
  }
}

export default defineNuxtPlugin(contentstackPlugin)
