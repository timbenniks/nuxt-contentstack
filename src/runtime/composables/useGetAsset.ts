import { useAsyncData, type AsyncData } from '#app'
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
}): Promise<AsyncData<T | null, Error>> => {
  const {
    assetUid,
    locale = DEFAULT_LOCALE,
  } = options

  const { stack, livePreviewEnabled } = useContentstack()

  const { data, status, refresh } = await useAsyncData(`asset-${assetUid}-${locale}`, async () => {
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
  })

  setupLivePreviewRefresh(livePreviewEnabled, refresh)

  // @ts-expect-error doesnt export all useAsyncData props
  return { data, status, refresh }
}
