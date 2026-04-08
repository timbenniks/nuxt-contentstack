import type { Nuxt } from '@nuxt/schema'

/**
 * Matches any @contentstack/* package EXCEPT the server-only personalize SDK.
 * Using a regex future-proofs against new packages Contentstack may add.
 */
const CONTENTSTACK_BROWSER_RE = /^@contentstack\/(?!personalize-edge-sdk)/

/**
 * Explicit list for contexts that don't accept RegExp (e.g. optimizeDeps.include).
 */
const CONTENTSTACK_BROWSER_PACKAGES = [
  '@contentstack/delivery-sdk',
  '@contentstack/live-preview-utils',
  '@contentstack/core',
  '@contentstack/utils',
]

/**
 * Transitive CJS dependencies inside the Contentstack packages above.
 * `build.transpile` does NOT transitively process sub-dependencies, so these
 * must be listed explicitly to avoid "does not provide an export named 'default'"
 * errors on the client.
 */
const CONTENTSTACK_TRANSITIVE_CJS = [
  'lodash',
  'qs',
  'humps',
]

/**
 * Vite's optimizeDeps.include supports a nested syntax ("parent > child") that
 * forces pre-bundling of a CJS transitive dep even when the parent lives outside
 * the project root (e.g. a linked local module). Without this, Vite serves the
 * raw CJS file via /@fs/ which breaks ESM imports.
 */
const CONTENTSTACK_NESTED_OPTIMIZEDEPS = CONTENTSTACK_BROWSER_PACKAGES.flatMap(
  pkg => CONTENTSTACK_TRANSITIVE_CJS.map(dep => `${pkg} > ${dep}`),
)

const CONTENTSTACK_SERVER_ONLY_PACKAGES = [
  '@contentstack/personalize-edge-sdk',
]

function appendUnique<T>(existing: T[], additions: T[]): T[] {
  return [...existing, ...additions.filter(item => !existing.includes(item))]
}

function normalizeArray<T>(value: T | T[] | undefined): T[] {
  if (Array.isArray(value)) {
    return value
  }

  return value === undefined ? [] : [value]
}

/**
 * Configures Nuxt and Vite so Contentstack browser packages are transformed
 * in downstream apps instead of relying purely on dev-time dependency scanning.
 */
export function configureViteForContentstack(nuxt: Nuxt, extraTranspile: string[] = []): void {
  // build.transpile accepts RegExp — use the catch-all pattern so any future
  // @contentstack/* package is automatically transpiled.
  const transpile = normalizeArray(nuxt.options.build.transpile)
  if (!transpile.some(t => t instanceof RegExp && t.source === CONTENTSTACK_BROWSER_RE.source)) {
    transpile.push(CONTENTSTACK_BROWSER_RE)
  }
  nuxt.options.build.transpile = appendUnique(
    transpile,
    [...CONTENTSTACK_TRANSITIVE_CJS, ...extraTranspile],
  )

  nuxt.options.vite ??= {}
  nuxt.options.vite.ssr ??= {}
  const currentNoExternal = nuxt.options.vite.ssr.noExternal
  if (currentNoExternal !== true) {
    const noExt = normalizeArray(currentNoExternal)
    if (!noExt.some(t => t instanceof RegExp && t.source === CONTENTSTACK_BROWSER_RE.source)) {
      noExt.push(CONTENTSTACK_BROWSER_RE)
    }
    nuxt.options.vite.ssr.noExternal = noExt
  }

  const currentExternal = nuxt.options.vite.ssr.external
  if (currentExternal !== true) {
    nuxt.options.vite.ssr.external = appendUnique(
      normalizeArray(currentExternal),
      CONTENTSTACK_SERVER_ONLY_PACKAGES,
    )
  }

  nuxt.options.vite.optimizeDeps ??= {}
  const exclude = normalizeArray(nuxt.options.vite.optimizeDeps.exclude)
  nuxt.options.vite.optimizeDeps.exclude = appendUnique(exclude, CONTENTSTACK_SERVER_ONLY_PACKAGES)

  // optimizeDeps.include is a dev-only warm-cache hint — it speeds up Vite's
  // initial dev-server scan but is NOT required for correctness (build.transpile
  // handles the actual CJS→ESM transformation for both dev and production).
  const include = normalizeArray(nuxt.options.vite.optimizeDeps.include)
  nuxt.options.vite.optimizeDeps.include = appendUnique(
    include,
    [
      ...CONTENTSTACK_BROWSER_PACKAGES,
      ...CONTENTSTACK_TRANSITIVE_CJS,
      ...CONTENTSTACK_NESTED_OPTIMIZEDEPS,
      ...extraTranspile,
    ],
  )
}
