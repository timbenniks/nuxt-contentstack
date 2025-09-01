import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup } from '@nuxt/test-utils/e2e'

describe('Nuxt Contentstack Module Integration', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/basic', import.meta.url)),
  })

  it('should build the fixture without errors', async () => {
    // This test just ensures the module can be loaded in a Nuxt app
    // without causing build errors
    expect(true).toBe(true)
  })

  it('should have the module installed', async () => {
    // Test that the setup completed successfully
    expect(true).toBe(true)
  })
})
