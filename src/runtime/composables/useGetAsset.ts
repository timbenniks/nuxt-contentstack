import { useAsyncData } from '#imports'
import type { AsyncData, NuxtError } from 'nuxt/app'
import { setupLivePreviewRefresh } from './utils'
import { useContentstack } from './useContentstack'
import { DEFAULT_LOCALE } from '../constants'
import { handleContentstackError, logContentstackError } from './error-handling'

/**
 * Composable to fetch a single asset by its UID
 */
export const useGetAsset = async <T = any>(options: {
  assetUid: string
  locale?: string
}): Promise<AsyncData<T | null, NuxtError<unknown> | undefined>> => {
  const {
    assetUid,
    locale = DEFAULT_LOCALE,
  } = options

  const { stack, livePreviewEnabled } = useContentstack()

  const asyncData = await useAsyncData(`asset-${assetUid}-${locale}`, async () => {
    try {
      const assetQuery = stack.asset(assetUid)
        .locale(locale)
        .includeFallback()

      const result = await assetQuery.fetch()
      return result as T
    }
    catch (error) {
      const contentstackError = handleContentstackError(error, 'useGetAsset')
      logContentstackError(contentstackError)
      return null
    }
  }, {
    default: () => null,
  })

  setupLivePreviewRefresh(livePreviewEnabled, asyncData.refresh)

  return asyncData as AsyncData<T | null, NuxtError<unknown> | undefined>
}
