import type { Stack } from '@contentstack/delivery-sdk'
import { useNuxtApp } from '#imports'

/**
 * Personalize SDK instance (client-side only).
 * Provides instance methods: set(), triggerImpression(), triggerImpressions(),
 * triggerEvent(), setUserId(), getUserId(), getVariants(), getVariantAliases().
 * Returns null on server — server personalization is handled by the middleware.
 */
export interface PersonalizeSdkInstance {
  set: (attributes: Record<string, any>) => Promise<void>
  triggerImpression: (experienceShortUid: string) => Promise<void>
  triggerImpressions: (options: { experienceShortUids?: string[], aliases?: string[] }) => Promise<void>
  triggerEvent: (eventKey: string) => Promise<void>
  setUserId: (userId: string, options?: { preserveUserAttributes?: boolean }) => Promise<void>
  getUserId: () => string
  getVariants: () => Record<string, string | null>
  getVariantAliases: () => string[]
  getVariantParam: () => string
  getActiveVariant: (experienceShortUid: string) => string | null
  addStateToResponse: (response: Response) => Promise<void>
}

export interface ContentstackContext {
  stack: Stack
  livePreviewEnabled: boolean
  editableTags: boolean
  variantAlias?: { value: string }
  ContentstackLivePreview: any
  /** Personalize SDK instance — available on client only, null on server */
  personalizeSdk: PersonalizeSdkInstance | null
  VB_EmptyBlockParentClass: string
}

/**
 * Typed accessor for the Contentstack plugin provides.
 * Avoids repeated `useNuxtApp().$contentstack as { ... }` casts.
 */
export function useContentstack(): ContentstackContext {
  return useNuxtApp().$contentstack as ContentstackContext
}
