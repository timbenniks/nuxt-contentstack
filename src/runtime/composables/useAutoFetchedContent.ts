import { useState, useRoute, useRuntimeConfig } from '#app'
import { computed } from 'vue'
import type { Ref, ComputedRef } from 'vue'

interface AutoFetchedContent<T = any> {
  success: boolean
  data: T
  meta: {
    contentType: string
    url: string
    locale: string
    uid: string
    title: string
    fetchedAt: string
  }
}

interface UseAutoFetchedContentReturn<T> {
  /**
   * The auto-fetched content data
   */
  content: Ref<T | null>

  /**
   * Whether content is available
   */
  isLoaded: ComputedRef<boolean>

  /**
   * Content metadata (content type, UID, title, etc.)
   */
  meta: ComputedRef<AutoFetchedContent<T>['meta'] | null>

  /**
   * Manual refresh function to re-fetch content for current route
   */
  refresh: () => Promise<void>

  /**
   * Get content for a specific route/content type combination
   */
  getContentFor: (url: string, contentType?: string) => T | null
}

/**
 * Composable to access auto-fetched content
 *
 * @param options Configuration options
 * @returns Object with content, loading state, and utility functions
 */
export const useAutoFetchedContent = <T = any>(options?: {
  /**
   * Specific content type to filter by
   */
  contentType?: string

  /**
   * Whether to fallback to manual fetching if auto-fetch is disabled
   */
  fallbackToManual?: boolean
}): UseAutoFetchedContentReturn<T> => {
  const route = useRoute()
  const config = useRuntimeConfig()
  const { autoFetch } = config.public.contentstack

  // Determine the cache key for current route
  const contentType = options?.contentType || getContentTypeForRoute(route.path, autoFetch.contentTypeMapping)
  const cacheKey = `${autoFetch.options.cacheKey}-${contentType}-${route.path}`

  // Get the auto-fetched content from state
  const autoFetchedContent = useState<AutoFetchedContent<T> | null>(cacheKey, () => null)

  // Also check for the general current page state
  const currentPageContent = useState<AutoFetchedContent<T> | null>('contentstack.currentPage', () => null)

  // Return the specific content or fallback to current page
  const content = computed(() => {
    const specific = autoFetchedContent.value?.data
    const current = currentPageContent.value?.data

    // If we have specific content for this route/content type, use it
    if (specific) return specific

    // If we have current page content and it matches our criteria, use it
    if (current && currentPageContent.value?.meta) {
      const currentMeta = currentPageContent.value.meta
      if (currentMeta.url === route.path && (!options?.contentType || currentMeta.contentType === options.contentType)) {
        return current
      }
    }

    return null
  })

  // Check if content is loaded
  const isLoaded = computed(() => content.value !== null)

  // Get metadata
  const meta = computed(() => {
    if (autoFetchedContent.value?.meta) return autoFetchedContent.value.meta
    if (currentPageContent.value?.meta) return currentPageContent.value.meta
    return null
  })

  // Manual refresh function
  const refresh = async () => {
    if (!autoFetch.enabled) {
      console.warn('Auto-fetch is disabled, cannot refresh content automatically')
      return
    }

    try {
      const freshContent = await $fetch('/api/contentstack/auto-fetch', {
        query: {
          url: route.path,
          contentType,
          locale: autoFetch.options.locale,
          includeReferences: autoFetch.options.includeReferences.join(','),
          includeFallback: autoFetch.options.includeFallback,
        },
      }) as AutoFetchedContent<T>

      // Update both specific and general state
      autoFetchedContent.value = freshContent
      currentPageContent.value = freshContent
    } catch (error) {
      console.error('Failed to refresh auto-fetched content:', error)
      throw error
    }
  }

  // Function to get content for a specific route
  const getContentFor = (url: string, contentTypeOverride?: string): T | null => {
    const targetContentType = contentTypeOverride || getContentTypeForRoute(url, autoFetch.contentTypeMapping)
    const targetCacheKey = `${autoFetch.options.cacheKey}-${targetContentType}-${url}`
    const targetContent = useState<AutoFetchedContent<T> | null>(targetCacheKey, () => null)

    return targetContent.value?.data || null
  }

  return {
    content,
    isLoaded,
    meta,
    refresh,
    getContentFor,
  }
}

/**
 * Helper function to determine content type for a route
 * Duplicated from middleware for consistency
 */
function getContentTypeForRoute(
  path: string,
  mapping: Record<string, string>
): string {
  // Check for exact matches first
  if (mapping[path]) {
    return mapping[path]
  }

  // Check for pattern matches
  for (const [pattern, contentType] of Object.entries(mapping)) {
    if (pattern !== 'default' && matchRoutePattern(path, pattern)) {
      return contentType
    }
  }

  // Return default content type
  return mapping.default || 'page'
}

/**
 * Helper function to match route patterns
 * Duplicated from middleware for consistency
 */
function matchRoutePattern(path: string, pattern: string): boolean {
  // Exact match
  if (path === pattern) {
    return true
  }

  // Convert pattern to regex
  let regexPattern = pattern
    .replace(/\*\*/g, '___DOUBLE_WILDCARD___')
    .replace(/\*/g, '[^/]*')
    .replace(/___DOUBLE_WILDCARD___/g, '.*')
    .replace(/\//g, '\\/')

  regexPattern = `^${regexPattern}$`

  const regex = new RegExp(regexPattern)
  return regex.test(path)
}
