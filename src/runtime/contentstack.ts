import contentstack from '@contentstack/delivery-sdk'
import ContentstackLivePreview, { type IStackSdk } from '@contentstack/live-preview-utils'
import { defineNuxtPlugin, useState, useRequestEvent } from '#imports'
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

const contentstackPlugin = async (_nuxtApp: any) => {
  const { deliverySdkOptions, livePreviewSdkOptions, personalizeSdkOptions } = _nuxtApp.$config.public.contentstack as {
    deliverySdkOptions: DeliverySdkOptions
    livePreviewSdkOptions: LivePreviewSdkOptions
    personalizeSdkOptions?: PersonalizeSdkOptions
  }

  const stack = contentstack.stack(convertToStackConfig(toRaw(deliverySdkOptions)))
  const livePreviewEnabled = deliverySdkOptions?.live_preview?.enable
  const { editableTags } = livePreviewSdkOptions
  const personalizationEnabled = personalizeSdkOptions?.enable ?? false
  const personalizationHost = personalizeSdkOptions?.host ?? ''
  const personalizationProjectUid = personalizeSdkOptions?.projectUid ?? ''

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
        ContentstackLivePreview: ContentstackLivePreview as typeof ContentstackLivePreview,
        Personalize: PersonalizeModule,
        variantAlias,
        VB_EmptyBlockParentClass: VB_EmptyBlockParentClass as string,
      },
    },
  }
}

export default defineNuxtPlugin(contentstackPlugin)
