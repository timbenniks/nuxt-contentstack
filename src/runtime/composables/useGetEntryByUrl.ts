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

export const useGetEntryByUrl = async <T>(options: {
  contentTypeUid: string
  url: string
  referenceFieldPath?: string[]
  jsonRtePath?: string[]
  locale?: string
  replaceHtmlCslp?: boolean
}): Promise<AsyncData<T | null, Error>> => {
  const {
    contentTypeUid,
    url,
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

  const { data, status, refresh } = await useAsyncData(`${contentTypeUid}-${url}-${locale}-${variantAlias?.value ? variantAlias.value : ''}`, async () => {
    try {
      setupLivePreview(stack, livePreviewEnabled)

      const entryQuery = stack.contentType(contentTypeUid)
        .entry()
        .locale(locale)
        .includeFallback()
        .includeEmbeddedItems()

      applyVariants(entryQuery, variantAlias)
      applyReferenceFields(entryQuery, referenceFieldPath)

      const result = await entryQuery.query()
        .equalTo('url', url)
        .find() as { entries: any[] }

      const entryData = result?.entries?.[0]

      return processEntryData(entryData, {
        contentTypeUid,
        locale,
        jsonRtePath,
        editableTags,
        shouldReplaceCslp: shouldReplaceCslpValue,
      }) as T
    }
    catch (error) {
      const contentstackError = handleContentstackError(error, 'useGetEntryByUrl')
      logContentstackError(contentstackError)
      return null
    }
  })

  setupLivePreviewRefresh(livePreviewEnabled, refresh)

  // @ts-expect-error doesnt export all useAsyncData props
  return { data, status, refresh }
}
