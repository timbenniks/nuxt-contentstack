import { useAsyncData } from '#imports'
import type { AsyncData, NuxtError } from 'nuxt/app'
import {
  setupLivePreview,
  applyVariants,
  applyReferenceFields,
  processEntryData,
  setupLivePreviewRefresh,
  shouldReplaceCslp,
} from './utils'
import { useContentstack } from './useContentstack'
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
}): Promise<AsyncData<T | null, NuxtError<unknown> | undefined>> => {
  const {
    contentTypeUid,
    entryUid,
    referenceFieldPath = [],
    jsonRtePath = [],
    locale = DEFAULT_LOCALE,
    replaceHtmlCslp,
  } = options

  const { editableTags, stack, livePreviewEnabled, variantAlias } = useContentstack()

  const shouldReplaceCslpValue = shouldReplaceCslp(editableTags, replaceHtmlCslp)

  const asyncData = await useAsyncData(`${contentTypeUid}-${entryUid}-${locale}-${variantAlias?.value ? variantAlias.value : ''}`, async () => {
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
  }, {
    default: () => null,
  })

  setupLivePreviewRefresh(livePreviewEnabled, asyncData.refresh)

  return asyncData as AsyncData<T | null, NuxtError<unknown> | undefined>
}
