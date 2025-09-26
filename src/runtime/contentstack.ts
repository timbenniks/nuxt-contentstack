import contentstack from '@contentstack/delivery-sdk'
import ContentstackLivePreview, { type IStackSdk } from '@contentstack/live-preview-utils'
import type { Plugin } from 'nuxt/app'
import Personalize from '@contentstack/personalize-edge-sdk'
import { defineNuxtPlugin, useState, useRequestEvent } from '#app'
import { getRegionForString } from '@timbenniks/contentstack-endpoints'
import type { StackConfig } from '@contentstack/delivery-sdk'
import type { LivePreviewSdkOptions, DeliverySdkOptions, PersonalizeSdkOptions } from './utils'
import { VB_EmptyBlockParentClass } from '@contentstack/live-preview-utils'
import { trackDevToolsLivePreview } from './devtools/utils'

// Utility function
function convertToStackConfig(options: DeliverySdkOptions): StackConfig {
  const { region, ...rest } = options
  return {
    ...rest,
    region: getRegionForString(region || 'eu'),
  } as StackConfig
}

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

  const stack = contentstack.stack(convertToStackConfig(deliverySdkOptions))
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

    // Track Live Preview initialization for DevTools
    trackDevToolsLivePreview({
      type: 'initialization',
      connected: true,
      enabled: true,
      mode: livePreviewSdkOptions.mode || 'builder',
      timestamp: new Date().toISOString()
    })

    // Listen for Live Preview events
    if (typeof ContentstackLivePreview.onEntryChange === 'function') {
      const originalOnEntryChange = ContentstackLivePreview.onEntryChange
      ContentstackLivePreview.onEntryChange = (callback: any) => {
        const wrappedCallback = (...args: any[]) => {
          const data = args[0]
          // Track the Live Preview update
          trackDevToolsLivePreview({
            type: 'entry_updated',
            uid: data?.uid || 'unknown',
            content_type: data?.content_type_uid || 'unknown',
            action: 'updated',
            timestamp: new Date().toISOString()
          })

          // Call the original callback with all arguments
          return callback(...args)
        }
        return originalOnEntryChange(wrappedCallback)
      }
    }
  } else if (livePreviewEnabled) {
    // Live Preview is enabled but we're on server side
    trackDevToolsLivePreview({
      type: 'status',
      connected: false,
      enabled: true,
      mode: livePreviewSdkOptions.mode || 'builder',
      timestamp: new Date().toISOString()
    })
  } else {
    // Live Preview is disabled
    trackDevToolsLivePreview({
      type: 'status',
      connected: false,
      enabled: false,
      mode: 'preview',
      timestamp: new Date().toISOString()
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
}

export default defineNuxtPlugin(contentstackPlugin)
