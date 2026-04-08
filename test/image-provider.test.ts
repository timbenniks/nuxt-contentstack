import { describe, it, expect } from 'vitest'

// Import the getImage function directly since defineProvider wraps it
import { getImage } from '../src/runtime/providers/contentstack'

describe('Image Provider', () => {
  it('should return URL with auto optimization defaults', () => {
    const result = getImage('https://images.contentstack.io/v3/image.jpg', {})

    expect(result.url).toContain('auto=webp%2Ccompress')
    expect(result.url).toContain('quality=80')
  })

  it('should apply width and height modifiers', () => {
    const result = getImage('https://images.contentstack.io/v3/image.jpg', {
      modifiers: { width: 800, height: 600 },
    })

    expect(result.url).toContain('width=800')
    expect(result.url).toContain('height=600')
  })

  it('should apply quality modifier', () => {
    const result = getImage('https://images.contentstack.io/v3/image.jpg', {
      modifiers: { quality: 90 },
    })

    expect(result.url).toContain('quality=90')
  })

  it('should handle fit modifier mapping', () => {
    const result = getImage('https://images.contentstack.io/v3/image.jpg', {
      modifiers: { fit: 'cover' },
    })

    expect(result.url).toContain('resize=bounds')
  })

  it('should handle full URLs without prepending baseURL', () => {
    const result = getImage('https://images.contentstack.io/v3/image.jpg', {
      baseURL: '/api',
    })

    expect(result.url.startsWith('https://images.contentstack.io/')).toBe(true)
  })

  it('should prepend baseURL for relative paths', () => {
    const result = getImage('/v3/image.jpg', {
      baseURL: 'https://images.contentstack.io',
    })

    expect(result.url).toContain('images.contentstack.io')
    expect(result.url).toContain('v3/image.jpg')
  })

  it('should return empty URL for non-string src', () => {
    const result = getImage(undefined as any, {})

    expect(result.url).toBe('')
  })

  it('should strip asset-specific modifiers from URL params', () => {
    const result = getImage('https://images.contentstack.io/v3/image.jpg', {
      modifiers: { assetuid: 'blt123', versionuid: 'v1', width: 400 },
    })

    expect(result.url).not.toContain('assetuid')
    expect(result.url).not.toContain('versionuid')
    expect(result.url).toContain('width=400')
  })
})
