import ContentstackLivePreview from '@contentstack/live-preview-utils'
import { useAsyncData, useNuxtApp, type AsyncData } from '#app'
import type { Stack } from '@contentstack/delivery-sdk'
/**
 * Composable to fetch a single asset by its UID
 */
export const useGetAsset = async <T = any>(options: {
  assetUid: string
  locale?: string
}): Promise<AsyncData<T | null, Error>> => {
  const {
    assetUid,
    locale = 'en-us',
  } = options

  const { stack, livePreviewEnabled } = useNuxtApp().$contentstack as {
    stack: Stack
    livePreviewEnabled: boolean
  }

  const { data, status, refresh } = await useAsyncData(`asset-${assetUid}-${locale}`, async () => {
    try {
      const assetQuery = stack.asset(assetUid)
        .locale(locale)
        .includeFallback()

      const result = await assetQuery.fetch()
      return result as T
    }
    catch (error) {
      console.error('Error fetching asset:', error)
      return null
    }
  })

  if (livePreviewEnabled) {
    if (import.meta.client) {
      ContentstackLivePreview.onEntryChange(refresh)
    }
  }

  // @ts-expect-error doesnt export all useAsyncData props
  return { data, status, refresh }
}
