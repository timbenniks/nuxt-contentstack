import { describe, it, expect } from 'vitest'
import { generateSeoFromEntry } from '../src/runtime/components/utils/seoUtils'

describe('SEO Utils', () => {
  describe('generateSeoFromEntry', () => {
    it('should generate SEO from default field mapping', () => {
      const entry = {
        title: 'My Page',
        description: 'A great page',
        featured_image: { url: 'https://example.com/image.jpg' },
      }

      const result = generateSeoFromEntry(entry, true)

      expect(result.title).toBe('My Page')
      expect(result.description).toBe('A great page')
      expect(result.ogTitle).toBe('My Page')
      expect(result.ogImage).toBe('https://example.com/image.jpg')
    })

    it('should use fallback fields (pipe-separated)', () => {
      const entry = {
        seo_title: 'SEO Title',
        summary: 'A summary',
      }

      const result = generateSeoFromEntry(entry, true)

      expect(result.title).toBe('SEO Title')
      expect(result.description).toBe('A summary')
    })

    it('should support custom field mapping', () => {
      const entry = {
        page_title: 'Custom Title',
        meta_desc: 'Custom description',
      }

      const result = generateSeoFromEntry(entry, {
        title: 'page_title',
        description: 'meta_desc',
      })

      expect(result.title).toBe('Custom Title')
      expect(result.description).toBe('Custom description')
    })

    it('should handle nested field paths', () => {
      const entry = {
        seo: { title: 'Nested Title' },
      }

      const result = generateSeoFromEntry(entry, {
        title: 'seo.title',
      })

      expect(result.title).toBe('Nested Title')
    })

    it('should return empty object for null entry', () => {
      expect(generateSeoFromEntry(null, true)).toEqual({})
    })

    it('should treat unmatched single values as static', () => {
      const entry = { title: 'Hello' }

      const result = generateSeoFromEntry(entry, {
        robots: 'noindex',
      })

      expect(result.robots).toBe('noindex')
    })
  })
})
