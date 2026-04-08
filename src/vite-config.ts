import type { Nuxt } from '@nuxt/schema'

/**
 * Configures Vite for Contentstack packages
 * - Pre-bundles CJS dependencies so Vite wraps them with ESM-compatible exports
 * - Keeps server-only packages external from client bundles
 */
export function configureViteForContentstack(nuxt: Nuxt): void {
  // SSR: Keep server-only packages external
  nuxt.options.vite ??= {}
  nuxt.options.vite.ssr ??= {}
  const ssrExternal = Array.isArray(nuxt.options.vite.ssr.external)
    ? nuxt.options.vite.ssr.external
    : []
  if (!ssrExternal.includes('@contentstack/personalize-edge-sdk')) {
    nuxt.options.vite.ssr.external = [...ssrExternal, '@contentstack/personalize-edge-sdk']
  }

  // Client-side: exclude server packages from optimization
  nuxt.options.vite.optimizeDeps ??= {}
  const exclude = Array.isArray(nuxt.options.vite.optimizeDeps.exclude)
    ? nuxt.options.vite.optimizeDeps.exclude
    : []
  if (!exclude.includes('@contentstack/personalize-edge-sdk')) {
    nuxt.options.vite.optimizeDeps.exclude = [...exclude, '@contentstack/personalize-edge-sdk']
  }

  // Pre-bundle CJS dependencies so Vite converts them to ESM-compatible modules.
  // This avoids "does not provide an export named 'default'" errors in dev mode.
  const include = Array.isArray(nuxt.options.vite.optimizeDeps.include)
    ? nuxt.options.vite.optimizeDeps.include
    : []

  const cjsDepsToPreBundle = [
    // Contentstack packages
    '@contentstack/delivery-sdk',
    '@contentstack/live-preview-utils',
    '@contentstack/core',
    '@contentstack/utils',
    // CJS sub-dependencies — bare names for hoisted installs
    'lodash',
    'qs',
    'humps',
    'form-data',
    'follow-redirects',
    // Nested syntax for non-hoisted installs (pnpm, strict mode)
    '@contentstack/core > lodash',
    '@contentstack/core > qs',
    '@contentstack/delivery-sdk > humps',
    '@contentstack/core > axios > form-data',
    '@contentstack/core > axios > follow-redirects',
  ]

  const newIncludes = cjsDepsToPreBundle.filter(dep => !include.includes(dep))
  if (newIncludes.length > 0) {
    nuxt.options.vite.optimizeDeps.include = [...include, ...newIncludes]
  }
}
