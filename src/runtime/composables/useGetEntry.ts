import contentstack, { type LivePreviewQuery } from '@contentstack/delivery-sdk'
import ContentstackLivePreview, { type IStackSdk } from '@contentstack/live-preview-utils'
import type { EmbeddedItem } from '@contentstack/utils/dist/types/Models/embedded-object'
import { toRaw } from 'vue'
import { useAsyncData, useNuxtApp, useRoute, type AsyncData } from '#app'
import { replaceCslp } from '../utils'

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
    locale = 'en-us',
    replaceHtmlCslp,
  } = options

  const { editableTags, stack, livePreviewEnabled, variantAlias } = useNuxtApp().$contentstack as {
    editableTags: boolean
    stack: IStackSdk
    livePreviewEnabled: boolean
    variantAlias?: { value: string }
  }

  // Only replace CSLP when editableTags is enabled, otherwise use user preference or default to false
  const shouldReplaceCslp = replaceHtmlCslp ?? editableTags

  const { data, status, refresh } = await useAsyncData(`${contentTypeUid}-${entryUid}-${locale}-${variantAlias?.value ? variantAlias.value : ''}`, async () => {
    const route = useRoute()
    const qs = { ...toRaw(route.query) }

    if (livePreviewEnabled && qs?.live_preview) {
      stack.livePreviewQuery(qs as unknown as LivePreviewQuery)
    }

    const entryQuery = stack.contentType(contentTypeUid)
      .entry(entryUid)
      .locale(locale)
      .includeFallback()
      .includeEmbeddedItems()

    if (variantAlias && variantAlias.value !== '') {
      const variants = toRaw(variantAlias.value)
      entryQuery.addParams({ include_applied_variants: true })
      entryQuery.addParams({ include_dimension: true })
      entryQuery.variants(variants)
    }

    if (referenceFieldPath && referenceFieldPath.length > 0) {
      for (const path of referenceFieldPath) {
        entryQuery.includeReference(path)
      }
    }

    try {
      const result = await entryQuery.fetch() as EmbeddedItem

      if (jsonRtePath && jsonRtePath.length > 0 && result) {
        contentstack.Utils.jsonToHTML({
          entry: result,
          paths: jsonRtePath,
        })
      }

      if (editableTags && result) {
        contentstack.Utils.addEditableTags(result, contentTypeUid, true, locale)
      }

      let finalData
      if (shouldReplaceCslp && result) {
        finalData = replaceCslp(result)
      }
      else {
        finalData = result
      }

      return finalData as T
    }
    catch (error) {
      console.error('Error fetching entry:', error)
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
