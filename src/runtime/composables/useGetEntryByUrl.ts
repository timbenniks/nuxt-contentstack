import contentstack from '@contentstack/delivery-sdk'
import ContentstackLivePreview from '@contentstack/live-preview-utils'
import type { EmbeddedItem } from '@contentstack/utils/dist/types/Models/embedded-object'
import type { LivePreviewQuery } from '@contentstack/delivery-sdk'
import { toRaw } from 'vue'
import { useRuntimeConfig, useAsyncData, useNuxtApp, useRoute, type AsyncData } from '#app'

export const useGetEntryByUrl = async <T>(contentTypeUid: string, url: string, referenceFieldPath?: string[], jsonRtePath?: string[], locale: string = 'en-us'): Promise<AsyncData<T | null, Error>> => {
  const { editableTags, stack, livePreviewEnabled, variantAlias } = useNuxtApp().$contentstack
  const { contentstack: opts } = useRuntimeConfig().public
  const route = useRoute()
  const qs = toRaw(route.query)

  const { data, status, refresh } = await useAsyncData(`${contentTypeUid}-${url}-${locale}`, async () => {
    let result: { entries: T[] } | null = null

    const entryQuery = stack.contentType(contentTypeUid)
      .entry()
      .locale(locale)
      .includeFallback()
      .includeEmbeddedItems()
      .includeReference(referenceFieldPath ?? [])

    if (variantAlias && variantAlias.value !== '') {
      const variants = toRaw(variantAlias.value)
      entryQuery.addParams({ include_applied_variants: true })
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

      return data
    }
  })

  if (livePreviewEnabled) {
    if (import.meta.client) {
      ContentstackLivePreview.onEntryChange(refresh)
    }

    if (opts.livePreviewSdkOptions.ssr) {
      stack.livePreviewQuery(qs as unknown as LivePreviewQuery)
    }
  }

  return { data, status, refresh }
}
