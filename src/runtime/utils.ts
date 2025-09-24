import type { StackConfig } from '@contentstack/delivery-sdk'
import {
  getRegionForString,
  getContentstackEndpoints,
} from '@timbenniks/contentstack-endpoints'

export type Region = 'us' | 'eu' | 'au' | 'azure-na' | 'azure-eu' | 'gcp-na' | 'gcp-eu'

export type DeliverySdkOptions = Omit<StackConfig, 'region'> & {
  region?: Region
}

export type LivePreviewSdkOptions = {
  ssr?: boolean
  editableTags?: boolean
  runScriptsOnUpdate?: boolean
  cleanCslpOnProduction?: boolean
  enable?: boolean
  mode: 'builder' | 'preview'
  debug?: boolean
  clientUrlParams?: {
    host?: string
  }
  editButton?: {
    enable: boolean
    exclude?: ('insideLivePreviewPortal' | 'outsideLivePreviewPortal')[]
    includeByQueryParameter?: boolean
    position?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center'
  }
}

export type PersonalizeSdkOptions = {
  enable: boolean
  projectUid?: string
  host?: string
}

export function getURLsforRegion(region?: Region) {
  return getContentstackEndpoints(getRegionForString(region || 'eu'), true)
}

/**
 * Replaces Contentstack Live Preview (CSLP) '$' keys with 'cslp' keys in nested objects
 * This is useful for cleaning up data structure for frontend consumption
 */
export function replaceCslp(obj: Record<string, unknown> | unknown[]): Record<string, unknown> | unknown[] {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => replaceCslp(item as Record<string, unknown> | unknown[]))
  }

  const newObj: Record<string, unknown> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (key === '$') {
        newObj['cslp'] = replaceCslp(obj[key] as Record<string, unknown> | unknown[])
      }
      else {
        newObj[key] = replaceCslp(obj[key] as Record<string, unknown> | unknown[])
      }
    }
  }
  return newObj
}
