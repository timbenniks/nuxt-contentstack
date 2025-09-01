import { describe, it, expect, beforeEach } from 'vitest'
import { getURLsforRegion } from '../src/runtime/utils'

describe('Utils', () => {
  describe('getURLsforRegion', () => {
    it('should return correct URLs for EU region', () => {
      const urls = getURLsforRegion('eu')

      expect(urls).toHaveProperty('contentManagement')
      expect(urls).toHaveProperty('contentDelivery')
      expect(urls).toHaveProperty('preview')
      expect(urls).toHaveProperty('application')
      expect(urls).toHaveProperty('personalizeEdge')
      expect(urls.contentManagement).toContain('eu-api.contentstack.com')
    })

    it('should return correct URLs for US region', () => {
      const urls = getURLsforRegion('us')

      expect(urls).toHaveProperty('contentManagement')
      expect(urls).toHaveProperty('contentDelivery')
      expect(urls).toHaveProperty('preview')
      expect(urls).toHaveProperty('application')
      expect(urls).toHaveProperty('personalizeEdge')
      expect(urls.contentManagement).toContain('api.contentstack.io')
    })

    it('should return correct URLs for AU region', () => {
      const urls = getURLsforRegion('au')

      expect(urls).toHaveProperty('contentManagement')
      expect(urls).toHaveProperty('contentDelivery')
      expect(urls.contentManagement).toContain('au-api.contentstack.com')
    })

    it('should default to EU region when no region provided', () => {
      const urls = getURLsforRegion()

      expect(urls.contentManagement).toContain('eu-api.contentstack.com')
    })

    it('should handle Azure NA region', () => {
      const urls = getURLsforRegion('azure-na')

      expect(urls).toHaveProperty('contentManagement')
      expect(urls).toHaveProperty('contentDelivery')
      expect(urls.contentManagement).toContain('azure-na-api.contentstack.com')
    })

    it('should handle Azure EU region', () => {
      const urls = getURLsforRegion('azure-eu')

      expect(urls).toHaveProperty('contentManagement')
      expect(urls).toHaveProperty('contentDelivery')
      expect(urls.contentManagement).toContain('azure-eu-api.contentstack.com')
    })

    it('should handle GCP NA region', () => {
      const urls = getURLsforRegion('gcp-na')

      expect(urls).toHaveProperty('contentManagement')
      expect(urls).toHaveProperty('contentDelivery')
      expect(urls.contentManagement).toContain('gcp-na-api.contentstack.com')
    })

    it('should handle GCP EU region', () => {
      const urls = getURLsforRegion('gcp-eu')

      expect(urls).toHaveProperty('contentManagement')
      expect(urls).toHaveProperty('contentDelivery')
      expect(urls.contentManagement).toContain('gcp-eu-api.contentstack.com')
    })

    it('should handle invalid region by defaulting to US', () => {
      // @ts-expect-error Testing invalid region
      const urls = getURLsforRegion('invalid-region')

      // Invalid regions default to US region according to the underlying library
      expect(urls.contentManagement).toContain('api.contentstack.io')
    })
  })
})
