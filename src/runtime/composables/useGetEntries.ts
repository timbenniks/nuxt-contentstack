import contentstack, { type LivePreviewQuery, type Stack } from '@contentstack/delivery-sdk'
import ContentstackLivePreview from '@contentstack/live-preview-utils'
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
    stack: Stack
    livePreviewEnabled: boolean
    editableTags: boolean
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

    // Build Entries object with configuration methods
    const entriesBuilder = stack.contentType(contentTypeUid)
      .entry()
      .locale(locale)
      .includeFallback()
      .includeEmbeddedItems()

    if (variantAlias && variantAlias.value !== '') {
      const variants = toRaw(variantAlias.value)
      entriesBuilder.addParams({ include_applied_variants: true })
      entriesBuilder.addParams({ include_dimension: true })
      entriesBuilder.variants(variants)
    }

    if (referenceFieldPath && referenceFieldPath.length > 0) {
      for (const path of referenceFieldPath) {
        entriesBuilder.includeReference(path)
      }
    }

    // Get Query object for query operations
    const query = entriesBuilder.query()

    // Apply pagination and ordering on Query object
    query.limit(limit)
    query.skip(skip)

    if (orderBy) {
      query.orderByAscending(orderBy)
    }

    if (includeCount) {
      query.includeCount()
    }

    // Apply where conditions on Query object
    for (const [field, value] of Object.entries(where)) {
      if (Array.isArray(value)) {
        query.containedIn(field, value)
      }
      else if (typeof value === 'object' && value !== null) {
        // Handle complex queries like { $gt: 5 }, { $exists: true }, etc.
        for (const [operator, operatorValue] of Object.entries(value)) {
          switch (operator) {
            case '$gt':
              query.greaterThan(field, operatorValue as string | number)
              break
            case '$gte':
              query.greaterThanOrEqualTo(field, operatorValue as string | number)
              break
            case '$lt':
              query.lessThan(field, operatorValue as string | number)
              break
            case '$lte':
              query.lessThanOrEqualTo(field, operatorValue as string | number)
              break
            case '$ne':
              query.notEqualTo(field, operatorValue as string | number | boolean)
              break
            case '$exists':
              if (operatorValue) {
                query.exists(field)
              }
              else {
                query.notExists(field)
              }
              break
            case '$regex':
              query.regex(field, operatorValue as string)
              break
            default:
              query.equalTo(field, operatorValue as string | number | boolean)
          }
        }
      }
      else {
        query.equalTo(field, value)
      }
    }

    try {
      const result = await query.find() as { entries: EmbeddedItem[]; count?: number }

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
