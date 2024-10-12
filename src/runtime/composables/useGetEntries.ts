import ContentstackLivePreview from '@contentstack/live-preview-utils'
import type { EmbeddedItem } from '@contentstack/utils/dist/types/Models/embedded-object'
import { addEditableTags, jsonToHTML } from '@contentstack/utils'
import { QueryOperator } from '@contentstack/delivery-sdk'

export const useGetEntries = async <T>(contentTypeUid: string, referenceFieldPath?: string[], jsonRtePath?: string[], query?: { queryOperator?: string, filterQuery?: Array<{ key: string, value: string | number | boolean }> }, limit?: number, locale?: string) => {
  const { editableTags, stack, livePreviewEnabled } = useNuxtApp().$contentstack
  const { contentstack: opts } = useRuntimeConfig().public
  const { data, status, refresh } = await useAsyncData(`${contentTypeUid}-${locale}`, async () => {
    let result: { entries: T[] } | null = null

    const entryQuery = stack.contentType(contentTypeUid)
      .entry()
      .locale(locale)
      .includeFallback()
      .includeEmbeddedItems()
      .includeReference(referenceFieldPath ?? [])
      .query()

    if (entryQuery) {
      if (query?.filterQuery?.length > 0 && query?.queryOperator === 'or') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queries = query?.filterQuery?.map((q: any) => {
          if (typeof Object.values(q)?.[0] === 'string') {
            return stack.contentType(contentTypeUid).entry().query().equalTo(Object.keys(q)?.[0], Object.values(q)?.[0] as string)
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return stack.contentType(contentTypeUid).entry().query().containedIn(Object.keys(q)?.[0], Object.values(q)?.[0] as any)
        })

        entryQuery.queryOperator(QueryOperator.OR, ...queries)
      }

      if (query?.filterQuery?.key && query?.filterQuery?.value) { // filterQuery is an object consisting key value pair
        entryQuery.equalTo(query.filterQuery?.key, query.filterQuery?.value)
      }

      if (limit !== 0) {
        entryQuery.limit(limit)
      }

      result = await entryQuery.find() as { entries: T[] }

      const data = result?.entries as EmbeddedItem[]

      data.forEach((entry) => {
        if (jsonRtePath) {
          jsonToHTML({
            entry: entry,
            paths: jsonRtePath,
          })
        }

        if (editableTags) {
          addEditableTags(entry, contentTypeUid, true, locale)
        }
      })

      return data
    }
  })

  if (livePreviewEnabled) {
    if (import.meta.client) {
      ContentstackLivePreview.onEntryChange(refresh)
    }

    if (import.meta.server && opts.livePreviewSdkOptions.ssr) {
      const route = useRoute()
      stack.livePreviewQuery(route.query)
    }
  }

  return { data, status, refresh }
}
