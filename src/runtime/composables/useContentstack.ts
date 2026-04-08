import type { Stack } from '@contentstack/delivery-sdk'
import { useNuxtApp } from '#imports'

export interface ContentstackContext {
  stack: Stack
  livePreviewEnabled: boolean
  editableTags: boolean
  variantAlias?: { value: string }
  ContentstackLivePreview: any
  Personalize: any
  VB_EmptyBlockParentClass: string
}

/**
 * Typed accessor for the Contentstack plugin provides.
 * Avoids repeated `useNuxtApp().$contentstack as { ... }` casts.
 */
export function useContentstack(): ContentstackContext {
  return useNuxtApp().$contentstack as ContentstackContext
}
