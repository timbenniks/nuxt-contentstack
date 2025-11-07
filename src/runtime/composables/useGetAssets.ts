import ContentstackLivePreview from '@contentstack/live-preview-utils'
import { useAsyncData, useNuxtApp, type AsyncData } from '#app'
import type { Stack } from '@contentstack/delivery-sdk'

/**
 * Composable to fetch multiple assets with optional filtering
 */
export const useGetAssets = async <T = any>(options: {
  locale?: string
  limit?: number
  skip?: number
  orderBy?: string
  includeCount?: boolean
  where?: Record<string, any>
}): Promise<AsyncData<{ assets: T[]; count?: number } | null, Error>> => {
  const {
    locale = 'en-us',
    limit = 10,
    skip = 0,
    orderBy,
    includeCount = false,
    where = {},
  } = options

  const { stack, livePreviewEnabled } = useNuxtApp().$contentstack as {
    stack: Stack
    livePreviewEnabled: boolean
  }

  const cacheKey = `assets-${locale}-${limit}-${skip}-${JSON.stringify(where)}`

  const { data, status, refresh } = await useAsyncData(cacheKey, async () => {
    try {
      const assetsQuery = stack.asset()
        .locale(locale)
        .includeFallback()
        .limit(limit)
        .skip(skip)

      if (orderBy) {
        assetsQuery.orderByAscending(orderBy)
      }

      if (includeCount) {
        assetsQuery.includeCount()
      }

      // Apply where conditions (limited support for assets)
      // Note: Asset queries have limited filtering capabilities compared to entry queries
      // Most filtering should be done client-side after fetching
      if (where.content_type) {
        // This is one of the few supported filters for assets
        assetsQuery.addParams({ content_type: where.content_type })
      }

      const result = await assetsQuery.find() as { assets: T[]; count?: number }

      let filteredAssets = result?.assets || []

      // Apply client-side filtering for unsupported server-side filters
      if (where && Object.keys(where).length > 0) {
        filteredAssets = filteredAssets.filter((asset: any) => {
          for (const [field, value] of Object.entries(where)) {
            // Skip content_type as it's handled server-side
            if (field === 'content_type') continue

            if (typeof value === 'object' && value !== null) {
              for (const [operator, operatorValue] of Object.entries(value)) {
                switch (operator) {
                  case '$gt':
                    if (!(Number.parseFloat(asset[field]) > Number.parseFloat(operatorValue as string))) return false
                    break
                  case '$lt':
                    if (!(Number.parseFloat(asset[field]) < Number.parseFloat(operatorValue as string))) return false
                    break
                  case '$exists':
                    if (operatorValue && !asset[field]) return false
                    if (!operatorValue && asset[field]) return false
                    break
                  case '$regex': {
                    const regex = new RegExp(operatorValue as string, 'i')
                    if (!regex.test(asset[field])) return false
                    break;
                  }
                    break
                  default:
                    if (asset[field] !== operatorValue) return false
                }
              }
            }
            else if (Array.isArray(value)) {
              if (!value.includes(asset[field])) return false
            }
            else {
              if (asset[field] !== value) return false
            }
          }
          return true
        })
      }

      return {
        assets: filteredAssets,
        ...(includeCount && result?.count !== undefined && { count: result.count }),
      }
    }
    catch (error) {
      console.error('Error fetching assets:', error)
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
