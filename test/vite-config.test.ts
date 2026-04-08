import { describe, it, expect } from 'vitest'
import { configureViteForContentstack } from '../src/vite-config'

function createMockNuxt(): any {
  return { options: { vite: {} } }
}

describe('configureViteForContentstack', () => {
  it('should add personalize SDK to SSR externals', () => {
    const nuxt = createMockNuxt()
    configureViteForContentstack(nuxt)

    expect(nuxt.options.vite.ssr.external).toContain('@contentstack/personalize-edge-sdk')
  })

  it('should exclude personalize SDK from optimizeDeps', () => {
    const nuxt = createMockNuxt()
    configureViteForContentstack(nuxt)

    expect(nuxt.options.vite.optimizeDeps.exclude).toContain('@contentstack/personalize-edge-sdk')
  })

  it('should include CJS dependencies in optimizeDeps', () => {
    const nuxt = createMockNuxt()
    configureViteForContentstack(nuxt)

    const include = nuxt.options.vite.optimizeDeps.include
    expect(include).toContain('@contentstack/delivery-sdk')
    expect(include).toContain('@contentstack/live-preview-utils')
    expect(include).toContain('@contentstack/core')
    expect(include).toContain('@contentstack/utils')
    expect(include).toContain('lodash')
    expect(include).toContain('qs')
    expect(include).toContain('humps')
    expect(include).toContain('form-data')
    expect(include).toContain('follow-redirects')
  })

  it('should include nested dependency syntax for pnpm/strict installs', () => {
    const nuxt = createMockNuxt()
    configureViteForContentstack(nuxt)

    const include = nuxt.options.vite.optimizeDeps.include
    expect(include).toContain('@contentstack/core > lodash')
    expect(include).toContain('@contentstack/core > qs')
    expect(include).toContain('@contentstack/delivery-sdk > humps')
    expect(include).toContain('@contentstack/core > axios > form-data')
  })

  it('should not duplicate entries on multiple calls', () => {
    const nuxt = createMockNuxt()
    configureViteForContentstack(nuxt)
    configureViteForContentstack(nuxt)

    const include = nuxt.options.vite.optimizeDeps.include
    const lodashCount = include.filter((d: string) => d === 'lodash').length
    expect(lodashCount).toBe(1)
  })

  it('should preserve existing SSR externals', () => {
    const nuxt = createMockNuxt()
    nuxt.options.vite.ssr = { external: ['some-existing-package'] }
    configureViteForContentstack(nuxt)

    expect(nuxt.options.vite.ssr.external).toContain('some-existing-package')
    expect(nuxt.options.vite.ssr.external).toContain('@contentstack/personalize-edge-sdk')
  })
})
