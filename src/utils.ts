import { Region, type StackConfig } from '@contentstack/delivery-sdk'

export type DeliverySdkOptions = StackConfig

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

export type Urls = {
  app?: string
  preview?: string
  personalize?: string
}

export function getURLsforRegion(region: Region = Region.US) {
  let urls: Urls = {}

  switch (region) {
    case Region.US:
      urls = {
        app: 'app.contentstack.com',
        preview: 'rest-preview.contentstack.com',
        personalize: 'personalize-edge.contentstack.com',
      }

      break

    case Region.EU:
      urls = {
        app: 'eu-app.contentstack.com',
        preview: 'eu-rest-preview.contentstack.com',
        personalize: 'eu-personalize-edge.contentstack.com',
      }

      break
  }

  return urls
}

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
