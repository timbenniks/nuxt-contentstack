import { defineNuxtRouteMiddleware, useState, useRuntimeConfig } from '#app'

export default defineNuxtRouteMiddleware(async (to) => {
  // Get configuration from runtime config
  const config = useRuntimeConfig()
  const { autoFetch } = config.public.contentstack

  if (!autoFetch.enabled) return

  // Check if route should be processed
  if (!shouldProcessRoute(to.path, autoFetch.include, autoFetch.exclude)) {
    return
  }

  // Determine content type for this route
  const contentType = getContentTypeForRoute(
    to.path,
    autoFetch.contentTypeMapping
  )

  // Skip if already fetched (for client-side navigation)
  const cacheKey = `${autoFetch.options.cacheKey}-${contentType}-${to.path}`
  const existingContent = useState(cacheKey)
  if (existingContent.value) {
    return
  }

  // Fetch content for this route
  try {
    const content = await $fetch('/api/contentstack/auto-fetch', {
      query: {
        url: to.path,
        contentType,
        locale: autoFetch.options.locale,
        includeReferences: autoFetch.options.includeReferences.join(','),
        includeFallback: autoFetch.options.includeFallback,
      },
    })

    // Store in state for components to access
    useState(cacheKey, () => content)

    // Also store in a general key for easy access
    useState('contentstack.currentPage', () => content)
  } catch (error) {
    // Handle errors based on configuration
    if (autoFetch.options.errorHandling === 'throw') {
      throw error
    } else if (autoFetch.options.errorHandling === 'log') {
      console.error(`Failed to auto-fetch content for ${to.path}:`, error)
    }
    // 'silent' mode does nothing
  }
})

/**
 * Check if a route should be processed based on include/exclude patterns
 */
function shouldProcessRoute(
  path: string,
  include: string[],
  exclude: string[]
): boolean {
  // First check excludes - if any exclude pattern matches, skip
  for (const pattern of exclude) {
    if (matchRoutePattern(path, pattern)) {
      return false
    }
  }

  // If no includes specified, process all routes (that aren't excluded)
  if (include.length === 0) {
    return true
  }

  // Check if path matches any include pattern
  for (const pattern of include) {
    if (matchRoutePattern(path, pattern)) {
      return true
    }
  }

  return false
}

/**
 * Get the content type for a route based on mapping configuration
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
 * Match a path against a route pattern with wildcard support
 * Supports:
 * - Exact matches: "/about"
 * - Single wildcard: "/blog/*" matches "/blog/post-1" but not "/blog/category/post-1"
 * - Deep wildcard: "/blog/**" matches "/blog/post-1" and "/blog/category/post-1"
 */
function matchRoutePattern(path: string, pattern: string): boolean {
  // Exact match
  if (path === pattern) {
    return true
  }

  // Convert pattern to regex
  let regexPattern = pattern
    .replace(/\*\*/g, '___DOUBLE_WILDCARD___') // Temporarily replace ** to avoid interference
    .replace(/\*/g, '[^/]*') // Single * matches any characters except /
    .replace(/___DOUBLE_WILDCARD___/g, '.*') // ** matches any characters including /
    .replace(/\//g, '\\/') // Escape forward slashes

  // Ensure pattern matches from start to end
  regexPattern = `^${regexPattern}$`

  const regex = new RegExp(regexPattern)
  return regex.test(path)
}
