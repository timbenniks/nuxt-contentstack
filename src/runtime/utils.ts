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
  return getContentstackEndpoints(getRegionForString(region || 'eu'))
}
