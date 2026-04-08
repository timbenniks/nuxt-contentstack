import { describe, it, expect } from 'vitest'
import { configureViteForContentstack } from '../src/vite-config'

function createMockNuxt(): any {
  return { options: { build: {}, vite: {} } }
}

const CS_BROWSER_RE = /^@contentstack\/(?!personalize-edge-sdk)/

describe('configureViteForContentstack', () => {
  it('should add the @contentstack regex to build.transpile', () => {
    const nuxt = createMockNuxt()
    configureViteForContentstack(nuxt)

    const hasRegex = nuxt.options.build.transpile.some(
      (t: any) => t instanceof RegExp && t.source === CS_BROWSER_RE.source,
    )
    expect(hasRegex).toBe(true)
  })

  it('should match browser packages and exclude personalize-edge-sdk via regex', () => {
    expect(CS_BROWSER_RE.test('@contentstack/delivery-sdk')).toBe(true)
    expect(CS_BROWSER_RE.test('@contentstack/live-preview-utils')).toBe(true)
    expect(CS_BROWSER_RE.test('@contentstack/core')).toBe(true)
    expect(CS_BROWSER_RE.test('@contentstack/utils')).toBe(true)
    expect(CS_BROWSER_RE.test('@contentstack/some-future-package')).toBe(true)
    expect(CS_BROWSER_RE.test('@contentstack/personalize-edge-sdk')).toBe(false)
  })

  it('should add transitive CJS dependencies to build transpile', () => {
    const nuxt = createMockNuxt()
    configureViteForContentstack(nuxt)

    expect(nuxt.options.build.transpile).toContain('lodash')
    expect(nuxt.options.build.transpile).toContain('qs')
    expect(nuxt.options.build.transpile).toContain('humps')
  })

  it('should add the @contentstack regex to SSR noExternal', () => {
    const nuxt = createMockNuxt()
    configureViteForContentstack(nuxt)

    const hasRegex = nuxt.options.vite.ssr.noExternal.some(
      (t: any) => t instanceof RegExp && t.source === CS_BROWSER_RE.source,
    )
    expect(hasRegex).toBe(true)
  })

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

  it('should include Contentstack packages and transitive CJS deps in optimizeDeps', () => {
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
  })

  it('should not duplicate entries on multiple calls', () => {
    const nuxt = createMockNuxt()
    configureViteForContentstack(nuxt)
    configureViteForContentstack(nuxt)

    const transpile = nuxt.options.build.transpile
    const include = nuxt.options.vite.optimizeDeps.include
    const noExternal = nuxt.options.vite.ssr.noExternal

    // Regex should appear only once
    const regexCount = transpile.filter(
      (t: any) => t instanceof RegExp && t.source === CS_BROWSER_RE.source,
    ).length
    expect(regexCount).toBe(1)

    // String entries should appear only once
    const lodashCount = transpile.filter((d: string) => d === 'lodash').length
    const deliverySdkCount = include.filter((d: string) => d === '@contentstack/delivery-sdk').length
    const noExtRegexCount = noExternal.filter(
      (t: any) => t instanceof RegExp && t.source === CS_BROWSER_RE.source,
    ).length

    expect(lodashCount).toBe(1)
    expect(deliverySdkCount).toBe(1)
    expect(noExtRegexCount).toBe(1)
  })

  it('should preserve existing SSR externals', () => {
    const nuxt = createMockNuxt()
    nuxt.options.vite.ssr = { external: ['some-existing-package'] }
    configureViteForContentstack(nuxt)

    expect(nuxt.options.vite.ssr.external).toContain('some-existing-package')
    expect(nuxt.options.vite.ssr.external).toContain('@contentstack/personalize-edge-sdk')
  })

  it('should add extraTranspile packages to build.transpile and optimizeDeps.include', () => {
    const nuxt = createMockNuxt()
    configureViteForContentstack(nuxt, ['some-cjs-lib', 'another-cjs-lib'])

    expect(nuxt.options.build.transpile).toContain('some-cjs-lib')
    expect(nuxt.options.build.transpile).toContain('another-cjs-lib')
    expect(nuxt.options.vite.optimizeDeps.include).toContain('some-cjs-lib')
    expect(nuxt.options.vite.optimizeDeps.include).toContain('another-cjs-lib')
  })

  it('should preserve user-defined noExternal=true', () => {
    const nuxt = createMockNuxt()
    nuxt.options.vite.ssr = { noExternal: true }
    configureViteForContentstack(nuxt)

    expect(nuxt.options.vite.ssr.noExternal).toBe(true)
  })
})
