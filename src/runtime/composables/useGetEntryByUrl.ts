import contentstack from '@contentstack/delivery-sdk'
import ContentstackLivePreview, { type IStackSdk } from '@contentstack/live-preview-utils'
import type { EmbeddedItem } from '@contentstack/utils/dist/types/Models/embedded-object'
import { toRaw } from 'vue'
import { useAsyncData, useNuxtApp, type AsyncData } from '#app'
import { replaceCslp } from '../utils'
import { trackDevToolsEntry, trackDevToolsQuery, updateDevToolsQuery } from '../devtools/utils'

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
    replaceHtmlCslp,
  } = options

  const { editableTags, stack, livePreviewEnabled, variantAlias } = useNuxtApp().$contentstack as {
    editableTags: boolean
    stack: IStackSdk
    livePreviewEnabled: boolean
    variantAlias?: { value: string }
  }

  // Only replace CSLP when editableTags is enabled, otherwise use user preference or default to false
  const shouldReplaceCslp = replaceHtmlCslp ?? editableTags

  const { data, status, refresh } = await useAsyncData(`${contentTypeUid}-${url}-${locale}-${variantAlias?.value ? variantAlias.value : ''}`, async () => {
    // Start DevTools tracking
    const queryId = trackDevToolsQuery({
      composable: 'useGetEntryByUrl',
      params: { contentTypeUid, url, locale, referenceFieldPath, jsonRtePath },
      url: `/v3/content_types/${contentTypeUid}/entries`,
      method: 'GET'
    });

    let result: { entries: T[] } | null = null

    try {
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
        if (shouldReplaceCslp) {
          finalData = replaceCslp(data)
        }
        else {
          finalData = data
        }

        // Track successful query completion
        updateDevToolsQuery(queryId, {
          status: 'success',
          response: finalData
        });

        // Track the entry for DevTools
        if (finalData && typeof finalData === 'object' && 'uid' in finalData) {
          await trackDevToolsEntry({
            uid: (finalData as any).uid,
            content_type_uid: contentTypeUid,
            title: (finalData as any).title,
            locale,
            status: (finalData as any).status || 'published',
            _version: (finalData as any)._version
          });
        }

        return finalData
      }
    } catch (error) {
      // Track failed query
      updateDevToolsQuery(queryId, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
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
