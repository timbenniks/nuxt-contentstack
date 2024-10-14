import { Region, type StackConfig } from '@contentstack/delivery-sdk'

export type DeliverySdkOptions = StackConfig

export type LivePreviewSdkOptions = {
  ssr?: boolean
  editableTags?: boolean
  runScriptsOnUpdate?: boolean
  cleanCslpOnProduction?: boolean
  enable?: boolean
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
