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
  let personalizeSdk: any = null

  // Server: read variant alias from middleware (runtime/server/middleware/personalize.ts)
  // The middleware handles SDK init with the request object and cookie management.
  if (import.meta.server && personalizationEnabled) {
    const event = useRequestEvent()
    if (event?.context.p13n) {
      variantAlias.value = event.context.p13n
    }
  }

  // Client: initialize SDK instance for set(), triggerImpression(), triggerEvent()
  // The server middleware sets cookies via addStateToResponse(), so the client SDK
  // hydrates from cookies without an extra network call.
  if (import.meta.client && personalizationEnabled && personalizeSdkOptions?.projectUid) {
    try {
      const Personalize = (await import('@contentstack/personalize-edge-sdk')).default
      if (personalizeSdkOptions.host) {
        Personalize.setEdgeApiUrl(`https://${personalizeSdkOptions.host}`)
      }
      personalizeSdk = await Personalize.init(personalizeSdkOptions.projectUid)
    } catch (error) {
      console.error('Failed to initialize client-side personalization:', error)
    }
  }

  return {
    provide: {
      contentstack: {
        livePreviewEnabled,
        editableTags,
        stack,
        ContentstackLivePreview: ContentstackLivePreview as typeof ContentstackLivePreview,
        personalizeSdk,
        variantAlias,
        VB_EmptyBlockParentClass: VB_EmptyBlockParentClass as string,
      },
    },
  }
}

export default defineNuxtPlugin(contentstackPlugin)
