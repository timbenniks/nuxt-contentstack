import { Region } from '@contentstack/delivery-sdk'
import type { IConfigEditButton } from '@contentstack/live-preview-utils/dist/legacy/utils/types'

export type LivePreviewSdkOptions = {
  ssr?: boolean
  editableTags?: boolean
  runScriptsOnUpdate?: boolean
  cleanCslpOnProduction?: boolean
  enable?: boolean
  debug?: boolean
  clientUrlParams?: {
    host: string
  }
  editButton?: IConfigEditButton
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
        personalize: 'personalize-edge-api.contentstack.com',
      }

      break

    case Region.EU:
      urls = {
        app: 'eu-app.contentstack.com',
        preview: 'eu-rest-preview.contentstack.com',
        personalize: 'eu-personalize-edge-api.contentstack.com',
      }

      break
  }

  return urls
}
