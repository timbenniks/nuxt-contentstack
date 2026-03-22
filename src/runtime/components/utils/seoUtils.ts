import type { useSeoMeta } from '#app'

/**
 * SEO Meta input type from Nuxt's useSeoMeta
 */
export type SeoMetaInput = Parameters<typeof useSeoMeta>[0]

/**
 * Default field mapping for auto-generated SEO metadata
 */
const DEFAULT_SEO_MAPPING: Record<string, string> = {
  title: 'seo_title|title|name',
  description: 'seo_description|description|summary',
  ogTitle: 'seo_title|title|name',
  ogDescription: 'seo_description|description|summary',
  ogImage: 'featured_image.url|og_image.url|image.url',
}

/**
 * Generate SEO metadata from entry data using field mapping
 */
export function generateSeoFromEntry(
  entryData: any,
  autoSeoMeta: boolean | Record<string, string>
): SeoMetaInput {
  if (!entryData) return {}

  // Use custom mapping if provided, otherwise use default
  const fieldMapping =
    typeof autoSeoMeta === 'object' ? autoSeoMeta : DEFAULT_SEO_MAPPING

  const seoObject: Record<string, any> = {}

  for (const [seoKey, fieldPath] of Object.entries(fieldMapping)) {
    // Handle field paths with fallbacks (separated by |)
    const fieldOptions = fieldPath.split('|')
    let found = false

    for (const field of fieldOptions) {
      let value

      // Handle nested field paths (e.g., 'featured_image.url')
      if (field.includes('.')) {
        const nestedPath = field.split('.')
        value = entryData
        for (const part of nestedPath) {
          value = value?.[part]
        }
      } else {
        value = entryData[field]
      }

      if (value) {
        seoObject[seoKey] = value
        found = true
        break // Use first available value
      }
    }

    // If no field matched and the value has no pipe/dot separators,
    // treat it as a static value (e.g., { robots: "noindex" })
    if (!found && !fieldPath.includes('|') && !fieldPath.includes('.') && !(fieldPath in entryData)) {
      seoObject[seoKey] = fieldPath
    }
  }

  return seoObject
}

