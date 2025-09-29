<script setup lang="ts">
import { computed, ref, useSeoMeta, useNuxtApp } from "#imports";
// @ts-expect-error - Vue SFC import without explicit default export
import ContentstackFallbackBlock from "./ContentstackFallbackBlock.vue";
import { useGetEntryByUrl } from "../composables/useGetEntryByUrl";
import { replaceCslp } from "../utils";

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

// SEO Meta types - use Nuxt's native useSeoMeta types
type SeoMetaInput = Parameters<typeof useSeoMeta>[0];

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

  // Entry fetching props (from useGetEntryByUrl)
  /** Content type UID for fetching entry */
  contentTypeUid?: string;
  /** URL to fetch entry by */
  url?: string;
  /** Reference field paths to include */
  referenceFieldPath?: string[];
  /** JSON RTE field paths */
  jsonRtePath?: string[];
  /** Locale for the entry */
  locale?: string;
  /** Replace HTML CSLP tags */
  replaceHtmlCslp?: boolean;
  /** Field path to extract modular blocks from (e.g., 'modular_blocks' or 'page_components') */
  blocksFieldPath?: string;
  /** SEO metadata object - passed directly to useSeoMeta */
  seoMeta?: SeoMetaInput;
  /** Auto-generate SEO metadata from fetched entry data using field mapping */
  autoSeoMeta?: boolean | Record<string, string>;
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
  referenceFieldPath: () => [],
  jsonRtePath: () => [],
  locale: "en-us",
  replaceHtmlCslp: undefined,
  blocksFieldPath: "components",
  seoMeta: undefined,
  autoSeoMeta: false,
});

// Helper function to extract blocks from nested object path
function extractBlocksFromPath(data: any, path: string): ContentstackBlock[] {
  const fieldPath = path.split(".");
  let blocks = data;

  for (const field of fieldPath) {
    blocks = blocks?.[field];
  }

  return Array.isArray(blocks) ? blocks : [];
}

// Helper function to generate SEO metadata from entry data
function generateSeoFromEntry(
  entryData: any,
  autoSeoMeta: boolean | Record<string, string>
): SeoMetaInput {
  if (!entryData) return {};

  // Default field mapping when autoSeoMeta is true
  const defaultMapping: Record<string, string> = {
    title: "seo_title|title|name",
    description: "seo_description|description|summary",
    ogTitle: "seo_title|title|name",
    ogDescription: "seo_description|description|summary",
    ogImage: "featured_image.url|og_image.url|image.url",
  };

  // Use custom mapping if provided, otherwise use default
  const fieldMapping =
    typeof autoSeoMeta === "object" ? autoSeoMeta : defaultMapping;

  const seoObject: Record<string, any> = {};

  for (const [seoKey, fieldPath] of Object.entries(fieldMapping)) {
    // Handle static values (no field path)
    if (!fieldPath.includes("|") && !fieldPath.includes(".")) {
      seoObject[seoKey] = fieldPath;
      continue;
    }

    // Handle field paths with fallbacks (separated by |)
    const fieldOptions = fieldPath.split("|");

    for (const field of fieldOptions) {
      let value;

      // Handle nested field paths (e.g., 'featured_image.url')
      if (field.includes(".")) {
        const nestedPath = field.split(".");
        value = entryData;
        for (const part of nestedPath) {
          value = value?.[part];
        }
      } else {
        value = entryData[field];
      }

      if (value) {
        seoObject[seoKey] = value;
        break; // Use first available value
      }
    }
  }

  return seoObject;
}

// Main logic
const shouldFetchEntry = computed(() => !!(props.contentTypeUid && props.url));

// Get editableTags setting from Contentstack context
const { editableTags } = useNuxtApp().$contentstack as {
  editableTags: boolean;
};

// Only replace CSLP when editableTags is enabled, otherwise use user preference or default to false
const shouldReplaceCslp = props.replaceHtmlCslp ?? editableTags;

// Initialize entry data
const entryData = ref(null);
const entryStatus = ref("success");
let refreshEntry = () => {};

// Expose refresh function
defineExpose({ refreshEntry: () => refreshEntry() });

// Fetch entry data if needed
if (shouldFetchEntry.value) {
  const entryResult = await useGetEntryByUrl({
    contentTypeUid: props.contentTypeUid!,
    url: props.url!,
    referenceFieldPath: props.referenceFieldPath,
    jsonRtePath: props.jsonRtePath,
    locale: props.locale,
    replaceHtmlCslp: shouldReplaceCslp,
  });

  entryData.value = entryResult.data.value as any;
  entryStatus.value = entryResult.status.value;
  refreshEntry = entryResult.refresh;

  // Handle SEO metadata
  let seoMetaToApply: SeoMetaInput = {};

  // Manual SEO metadata (takes priority)
  if (props.seoMeta) {
    seoMetaToApply = { ...seoMetaToApply, ...props.seoMeta };
  }

  // Auto-generated SEO metadata from entry data
  if (props.autoSeoMeta && entryData.value) {
    const autoGeneratedSeo = generateSeoFromEntry(
      entryData.value,
      props.autoSeoMeta
    );
    // Manual seoMeta takes priority over auto-generated
    seoMetaToApply = { ...autoGeneratedSeo, ...seoMetaToApply };
  }

  // Apply SEO metadata if we have any
  if (Object.keys(seoMetaToApply).length > 0) {
    useSeoMeta(seoMetaToApply);
  }
}

// Get blocks from either fetched entry or props
const extractedBlocks = computed((): ContentstackBlock[] => {
  if (shouldFetchEntry.value && entryData.value) {
    return extractBlocksFromPath(entryData.value, props.blocksFieldPath!);
  }
  return props.blocks || [];
});

// Computed
const processedBlocks = computed((): ProcessedBlock[] => {
  const blocksToProcess = extractedBlocks.value;
  if (!blocksToProcess || blocksToProcess.length === 0) return [];

  return blocksToProcess.map((block: ContentstackBlock) => {
    let name = "";
    let blockProps = {};

    if (props.autoExtractBlockName) {
      // Auto-extract from object structure (like your original component)
      const entries = Object.entries(block);
      const blockEntry = entries.find(([key]) => !key.startsWith("_"));

      if (blockEntry) {
        name = blockEntry[0];
        // Only clean CSLP when editableTags is enabled
        blockProps = editableTags
          ? (replaceCslp(blockEntry[1] || {}) as Record<string, any>)
          : blockEntry[1] || {};
      }
    } else {
      // Use _content_type_uid or provided name
      name = block._content_type_uid || "unknown";
      // Only clean CSLP when editableTags is enabled
      blockProps = editableTags
        ? (replaceCslp({ ...block }) as Record<string, any>)
        : { ...block };
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
  <!-- Loading state when fetching entry -->
  <div
    v-if="shouldFetchEntry && entryStatus === 'pending'"
    :class="emptyStateClass"
  >
    <slot name="loading">
      <p>Loading content...</p>
    </slot>
  </div>

  <!-- Error state when entry fetch fails -->
  <div
    v-else-if="shouldFetchEntry && entryStatus === 'error'"
    :class="emptyStateClass"
  >
    <slot name="error">
      <p>Failed to load content. Please try again.</p>
    </slot>
  </div>

  <!-- Main content when blocks are available -->
  <section
    v-else-if="extractedBlocks && extractedBlocks.length > 0"
    :class="[
      containerClass,
      extractedBlocks.length === 0 ? emptyBlockClass : '',
    ]"
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
