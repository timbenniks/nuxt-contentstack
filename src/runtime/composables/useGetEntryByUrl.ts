import contentstack, { type LivePreviewQuery, type Stack } from '@contentstack/delivery-sdk'
import ContentstackLivePreview from '@contentstack/live-preview-utils'
import type { EmbeddedItem } from '@contentstack/utils/dist/types/Models/embedded-object'
import { toRaw } from 'vue'
import { useAsyncData, useNuxtApp, useRoute, type AsyncData } from '#app'
import { replaceCslp } from '../utils'

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
    locale = 'en-us',
    replaceHtmlCslp,
  } = options

  const { editableTags, stack, livePreviewEnabled, variantAlias } = useNuxtApp().$contentstack as {
    stack: Stack
    livePreviewEnabled: boolean
    editableTags: boolean
    variantAlias?: { value: string }
  }

  // Only replace CSLP when editableTags is enabled, otherwise use user preference or default to false
  const shouldReplaceCslp = replaceHtmlCslp ?? editableTags

  const { data, status, refresh } = await useAsyncData(`${contentTypeUid}-${url}-${locale}-${variantAlias?.value ? variantAlias.value : ''}`, async () => {
    let result: { entries: T[] } | null = null

    const route = useRoute()
    const qs = { ...toRaw(route.query) }

    if (livePreviewEnabled && qs?.live_preview) {
      stack.livePreviewQuery(qs as unknown as LivePreviewQuery)
    }


    const entryQuery = stack.contentType(contentTypeUid)
      .entry()
      .locale(locale)
      .includeFallback()
      .includeEmbeddedItems()
      .includeReference(referenceFieldPath ?? [])

    if (variantAlias && variantAlias.value !== '') {
      const variants = toRaw(variantAlias.value)

      entryQuery.addParams({ include_applied_variants: true })
      entryQuery.addParams({ include_dimension: true })
      entryQuery.variants(variants)
    }

    if (referenceFieldPath) {
      for (const path of referenceFieldPath) {
        entryQuery.includeReference(path)
      }
    }

    if (entryQuery) {
      result = await entryQuery.query()
        .equalTo('url', url)
        .find() as { entries: T[] }

      const data = result?.entries?.[0] as EmbeddedItem

      if (jsonRtePath && data) {
        contentstack.Utils.jsonToHTML({
          entry: data,
          paths: jsonRtePath,
        })
      }

      if (editableTags) {
        contentstack.Utils.addEditableTags(data, contentTypeUid, true, locale)
      }

      let finalData
      if (shouldReplaceCslp) {
        finalData = replaceCslp(data)
      }
      else {
        finalData = data
      }

      return finalData
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
