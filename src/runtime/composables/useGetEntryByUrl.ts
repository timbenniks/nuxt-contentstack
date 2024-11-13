import contentstack, { QueryOperation } from '@contentstack/delivery-sdk'
import ContentstackLivePreview, { type IStackSdk } from '@contentstack/live-preview-utils'
import type { EmbeddedItem } from '@contentstack/utils/dist/types/Models/embedded-object'
import type { LivePreviewQuery } from '@contentstack/delivery-sdk'
import { toRaw } from 'vue'
import { useAsyncData, useNuxtApp, useRoute, type AsyncData } from '#app'

export const useGetEntryByUrl = async <T>(contentTypeUid: string, url: string, referenceFieldPath?: string[], jsonRtePath?: string[], locale: string = 'en-us'): Promise<AsyncData<T | null, Error>> => {
  const { editableTags, stack, livePreviewEnabled, variantAlias } = useNuxtApp().$contentstack as {
    editableTags: boolean
    stack: IStackSdk
    livePreviewEnabled: boolean
    variantAlias: { value: string }
  }

  if (livePreviewEnabled) {
    const route = useRoute()
    const qs = toRaw(route.query)
    stack.livePreviewQuery(qs as unknown as LivePreviewQuery)
  }

  const { data, status, refresh } = await useAsyncData(`${contentTypeUid}-${url}-${locale}-${variantAlias.value}`, async () => {
    let result: { entries: T[] } | null = null

    const entryQuery = stack.contentType(contentTypeUid)
      .entry()
      .locale(locale)
      .includeFallback()
      .includeEmbeddedItems()
      .includeReference(referenceFieldPath ?? [])

    entryQuery.addParams({ include_all: true })
    entryQuery.addParams({ include_dimension: true })
    entryQuery.addParams({ include_applied_variants: true })

    if (variantAlias && variantAlias.value !== '') {
      const variants = toRaw(variantAlias.value)
      entryQuery.variants(variants)
    }

    if (referenceFieldPath) {
      for (const path of referenceFieldPath) {
        entryQuery.includeReference(path)
      }
    }

    if (entryQuery) {
      console.log('query', entryQuery)

      result = await entryQuery.query()
        .where('url', QueryOperation.EQUALS, url)
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
  }

  // @ts-expect-error not all properties are outputted as they arent required.
  return { data, status, refresh }
}
