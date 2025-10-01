import contentstack, { type LivePreviewQuery } from '@contentstack/delivery-sdk'
import ContentstackLivePreview, { type IStackSdk } from '@contentstack/live-preview-utils'
import type { EmbeddedItem } from '@contentstack/utils/dist/types/Models/embedded-object'
import { toRaw } from 'vue'
import { useAsyncData, useNuxtApp, useRoute, type AsyncData } from '#app'
import { replaceCslp } from '../utils'

/**
 * Composable to fetch multiple entries of a content type with optional filtering
 */
export const useGetEntries = async <T>(options: {
  contentTypeUid: string
  referenceFieldPath?: string[]
  jsonRtePath?: string[]
  locale?: string
  replaceHtmlCslp?: boolean
  limit?: number
  skip?: number
  orderBy?: string
  includeCount?: boolean
  where?: Record<string, any>
}): Promise<AsyncData<{ entries: T[]; count?: number } | null, Error>> => {
  const {
    contentTypeUid,
    referenceFieldPath = [],
    jsonRtePath = [],
    locale = 'en-us',
    replaceHtmlCslp,
    limit = 10,
    skip = 0,
    orderBy,
    includeCount = false,
    where = {},
  } = options

  const { editableTags, stack, livePreviewEnabled, variantAlias } = useNuxtApp().$contentstack as {
    editableTags: boolean
    stack: IStackSdk
    livePreviewEnabled: boolean
    variantAlias?: { value: string }
  }

  // Only replace CSLP when editableTags is enabled, otherwise use user preference or default to false
  const shouldReplaceCslp = replaceHtmlCslp ?? editableTags

  const cacheKey = `${contentTypeUid}-entries-${locale}-${limit}-${skip}-${JSON.stringify(where)}-${variantAlias?.value ? variantAlias.value : ''}`

  const { data, status, refresh } = await useAsyncData(cacheKey, async () => {
    const route = useRoute()
    const qs = { ...toRaw(route.query) }

    if (livePreviewEnabled && qs?.live_preview) {
      stack.livePreviewQuery(qs as unknown as LivePreviewQuery)
    }

    const entriesQuery = stack.contentType(contentTypeUid)
      .entry()
      .locale(locale)
      .includeFallback()
      .includeEmbeddedItems()
      .limit(limit)
      .skip(skip)

    if (variantAlias && variantAlias.value !== '') {
      const variants = toRaw(variantAlias.value)
      entriesQuery.addParams({ include_applied_variants: true })
      entriesQuery.addParams({ include_dimension: true })
      entriesQuery.variants(variants)
    }

    if (referenceFieldPath && referenceFieldPath.length > 0) {
      for (const path of referenceFieldPath) {
        entriesQuery.includeReference(path)
      }
    }

    if (orderBy) {
      entriesQuery.orderByAscending(orderBy)
    }

    if (includeCount) {
      entriesQuery.includeCount()
    }

    // Apply where conditions
    for (const [field, value] of Object.entries(where)) {
      if (Array.isArray(value)) {
        entriesQuery.containedIn(field, value)
      }
      else if (typeof value === 'object' && value !== null) {
        // Handle complex queries like { $gt: 5 }, { $exists: true }, etc.
        for (const [operator, operatorValue] of Object.entries(value)) {
          switch (operator) {
            case '$gt':
              entriesQuery.greaterThan(field, operatorValue)
              break
            case '$gte':
              entriesQuery.greaterThanOrEqualTo(field, operatorValue)
              break
            case '$lt':
              entriesQuery.lessThan(field, operatorValue)
              break
            case '$lte':
              entriesQuery.lessThanOrEqualTo(field, operatorValue)
              break
            case '$ne':
              entriesQuery.notEqualTo(field, operatorValue)
              break
            case '$exists':
              if (operatorValue) {
                entriesQuery.exists(field)
              }
              else {
                entriesQuery.notExists(field)
              }
              break
            case '$regex':
              entriesQuery.regex(field, operatorValue)
              break
            default:
              entriesQuery.equalTo(field, operatorValue)
          }
        }
      }
      else {
        entriesQuery.equalTo(field, value)
      }
    }

    try {
      const result = await entriesQuery.find() as { entries: EmbeddedItem[]; count?: number }

      if (jsonRtePath && jsonRtePath.length > 0 && result?.entries) {
        result.entries.forEach((entry) => {
          contentstack.Utils.jsonToHTML({
            entry,
            paths: jsonRtePath,
          })
        })
      }

      if (editableTags && result?.entries) {
        result.entries.forEach((entry) => {
          contentstack.Utils.addEditableTags(entry, contentTypeUid, true, locale)
        })
      }

      let finalEntries: T[] = []
      if (shouldReplaceCslp && result?.entries) {
        finalEntries = result.entries.map(entry => replaceCslp(entry) as T)
      }
      else {
        finalEntries = (result?.entries || []) as T[]
      }

      return {
        entries: finalEntries,
        ...(includeCount && result?.count !== undefined && { count: result.count }),
      }
    }
    catch (error) {
      console.error('Error fetching entries:', error)
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
