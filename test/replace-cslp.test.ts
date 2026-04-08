import { describe, it, expect } from 'vitest'
import { replaceCslp } from '../src/runtime/utils'

describe('replaceCslp', () => {
  it('should replace $ keys with cslp', () => {
    const input = {
      title: 'Hello',
      $: { title: { 'data-cslp': 'page.blt123.en-us.title' } },
    }
    const result = replaceCslp(input) as Record<string, unknown>

    expect(result.title).toBe('Hello')
    expect(result.cslp).toBeDefined()
    expect(result.$).toBeUndefined()
  })

  it('should handle nested $ keys', () => {
    const input = {
      hero: {
        title: 'Hero',
        $: { title: { 'data-cslp': 'hero.blt456.en-us.title' } },
      },
    }
    const result = replaceCslp(input) as Record<string, any>

    expect(result.hero.cslp).toBeDefined()
    expect(result.hero.$).toBeUndefined()
  })

  it('should handle arrays', () => {
    const input = [
      { title: 'A', $: { title: { 'data-cslp': 'a' } } },
      { title: 'B', $: { title: { 'data-cslp': 'b' } } },
    ]
    const result = replaceCslp(input) as any[]

    expect(result).toHaveLength(2)
    expect(result[0].cslp).toBeDefined()
    expect(result[1].cslp).toBeDefined()
  })

  it('should return primitives as-is', () => {
    expect(replaceCslp(null as any)).toBeNull()
    expect(replaceCslp('string' as any)).toBe('string')
    expect(replaceCslp(42 as any)).toBe(42)
  })

  it('should handle objects without $ keys', () => {
    const input = { title: 'Hello', description: 'World' }
    const result = replaceCslp(input) as Record<string, unknown>

    expect(result.title).toBe('Hello')
    expect(result.description).toBe('World')
    expect(result.cslp).toBeUndefined()
  })
})
