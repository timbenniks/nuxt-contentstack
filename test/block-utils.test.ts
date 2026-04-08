import { describe, it, expect } from 'vitest'
import { extractBlocksFromPath, processBlock, getBlockKey, getCslpData } from '../src/runtime/components/utils/blockUtils'

describe('Block Utils', () => {
  describe('extractBlocksFromPath', () => {
    it('should extract blocks from a simple path', () => {
      const data = { components: [{ hero: { title: 'Hello' } }] }
      const result = extractBlocksFromPath(data, 'components')

      expect(result).toHaveLength(1)
      expect(result[0].hero.title).toBe('Hello')
    })

    it('should extract blocks from a nested path', () => {
      const data = { page: { components: [{ hero: {} }] } }
      const result = extractBlocksFromPath(data, 'page.components')

      expect(result).toHaveLength(1)
    })

    it('should return empty array for missing path', () => {
      const result = extractBlocksFromPath({}, 'components')
      expect(result).toEqual([])
    })

    it('should return empty array for non-array value', () => {
      const result = extractBlocksFromPath({ components: 'not-an-array' }, 'components')
      expect(result).toEqual([])
    })

    it('should return empty array for null data', () => {
      const result = extractBlocksFromPath(null, 'components')
      expect(result).toEqual([])
    })
  })

  describe('processBlock', () => {
    it('should auto-extract block name from object keys', () => {
      const block = { hero: { title: 'Hello' }, _metadata: { uid: '123' } }
      const result = processBlock(block, {
        autoExtractBlockName: true,
        blockNamePrefix: '',
        editableTags: false,
      })

      expect(result.name).toBe('hero')
      expect(result.props.title).toBe('Hello')
    })

    it('should remove block name prefix', () => {
      const block = { cs_hero: { title: 'Hello' } }
      const result = processBlock(block, {
        autoExtractBlockName: true,
        blockNamePrefix: 'cs_',
        editableTags: false,
      })

      expect(result.name).toBe('hero')
    })

    it('should use _content_type_uid when not auto-extracting', () => {
      const block = { _content_type_uid: 'hero_block', title: 'Hello' }
      const result = processBlock(block, {
        autoExtractBlockName: false,
        blockNamePrefix: '',
        editableTags: false,
      })

      expect(result.name).toBe('hero_block')
    })
  })

  describe('getBlockKey', () => {
    it('should extract key from metadata uid', () => {
      const block = {
        name: 'hero',
        props: {},
        originalBlock: { _metadata: { uid: 'abc123' } },
      }
      const result = getBlockKey(block, '_metadata.uid', 0)

      expect(result).toBe('abc123')
    })

    it('should fall back to index when key not found', () => {
      const block = {
        name: 'hero',
        props: {},
        originalBlock: {},
      }
      const result = getBlockKey(block, '_metadata.uid', 5)

      expect(result).toBe('block-5')
    })
  })

  describe('getCslpData', () => {
    it('should return undefined when no cslp data', () => {
      const block = { name: 'hero', props: {}, originalBlock: {} }
      expect(getCslpData(block, 0)).toBeUndefined()
    })
  })
})
