<script setup lang="ts">
import ContentstackFallbackBlock from "./ContentstackFallbackBlock.vue";

// Types
interface ContentstackBlock {
  [key: string]: any;
  _content_type_uid?: string;
  _metadata?: {
    uid: string;
    [key: string]: any;
  };
}

interface ProcessedBlock {
  name: string;
  props: Record<string, any>;
  originalBlock: ContentstackBlock;
}

interface ComponentMapping {
  [blockType: string]: any;
}

// Props
interface Props {
  /** Array of Contentstack modular blocks */
  blocks?: ContentstackBlock[];
  /** Component mapping object - maps block types to Vue components */
  componentMap?: ComponentMapping;
  /** Fallback component for unmapped block types */
  fallbackComponent?: any;
  /** CSS class for the container */
  containerClass?: string;
  /** CSS class for empty blocks (Visual Builder support) */
  emptyBlockClass?: string;
  /** Additional props to bind to the container */
  containerProps?: Record<string, any>;
  /** Show empty state when no blocks */
  showEmptyState?: boolean;
  /** CSS class for empty state */
  emptyStateClass?: string;
  /** Message to show in empty state */
  emptyStateMessage?: string;
  /** Custom key field for blocks (defaults to _metadata.uid) */
  keyField?: string;
  /** Whether to automatically extract block name from object keys */
  autoExtractBlockName?: boolean;
  /** Prefix to remove from block names when mapping components */
  blockNamePrefix?: string;
}

const props = withDefaults(defineProps<Props>(), {
  blocks: () => [],
  componentMap: () => ({}),
  fallbackComponent: ContentstackFallbackBlock,
  containerClass: "contentstack-modular-blocks",
  emptyBlockClass: "visual-builder__empty-block-parent",
  containerProps: () => ({}),
  showEmptyState: true,
  emptyStateClass: "contentstack-empty-state",
  emptyStateMessage: "No content blocks available",
  keyField: "_metadata.uid",
  autoExtractBlockName: true,
  blockNamePrefix: "",
});

// Computed
const processedBlocks = computed((): ProcessedBlock[] => {
  if (!props.blocks || props.blocks.length === 0) return [];

  return props.blocks.map((block: ContentstackBlock) => {
    let name = "";
    let blockProps = {};

    if (props.autoExtractBlockName) {
      // Auto-extract from object structure (like your original component)
      const entries = Object.entries(block);
      const blockEntry = entries.find(([key]) => !key.startsWith("_"));

      if (blockEntry) {
        name = blockEntry[0];
        blockProps = blockEntry[1] || {};
      }
    } else {
      // Use _content_type_uid or provided name
      name = block._content_type_uid || "unknown";
      blockProps = { ...block };
    }

    // Remove prefix if specified
    if (props.blockNamePrefix && name.startsWith(props.blockNamePrefix)) {
      name = name.slice(props.blockNamePrefix.length);
    }

    return {
      name,
      props: blockProps,
      originalBlock: block,
    };
  });
});

// Methods
function getComponentForBlock(block: ProcessedBlock): any {
  const component = props.componentMap[block.name];
  return component || props.fallbackComponent;
}

function getBlockProps(block: ProcessedBlock): Record<string, any> {
  return {
    ...block.props,
    // Add some helpful meta props
    blockType: block.name,
    blockMetadata: block.originalBlock._metadata,
  };
}

function getBlockKey(block: ProcessedBlock, index: number): string {
  // Try to get key from specified field path
  const keyPath = props.keyField.split(".");
  let key: any = block.originalBlock;

  for (const path of keyPath) {
    key = key?.[path];
  }

  // Fallback to index if no key found
  return (typeof key === "string" ? key : null) || `block-${index}`;
}

function getCslpData(block: ProcessedBlock, index: number): string | undefined {
  // Support for Contentstack Live Preview
  const cslp = block.originalBlock.cslp || block.props.cslp;
  return cslp?.[`blocks__${index}`]?.["data-cslp"] || cslp?.["data-cslp"];
}
</script>

<template>
  <section
    v-if="blocks && blocks.length > 0"
    :class="[containerClass, blocks.length === 0 ? emptyBlockClass : '']"
    v-bind="containerProps"
  >
    <component
      :is="getComponentForBlock(block)"
      v-for="(block, index) in processedBlocks"
      :key="getBlockKey(block, index)"
      v-bind="getBlockProps(block)"
      :data-block-type="block.name"
      :data-block-index="index"
      :data-cslp="getCslpData(block, index)"
    />
  </section>

  <!-- Fallback for empty state -->
  <div v-else-if="showEmptyState" :class="emptyStateClass">
    <slot name="empty">
      <p>{{ emptyStateMessage }}</p>
    </slot>
  </div>
</template>
