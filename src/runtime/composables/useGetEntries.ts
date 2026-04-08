import { useAsyncData } from '#imports'
import type { AsyncData, NuxtError } from 'nuxt/app'
import {
  setupLivePreview,
  applyVariants,
  applyReferenceFields,
  processEntriesData,
  setupLivePreviewRefresh,
  shouldReplaceCslp,
} from './utils'
import { useContentstack } from './useContentstack'
import { DEFAULT_LOCALE } from '../constants'
import { handleContentstackError, logContentstackError } from './error-handling'

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
}): Promise<AsyncData<{ entries: T[]; count?: number } | null, NuxtError<unknown> | undefined>> => {
  const {
    contentTypeUid,
    referenceFieldPath = [],
    jsonRtePath = [],
    locale = DEFAULT_LOCALE,
    replaceHtmlCslp,
    limit = 10,
    skip = 0,
    orderBy,
    includeCount = false,
    where = {},
  } = options

  const { editableTags, stack, livePreviewEnabled, variantAlias } = useContentstack()

  const shouldReplaceCslpValue = shouldReplaceCslp(editableTags, replaceHtmlCslp)
  const cacheKey = `${contentTypeUid}-entries-${locale}-${limit}-${skip}-${JSON.stringify(where)}-${variantAlias?.value ? variantAlias.value : ''}`

  const asyncData = await useAsyncData(cacheKey, async () => {
    setupLivePreview(stack, livePreviewEnabled)

    // Build Entries object with configuration methods
    const entriesBuilder = stack.contentType(contentTypeUid)
      .entry()
      .locale(locale)
      .includeFallback()
      .includeEmbeddedItems()

    applyVariants(entriesBuilder, variantAlias)
    applyReferenceFields(entriesBuilder, referenceFieldPath)

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
      const result = await query.find() as { entries: any[]; count?: number }

      const processedEntries = processEntriesData(result?.entries || [], {
        contentTypeUid,
        locale,
        jsonRtePath,
        editableTags,
        shouldReplaceCslp: shouldReplaceCslpValue,
      }) as T[]

      return {
        entries: processedEntries,
        ...(includeCount && result?.count !== undefined && { count: result.count }),
      }
    }
    catch (error) {
      const contentstackError = handleContentstackError(error, 'useGetEntries')
      logContentstackError(contentstackError)
      return null
    }
  }, {
    default: () => null,
  })

  setupLivePreviewRefresh(livePreviewEnabled, asyncData.refresh)

  return asyncData
}
