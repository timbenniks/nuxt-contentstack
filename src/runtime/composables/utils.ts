import contentstack, { type LivePreviewQuery, type Stack } from '@contentstack/delivery-sdk'
import ContentstackLivePreview from '@contentstack/live-preview-utils'
import type { EmbeddedItem } from '@contentstack/utils/dist/types/Models/embedded-object'
import { toRaw } from 'vue'
import { useRoute } from '#app'
import { replaceCslp } from '../utils'

/**
 * Common interface for Entry and Entries types that share these methods
 * Note: Entry uses string|number|string[] while Entries uses string|number|boolean
 * We use a flexible type that accepts both signatures
 */
interface EntryQueryMethods {
  addParams: (params: Record<string, any>) => any
  variants: (variants: string) => any
  includeReference: (path: string) => any
}

/**
 * Sets up live preview query if enabled and query params are present
 */
export function setupLivePreview(stack: Stack, livePreviewEnabled: boolean): void {
  if (!livePreviewEnabled) return

  const route = useRoute()
  const qs = { ...toRaw(route.query) }

  if (qs?.live_preview) {
    stack.livePreviewQuery(qs as unknown as LivePreviewQuery)
  }
}

/**
 * Applies variant handling to an entry query
 * Works with both Entry (single) and Entries (collection) types
 */
export function applyVariants(
  query: EntryQueryMethods,
  variantAlias?: { value: string }
): void {
  if (!variantAlias || variantAlias.value === '') return

  const variants = toRaw(variantAlias.value)
  query.addParams({ include_applied_variants: true })
  query.addParams({ include_dimension: true })
  query.variants(variants)
}

/**
 * Applies reference field paths to an entry query
 * Works with both Entry (single) and Entries (collection) types
 */
export function applyReferenceFields(
  query: EntryQueryMethods,
  referenceFieldPath?: string[]
): void {
  if (!referenceFieldPath || referenceFieldPath.length === 0) return

  for (const path of referenceFieldPath) {
    query.includeReference(path)
  }
}

/**
 * Processes entry data: converts JSON RTE, adds editable tags, and optionally replaces CSLP
 */
export function processEntryData<T extends EmbeddedItem>(
  entry: T | null,
  options: {
    contentTypeUid: string
    locale: string
    jsonRtePath?: string[]
    editableTags: boolean
    shouldReplaceCslp: boolean
  }
): T | null {
  if (!entry) return null

  const { contentTypeUid, locale, jsonRtePath, editableTags, shouldReplaceCslp } = options

  // Convert JSON RTE to HTML
  if (jsonRtePath && jsonRtePath.length > 0) {
    contentstack.Utils.jsonToHTML({
      entry,
      paths: jsonRtePath,
    })
  }

  // Add editable tags if enabled
  if (editableTags) {
    contentstack.Utils.addEditableTags(entry, contentTypeUid, true, locale)
  }

  // Replace CSLP if needed
  if (shouldReplaceCslp) {
    return replaceCslp(entry) as T
  }

  return entry
}

/**
 * Processes multiple entries: converts JSON RTE, adds editable tags, and optionally replaces CSLP
 */
export function processEntriesData<T extends EmbeddedItem>(
  entries: T[],
  options: {
    contentTypeUid: string
    locale: string
    jsonRtePath?: string[]
    editableTags: boolean
    shouldReplaceCslp: boolean
  }
): T[] {
  if (!entries || entries.length === 0) return []

  return entries.map(entry => processEntryData(entry, options) as T).filter(Boolean) as T[]
}

/**
 * Sets up live preview refresh callback
 */
export function setupLivePreviewRefresh(
  livePreviewEnabled: boolean,
  refresh: () => Promise<void>
): void {
  if (!livePreviewEnabled) return

  if (import.meta.client) {
    ContentstackLivePreview.onEntryChange(refresh)
  }
}

/**
 * Determines if CSLP should be replaced based on editableTags and user preference
 */
export function shouldReplaceCslp(
  editableTags: boolean,
  replaceHtmlCslp?: boolean
): boolean {
  return replaceHtmlCslp ?? editableTags
}

