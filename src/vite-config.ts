import type { Nuxt } from '@nuxt/schema'
import { VITE_RESOLVE_CONDITIONS, VITE_RESOLVE_MAIN_FIELDS } from './runtime/constants'

/**
 * Adds a package to SSR external array if not already present
 */
function addToSsrExternal(nuxt: Nuxt, packageName: string): void {
  nuxt.options.vite = nuxt.options.vite || {}
  nuxt.options.vite.ssr = nuxt.options.vite.ssr || {}

  const ssrExternal = Array.isArray(nuxt.options.vite.ssr.external)
    ? nuxt.options.vite.ssr.external
    : []

  if (!ssrExternal.includes(packageName)) {
    nuxt.options.vite.ssr.external = [...ssrExternal, packageName]
  }
}

/**
 * Adds a package to optimizeDeps exclude array if not already present
 */
function addToOptimizeDepsExclude(nuxt: Nuxt, packageName: string): void {
  nuxt.options.vite = nuxt.options.vite || {}
  nuxt.options.vite.optimizeDeps = nuxt.options.vite.optimizeDeps || {}

  const optimizeDepsExclude = Array.isArray(nuxt.options.vite.optimizeDeps.exclude)
    ? nuxt.options.vite.optimizeDeps.exclude
    : []

  if (!optimizeDepsExclude.includes(packageName)) {
    nuxt.options.vite.optimizeDeps.exclude = [...optimizeDepsExclude, packageName]
  }
}

/**
 * Ensures 'import' and 'module' conditions are prioritized in Vite resolve conditions
 * Adds fallback conditions to maintain compatibility with packages that need CJS/Node.js support
 */
function configureResolveConditions(nuxt: Nuxt): void {
  nuxt.options.vite = nuxt.options.vite || {}
  nuxt.options.vite.resolve = nuxt.options.vite.resolve || {}

  const resolveConditions = Array.isArray(nuxt.options.vite.resolve.conditions)
    ? nuxt.options.vite.resolve.conditions
    : []

  // Ensure we have import and module conditions, but preserve existing conditions
  // and ensure 'default' is included for fallback compatibility
  const conditionsToAdd: string[] = []

  if (!resolveConditions.includes(VITE_RESOLVE_CONDITIONS.IMPORT)) {
    conditionsToAdd.push(VITE_RESOLVE_CONDITIONS.IMPORT)
  }

  if (!resolveConditions.includes(VITE_RESOLVE_CONDITIONS.MODULE)) {
    conditionsToAdd.push(VITE_RESOLVE_CONDITIONS.MODULE)
  }

  // Ensure 'default' is present for compatibility with packages that need CJS fallback
  if (!resolveConditions.includes('default') && !conditionsToAdd.includes('default')) {
    conditionsToAdd.push('default')
  }

  if (conditionsToAdd.length > 0) {
    // Prepend new conditions, but keep existing ones
    nuxt.options.vite.resolve.conditions = [...conditionsToAdd, ...resolveConditions]
  } else if (resolveConditions.includes(VITE_RESOLVE_CONDITIONS.IMPORT) && !resolveConditions.includes(VITE_RESOLVE_CONDITIONS.MODULE)) {
    // If import exists but module doesn't, insert module right after import
    const importIndex = resolveConditions.indexOf(VITE_RESOLVE_CONDITIONS.IMPORT)
    nuxt.options.vite.resolve.conditions = [
      ...resolveConditions.slice(0, importIndex + 1),
      VITE_RESOLVE_CONDITIONS.MODULE,
      ...resolveConditions.slice(importIndex + 1)
    ]
  }
}

/**
 * Ensures 'module' is first in Vite resolve mainFields
 */
function configureResolveMainFields(nuxt: Nuxt): void {
  nuxt.options.vite = nuxt.options.vite || {}
  nuxt.options.vite.resolve = nuxt.options.vite.resolve || {}

  const resolveMainFields = Array.isArray(nuxt.options.vite.resolve.mainFields)
    ? nuxt.options.vite.resolve.mainFields
    : []

  if (!resolveMainFields.includes(VITE_RESOLVE_MAIN_FIELDS.MODULE)) {
    nuxt.options.vite.resolve.mainFields = [VITE_RESOLVE_MAIN_FIELDS.MODULE, ...resolveMainFields]
  } else if (resolveMainFields[0] !== VITE_RESOLVE_MAIN_FIELDS.MODULE) {
    // Ensure 'module' is first
    nuxt.options.vite.resolve.mainFields = [
      VITE_RESOLVE_MAIN_FIELDS.MODULE,
      ...resolveMainFields.filter(field => field !== VITE_RESOLVE_MAIN_FIELDS.MODULE)
    ]
  }
}

/**
 * Configures Vite for Contentstack packages
 * - Sets SSR external packages
 * - Configures optimizeDeps exclusions
 * - Configures ESM resolution preferences
 */
export function configureViteForContentstack(nuxt: Nuxt): void {
  // SSR: Keep server-only packages external
  addToSsrExternal(nuxt, '@contentstack/personalize-edge-sdk')

  // Client-side optimization: exclude server packages from being bundled
  addToOptimizeDepsExclude(nuxt, '@contentstack/personalize-edge-sdk')

  // Configure Vite resolve to prefer ESM, but only if not in test environment
  // In test environments, the ESM preference can cause issues with axios/stream
  const isTestEnv = process.env.NODE_ENV === 'test' || process.env.VITEST

  if (!isTestEnv) {
    configureResolveConditions(nuxt)
    configureResolveMainFields(nuxt)
  }
}

