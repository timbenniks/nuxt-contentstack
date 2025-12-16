import type { Stack } from '@contentstack/delivery-sdk'
import { useAsyncData, useNuxtApp, type AsyncData } from '#app'
import {
  setupLivePreview,
  applyVariants,
  applyReferenceFields,
  processEntryData,
  setupLivePreviewRefresh,
  shouldReplaceCslp,
} from './utils'
import { DEFAULT_LOCALE } from '../constants'
import { handleContentstackError, logContentstackError } from './error-handling'

/**
 * Composable to fetch a single entry by its UID
 */
export const useGetEntry = async <T>(options: {
  contentTypeUid: string
  entryUid: string
  referenceFieldPath?: string[]
  jsonRtePath?: string[]
  locale?: string
  replaceHtmlCslp?: boolean
}): Promise<AsyncData<T | null, Error>> => {
  const {
    contentTypeUid,
    entryUid,
    referenceFieldPath = [],
    jsonRtePath = [],
    locale = DEFAULT_LOCALE,
    replaceHtmlCslp,
  } = options

  const { editableTags, stack, livePreviewEnabled, variantAlias } = useNuxtApp().$contentstack as {
    stack: Stack
    livePreviewEnabled: boolean
    editableTags: boolean
    variantAlias?: { value: string }
  }

  const shouldReplaceCslpValue = shouldReplaceCslp(editableTags, replaceHtmlCslp)

  const { data, status, refresh } = await useAsyncData(`${contentTypeUid}-${entryUid}-${locale}-${variantAlias?.value ? variantAlias.value : ''}`, async () => {
    setupLivePreview(stack, livePreviewEnabled)

    const entryQuery = stack.contentType(contentTypeUid)
      .entry(entryUid)
      .locale(locale)
      .includeFallback()
      .includeEmbeddedItems()

    applyVariants(entryQuery, variantAlias)
    applyReferenceFields(entryQuery, referenceFieldPath)

    try {
      const result = await entryQuery.fetch() as any

      return processEntryData(result, {
        contentTypeUid,
        locale,
        jsonRtePath,
        editableTags,
        shouldReplaceCslp: shouldReplaceCslpValue,
      }) as T
    }
    catch (error) {
      const contentstackError = handleContentstackError(error, 'useGetEntry')
      logContentstackError(contentstackError)
      return null
    }
  })

  setupLivePreviewRefresh(livePreviewEnabled, refresh)

  // @ts-expect-error doesnt export all useAsyncData props
  return { data, status, refresh }
}
