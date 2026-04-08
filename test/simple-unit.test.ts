import { describe, it, expect } from 'vitest'

describe('Simple Unit Tests', () => {
  describe('Module functionality', () => {
    it('should import the main module without errors', async () => {
      const module = await import('../src/module')
      expect(module.default).toBeDefined()
      expect(typeof module.default).toBe('function')
    })

    it('should import utilities without errors', async () => {
      const utils = await import('../src/runtime/utils')
      expect(utils.getURLsforRegion).toBeDefined()
      expect(typeof utils.getURLsforRegion).toBe('function')
      expect(utils.replaceCslp).toBeDefined()
      expect(typeof utils.replaceCslp).toBe('function')
    })

    it('should have valid file structure', async () => {
      const { existsSync } = await import('node:fs')
      const { resolve } = await import('node:path')

      const files = [
        'src/module.ts',
        'src/vite-config.ts',
        'src/runtime/utils.ts',
        'src/runtime/constants.ts',
        'src/runtime/contentstack.ts',
        'src/runtime/composables/useGetEntryByUrl.ts',
        'src/runtime/composables/useGetEntry.ts',
        'src/runtime/composables/useGetEntries.ts',
        'src/runtime/composables/useGetAsset.ts',
        'src/runtime/composables/useGetAssets.ts',
        'src/runtime/composables/useContentstack.ts',
        'src/runtime/composables/useImageTransform.ts',
        'src/runtime/composables/utils.ts',
        'src/runtime/composables/error-handling.ts',
        'src/runtime/providers/contentstack.ts',
        'src/runtime/server/middleware/personalize.ts',
        'src/runtime/components/ContentstackModularBlocks.vue',
        'src/runtime/components/ContentstackFallbackBlock.vue',
        'src/runtime/components/utils/blockUtils.ts',
        'src/runtime/components/utils/seoUtils.ts',
      ]

      files.forEach((file) => {
        expect(existsSync(resolve(file)), `${file} should exist`).toBe(true)
      })
    })
  })

  describe('Package information', () => {
    it('should have correct package metadata', async () => {
      const packageJson = await import('../package.json')

      expect(packageJson.name).toBe('nuxt-contentstack')
      expect(packageJson.license).toBe('MIT')
      expect(packageJson.type).toBe('module')
    })

    it('should have required dependencies', async () => {
      const packageJson = await import('../package.json')

      expect(packageJson.dependencies['@contentstack/delivery-sdk']).toBeDefined()
      expect(packageJson.dependencies['@contentstack/live-preview-utils']).toBeDefined()
      expect(packageJson.dependencies['@contentstack/personalize-edge-sdk']).toBeDefined()
      expect(packageJson.dependencies['@nuxt/kit']).toBeDefined()
      expect(packageJson.dependencies['@timbenniks/contentstack-endpoints']).toBeDefined()
    })

    it('should have @nuxt/image as optional peer dependency', async () => {
      const packageJson = await import('../package.json')

      expect(packageJson.peerDependencies['@nuxt/image']).toBeDefined()
      expect(packageJson.peerDependenciesMeta['@nuxt/image'].optional).toBe(true)
    })
  })
})
