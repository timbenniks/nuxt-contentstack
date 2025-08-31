import contentstack from '@contentstack/delivery-sdk'
import ContentstackLivePreview, { type IStackSdk } from '@contentstack/live-preview-utils'
import type { EmbeddedItem } from '@contentstack/utils/dist/types/Models/embedded-object'
import { toRaw } from 'vue'
import { useAsyncData, useNuxtApp, type AsyncData } from '#app'

function replaceCslp(obj: Record<string, unknown> | unknown[]): Record<string, unknown> | unknown[] {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => replaceCslp(item as Record<string, unknown> | unknown[]))
  }

  const newObj: Record<string, unknown> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (key === '$') {
        newObj['cslp'] = replaceCslp(obj[key] as Record<string, unknown> | unknown[])
      }
      else {
        newObj[key] = replaceCslp(obj[key] as Record<string, unknown> | unknown[])
      }
    }
  }
  return newObj
}

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
    replaceHtmlCslp = false,
  } = options

  const { editableTags, stack, livePreviewEnabled, variantAlias } = useNuxtApp().$contentstack as {
    editableTags: boolean
    stack: IStackSdk
    livePreviewEnabled: boolean
    variantAlias?: { value: string }
  }

  const { data, status, refresh } = await useAsyncData(`${contentTypeUid}-${url}-${locale}-${variantAlias?.value ? variantAlias.value : ''}`, async () => {
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
      if (replaceHtmlCslp) {
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
