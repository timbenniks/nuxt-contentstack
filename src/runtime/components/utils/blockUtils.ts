import { replaceCslp } from '../../utils'

/**
 * Contentstack block structure
 */
export interface ContentstackBlock {
  [key: string]: any
  _content_type_uid?: string
  _metadata?: {
    uid: string
    [key: string]: any
  }
}

/**
 * Processed block with extracted name and props
 */
export interface ProcessedBlock {
  name: string
  props: Record<string, any>
  originalBlock: ContentstackBlock
}

/**
 * Extract blocks from nested object path (e.g., 'components' or 'page.components')
 */
export function extractBlocksFromPath(data: any, path: string): ContentstackBlock[] {
  const fieldPath = path.split('.')
  let blocks = data

  for (const field of fieldPath) {
    blocks = blocks?.[field]
  }

  return Array.isArray(blocks) ? blocks : []
}

/**
 * Process a single block: extract name and props, handle CSLP replacement
 */
export function processBlock(
  block: ContentstackBlock,
  options: {
    autoExtractBlockName: boolean
    blockNamePrefix: string
    editableTags: boolean
  }
): ProcessedBlock {
  let name = ''
  let blockProps: Record<string, any> = {}

  if (options.autoExtractBlockName) {
    // Auto-extract from object structure
    const entries = Object.entries(block)
    const blockEntry = entries.find(([key]) => !key.startsWith('_'))

    if (blockEntry) {
      name = blockEntry[0]
      // Only clean CSLP when editableTags is enabled
      blockProps = options.editableTags
        ? (replaceCslp(blockEntry[1] || {}) as Record<string, any>)
        : blockEntry[1] || {}
    }
  } else {
    // Use _content_type_uid or provided name
    name = block._content_type_uid || 'unknown'
    // Only clean CSLP when editableTags is enabled
    blockProps = options.editableTags
      ? (replaceCslp({ ...block }) as Record<string, any>)
      : { ...block }
  }

  // Remove prefix if specified
  if (options.blockNamePrefix && name.startsWith(options.blockNamePrefix)) {
    name = name.slice(options.blockNamePrefix.length)
  }

  return {
    name,
    props: blockProps,
    originalBlock: block,
  }
}

/**
 * Get component for a block from component mapping
 */
export function getComponentForBlock(
  block: ProcessedBlock,
  componentMap: Record<string, any>,
  fallbackComponent: any
): any {
  return componentMap[block.name] || fallbackComponent
}

/**
 * Generate props for a block component
 */
export function getBlockProps(block: ProcessedBlock, blockMetadata?: any): Record<string, any> {
  return {
    ...block.props,
    // Add helpful meta props
    blockType: block.name,
    blockMetadata: blockMetadata || block.originalBlock._metadata,
  }
}

/**
 * Generate unique key for a block
 */
export function getBlockKey(block: ProcessedBlock, keyField: string, index: number): string {
  // Try to get key from specified field path
  const keyPath = keyField.split('.')
  let key: any = block.originalBlock

  for (const path of keyPath) {
    key = key?.[path]
  }

  // Fallback to index if no key found
  return (typeof key === 'string' ? key : null) || `block-${index}`
}

/**
 * Extract CSLP data attribute for a block
 */
export function getCslpData(block: ProcessedBlock, index: number): string | undefined {
  // Support for Contentstack Live Preview
  const cslp = block.originalBlock.cslp || block.props.cslp
  return cslp?.[`blocks__${index}`]?.['data-cslp'] || cslp?.['data-cslp']
}

