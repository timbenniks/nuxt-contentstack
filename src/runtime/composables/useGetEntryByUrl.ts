import ContentstackLivePreview from '@contentstack/live-preview-utils'
import type { EmbeddedItem } from '@contentstack/utils/dist/types/Models/embedded-object'
import { addEditableTags, jsonToHTML } from '@contentstack/utils'

export const useGetEntryByUrl = async <T>(contentTypeUid: string, url: string, referenceFieldPath?: string[], jsonRtePath?: string[], locale: string = 'en-us') => {
  const { $editableTags, $stack, $livePreviewEnabled } = useNuxtApp()
  const { data, status, refresh } = await useAsyncData(`${contentTypeUid}-${url}-${locale}`, async () => {
    let result: { entries: T[] } | null = null

    const entryQuery = $stack.contentType(contentTypeUid)
      .entry()
      .locale(locale)
      .includeFallback()
      .includeEmbeddedItems()
      .includeReference(referenceFieldPath ?? [])

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
        jsonToHTML({
          entry: data,
          paths: jsonRtePath,
        })
      }

      if ($editableTags) {
        addEditableTags(data, contentTypeUid, true, locale)
      }

      return data
    }
  })

  if (import.meta.client && $livePreviewEnabled) {
    ContentstackLivePreview.onEntryChange(refresh)
  }

  return { data, status, refresh }
}
