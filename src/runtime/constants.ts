/**
 * Default configuration constants for Contentstack module
 * These values are used throughout the module to ensure consistency
 */

/** Default locale for Contentstack entries */
export const DEFAULT_LOCALE = 'en-us'

/** Default branch for Contentstack stack */
export const DEFAULT_BRANCH = 'main'

/** Default region for Contentstack stack */
export const DEFAULT_REGION = 'us'

/** Default field path for extracting modular blocks from entry data */
export const DEFAULT_BLOCKS_FIELD_PATH = 'components'

/** Vite resolve conditions for ESM support */
export const VITE_RESOLVE_CONDITIONS = {
  IMPORT: 'import',
  MODULE: 'module',
} as const

/** Vite resolve main fields for ESM support */
export const VITE_RESOLVE_MAIN_FIELDS = {
  MODULE: 'module',
  MAIN: 'main',
} as const

