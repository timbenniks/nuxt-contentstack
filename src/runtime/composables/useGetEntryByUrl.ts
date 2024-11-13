import contentstack, { QueryOperation } from '@contentstack/delivery-sdk'
import ContentstackLivePreview, { type IStackSdk } from '@contentstack/live-preview-utils'
import type { EmbeddedItem } from '@contentstack/utils/dist/types/Models/embedded-object'
import type { LivePreviewQuery } from '@contentstack/delivery-sdk'
import { toRaw } from 'vue'
import { replaceCslp } from '../../utils'
import { useAsyncData, useNuxtApp, useRoute, type AsyncData } from '#app'

export const useGetEntryByUrl = async <T>(options: {
  contentTypeUid: string
  url: string
  referenceFieldPath?: string[]
  jsonRtePath?: string[]
  locale?: string
  replaceHtmlCslp?: boolean
}): Promise<AsyncData<T | null, Error>> => {
  if (!options.locale) {
    options.locale = 'en-us'
  }

  if (!options.referenceFieldPath) {
    options.referenceFieldPath = []
  }

  if (!options.jsonRtePath) {
    options.jsonRtePath = []
  }

  if (!options.replaceHtmlCslp) {
    options.replaceHtmlCslp = false
  }

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

  const { data, status, refresh } = await useAsyncData(`${options.contentTypeUid}-${options.url}-${options.locale}-${variantAlias.value ? variantAlias.value : ''}`, async () => {
    let result = null

    const entryQuery = stack.contentType(options.contentTypeUid)
      .entry()
      .locale(options.locale)
      .includeFallback()
      .includeEmbeddedItems()

    entryQuery.addParams({ include_all: true })
    entryQuery.addParams({ include_dimension: true })
    entryQuery.addParams({ include_applied_variants: true })

    if (variantAlias && variantAlias.value !== '') {
      const variants = toRaw(variantAlias.value)
      entryQuery.variants(variants)
    }

    if (options.referenceFieldPath) {
      for (const path of options.referenceFieldPath) {
        entryQuery.includeReference(path)
      }
    }

    if (entryQuery) {
      result = await entryQuery.query()
        .where('url', QueryOperation.EQUALS, options.url)
        .find() as { entries: [] }

      const data = result?.entries && result?.entries?.[0] as unknown as EmbeddedItem

      if (options.jsonRtePath && data) {
        contentstack.Utils.jsonToHTML({
          entry: data,
          paths: options.jsonRtePath,
        })
      }

      if (editableTags) {
        contentstack.Utils.addEditableTags(data, options.contentTypeUid, true, options.locale)
      }

      let finalData

      if (options.replaceHtmlCslp) {
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
