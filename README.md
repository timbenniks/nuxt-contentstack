![Nuxt Contentstack](https://res.cloudinary.com/dwfcofnrd/image/upload/q_auto,f_auto/cs_ajyrsk.png)

# Nuxt Contentstack

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Contentstack integration for Nuxt.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
- [🏀 Online playground](https://stackblitz.com/github/timbenniks/nuxt-contentstack?file=playground%2Fapp.vue)
- [📖 Documentation](https://nuxt-contentstack-docs.eu-contentstackapps.com/)

> Notice: This is an OSS project by @timbenniks and _not_ an officially maintained package by the Contentstack team. Support requests can come through Github issues and via direct channels to @timbenniks.

## Features

- ⚡️ Easy setup
- ⚡️ Complete set of Vue composables for Contentstack
- ⚡️ Route-based content fetching with automatic middleware
- ⚡️ Query entries and assets with advanced filtering
- ⚡️ Advanced filtering and pagination
- ⚡️ Image transformations with reactive URLs
- ⚡️ @nuxt/image integration with automatic optimization
- ⚡️ Nuxt DevTools integration for debugging and monitoring
- ⚡️ Live Preview & Visual builder
- ⚡️ Personalization support
- ⚡️ TypeScript support with full type safety
- ⚡️ Exposed SDKs: TS Delivery SDK, Live Preview Utils SDK, Personalize SDK

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxi module add nuxt-contentstack
```

Or: add to `nuxt.config.ts`:

```js
modules: ['nuxt-contentstack'],

'nuxt-contentstack': {
  // Required core settings
  apiKey: 'your_contentstack_api_key',
  deliveryToken: 'your_delivery_token',
  environment: 'your_environment',

  // Optional settings with smart defaults
  region: 'eu',
  branch: 'main',
  locale: 'en-us',

  // Live Preview
  livePreview: {
    enable: true,
    previewToken: 'your_preview_token', // no need for preview token if you are not using live preview
    editableTags: true,
    editButton: true
  },

  // Personalization
  personalization: {
    enable: true,
    projectUid: 'your_project_uid'
  },

  debug: true
},
```

## Options

### Core Settings (Required)

- `apiKey` - Your Contentstack stack API key (starts with "blt")
- `deliveryToken` - Your Contentstack delivery token (starts with "cs")
- `environment` - Target environment ('preview' | 'production')

### Core Settings (Optional)

- `region` - Contentstack region: 'us' | 'eu' | 'au' | 'azure-na' | 'azure-eu' | 'gcp-na' | 'gcp-eu' (default: 'us')
- `branch` - Content branch (default: 'main')
- `locale` - Default locale (default: 'en-us')

### Live Preview Settings

Configure `livePreview` object with:

- `enable` - Enable live preview mode
- `previewToken` - Preview token from Contentstack (starts with "cs", required if enabled)
- `editableTags` - Add editable tags for visual building
- `editButton` - Enable edit button (boolean or detailed config object)
- `mode` - Live preview mode: 'builder' | 'preview' (default: 'builder')
- `ssr` - Enable SSR mode (experimental, default: false)

### Personalization Settings

Configure `personalization` object with:

- `enable` - Enable personalization features
- `projectUid` - Your personalization project UID (found in Contentstack UI)

### General Settings

- `debug` - Enable debug logging and configuration dumping

### Personalization examples

```ts
// get Personalize SDK
const { Personalize } = useNuxtApp().$contentstack;

// set attribute
await Personalize.set({ age: 20 });

// trigger impression
// experienceShortId to be found on the experiences list page in contentstack
experienceShortId = 0;
await Personalize.triggerImpression(experienceShortId);

// trigger conversion event
// 'eventKey' can be found when creatign an event in Contentstack Personalize
await Personalize.triggerEvent("eventKey");
```

## Route-based Content Fetching

Automatically fetch page content based on the current route without manual composable calls.

> **Zero-config content fetching** - Just enable the middleware and content becomes available via `useAutoFetchedContent()` based on your URL patterns. Perfect for pages, blog posts, products, and any URL-based content.

### Setup

Enable auto-fetch in your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ["nuxt-contentstack"],

  "nuxt-contentstack": {
    // ... other configuration

    // Route-based content fetching
    autoFetch: {
      enabled: true, // Enable the middleware

      // Routes to include (optional - if empty, all routes are processed)
      include: [
        "/", // Homepage
        "/about", // Specific routes
        "/blog/*", // Wildcard patterns
        "/products/**", // Deep wildcard patterns
      ],

      // Routes to exclude
      exclude: ["/admin/**", "/api/**", "/_nuxt/**"],

      // Map routes to content types
      contentTypeMapping: {
        "/": "page", // Homepage uses 'page' content type
        "/blog/*": "article", // Blog routes use 'article' content type
        "/products/*": "product", // Product routes use 'product' content type
        default: "page", // Fallback content type
      },

      // Additional options
      options: {
        locale: "en-us",
        includeReferences: ["author", "category"], // References to include
        includeFallback: true,
        cacheKey: "auto-fetch",
        errorHandling: "silent", // 'silent' | 'throw' | 'log'
      },
    },
  },
});
```

### Usage

Access auto-fetched content in your pages without manual fetching:

```vue
<script setup>
// No manual composable calls needed!
const { content, isLoaded, meta, refresh } = useAutoFetchedContent<Page>();
</script>

<template>
  <div v-if="isLoaded && content">
    <h1>{{ content.title }}</h1>
    <p>{{ content.description }}</p>

    <!-- Content is automatically available based on current route -->
    <div v-html="content.rich_text" />

    <!-- Metadata about the fetched content -->
    <div class="meta">
      <p>Content Type: {{ meta.contentType }}</p>
      <p>UID: {{ meta.uid }}</p>
      <p>Fetched: {{ meta.fetchedAt }}</p>
    </div>

    <!-- Manual refresh if needed -->
    <button @click="refresh">Refresh Content</button>
  </div>
</template>
```

### Advanced Usage

#### Get content for specific routes:

```vue
<script setup>
const { getContentFor } = useAutoFetchedContent();

// Get content for other routes
const aboutContent = getContentFor("/about");
const blogContent = getContentFor("/blog/my-post", "article");
</script>
```

#### Route patterns:

- **Exact matches**: `/about` matches only `/about`
- **Single wildcard**: `/blog/*` matches `/blog/post-1` but not `/blog/category/post-1`
- **Deep wildcard**: `/blog/**` matches all nested routes under `/blog/`

### Benefits

- ✅ **Zero boilerplate** - Content automatically available based on URL
- ✅ **Smart caching** - Efficient content deduplication and storage
- ✅ **Flexible routing** - Support for complex route patterns
- ✅ **Error handling** - Configurable error modes (silent, log, throw)
- ✅ **TypeScript support** - Full type safety with generics
- ✅ **Backward compatible** - Works alongside existing manual fetching

### How It Works

1. **Middleware runs** on every route change
2. **URL is matched** against your include/exclude patterns
3. **Content type is determined** from your mapping configuration
4. **Content is fetched** from Contentstack using the URL field
5. **Data becomes available** via `useAutoFetchedContent()` in your components

This eliminates the need for manual `useGetEntryByUrl()` calls in every page component!

## Provides

This module provides a `$contentstack` object with:

- `stack`: The Stack object from the Delivery SDK. Query all the things with this.
- `ContentstackLivePreview`: The instance of Live Preview Utils SDK.
- `livePreviewEnabled`: Was live preview enabled?
- `editableTags`: Do we want editable tags fo visual building?
- `Personalize`: The instance of Personalize SDK.
- `variantAlias`: The variant manifest to pass to the Delivery SDK.

```ts
const {
  editableTags,
  stack,
  livePreviewEnabled,
  ContentstackLivePreview,
  Personalize,
  variantAlias,
  VB_EmptyBlockParentClass,
} = useNuxtApp().$contentstack;
```

## Components

This module provides Vue components for common Contentstack use cases.

### `ContentstackModularBlocks`

A flexible, generic component for rendering Contentstack modular blocks as Vue components. Perfect for dynamic page layouts, component libraries, and content-driven UIs.

#### Features

- ✅ **Auto-component mapping** - Automatically maps Contentstack block types to Vue components
- ✅ **Auto-fetch capability** - Can fetch entry data and extract blocks automatically (NEW)
- ✅ **Flexible data structure** - Works with various Contentstack modular block formats
- ✅ **Live Preview ready** - Full support for Contentstack Live Preview with `data-cslp` attributes
- ✅ **Visual Builder support** - Includes empty state classes for visual building
- ✅ **TypeScript support** - Comprehensive type definitions with generics
- ✅ **SSR compatible** - Renders perfectly on server and hydrates seamlessly
- ✅ **Customizable styling** - Configurable CSS classes and container props
- ✅ **Error handling** - Graceful fallbacks for unmapped components
- ✅ **Slot support** - Custom loading, error, and empty state content via slots

#### Usage Patterns

The component supports two usage patterns for maximum flexibility:

**Pattern 1: Auto-fetch Entry + Render Blocks (NEW)**

Perfect for simple page rendering - just provide entry details and let the component handle everything:

```vue
<script setup>
import Hero from "./components/Hero.vue";
import Grid from "./components/Grid.vue";
import TextBlock from "./components/TextBlock.vue";

// Map Contentstack block types to Vue components
const componentMapping = {
  hero: Hero,
  grid: Grid,
  text_block: TextBlock,
};
</script>

<template>
  <!-- Component fetches entry and renders blocks automatically -->
  <ContentstackModularBlocks
    content-type-uid="page"
    :url="$route.path"
    blocks-field-path="components"
    :reference-field-path="['blocks.block.image']"
    :json-rte-path="['rich_text', 'blocks.block.copy']"
    locale="en-us"
    :component-map="componentMapping"
  >
    <!-- Custom loading state -->
    <template #loading>
      <div class="loading-spinner">Loading page content...</div>
    </template>

    <!-- Custom error state -->
    <template #error>
      <div class="error-message">Failed to load content</div>
    </template>
  </ContentstackModularBlocks>
</template>
```

**Pattern 2: Traditional with Pre-fetched Blocks**

For when you need more control over data fetching:

```vue
<script setup>
import Hero from "./components/Hero.vue";
import Grid from "./components/Grid.vue";
import TextBlock from "./components/TextBlock.vue";

// Map Contentstack block types to Vue components
const componentMapping = {
  hero: Hero,
  grid: Grid,
  text_block: TextBlock,
};

// Fetch your page data manually
const { data: page } = await useGetEntryByUrl({
  contentTypeUid: "page",
  url: useRoute().path,
});
</script>

<template>
  <!-- Pass pre-fetched blocks -->
  <ContentstackModularBlocks
    :blocks="page.components"
    :component-map="componentMapping"
  />
</template>
```

#### Advanced Usage

```vue
<script setup>
import Hero from "./blocks/Hero.vue";
import Grid from "./blocks/Grid.vue";
import DefaultBlock from "./blocks/DefaultBlock.vue";

const componentMapping = {
  hero: Hero,
  grid: Grid,
  text_section: TextSection,
  image_gallery: ImageGallery,
};
</script>

<template>
  <ContentstackModularBlocks
    :blocks="page.modular_blocks"
    :component-map="componentMapping"
    :fallback-component="DefaultBlock"
    :auto-extract-block-name="true"
    :show-empty-state="true"
    container-class="page-blocks"
    empty-block-class="visual-builder__empty-block-parent"
    empty-state-message="No content blocks available"
    key-field="_metadata.uid"
    block-name-prefix="block_"
    :container-props="{ 'data-page-id': page.uid }"
  >
    <!-- Custom empty state -->
    <template #empty>
      <div class="custom-empty-state">
        <h3>No content blocks found</h3>
        <p>Please add some content in Contentstack</p>
      </div>
    </template>
  </ContentstackModularBlocks>
</template>
```

#### Props

**Core Props:**

| Prop                | Type                  | Default                     | Description                                  |
| ------------------- | --------------------- | --------------------------- | -------------------------------------------- |
| `blocks`            | `ContentstackBlock[]` | `[]`                        | Array of Contentstack modular blocks         |
| `componentMap`      | `ComponentMapping`    | `{}`                        | Object mapping block types to Vue components |
| `fallbackComponent` | `Component \| string` | `ContentstackFallbackBlock` | Fallback component for unmapped block types  |

**Auto-fetch Props (NEW):**

| Prop                 | Type                                | Default        | Description                                         |
| -------------------- | ----------------------------------- | -------------- | --------------------------------------------------- |
| `contentTypeUid`     | `string`                            | `undefined`    | Content type UID for fetching entry                 |
| `url`                | `string`                            | `undefined`    | URL to fetch entry by                               |
| `referenceFieldPath` | `string[]`                          | `[]`           | Reference field paths to include                    |
| `jsonRtePath`        | `string[]`                          | `[]`           | JSON RTE field paths                                |
| `locale`             | `string`                            | `'en-us'`      | Locale for the entry                                |
| `replaceHtmlCslp`    | `boolean`                           | `false`        | Replace HTML CSLP tags                              |
| `blocksFieldPath`    | `string`                            | `'components'` | Field path to extract modular blocks from           |
| `seoMeta`            | `SeoMetaInput`                      | `undefined`    | SEO metadata object (passed directly to useSeoMeta) |
| `autoSeoMeta`        | `boolean \| Record<string, string>` | `false`        | Auto-generate SEO from entry data                   |

**Styling Props:**

| Prop                | Type                  | Default                                | Description                                 |
| ------------------- | --------------------- | -------------------------------------- | ------------------------------------------- |
| `containerClass`    | `string`              | `'contentstack-modular-blocks'`        | CSS class for the container                 |
| `emptyBlockClass`   | `string`              | `'visual-builder__empty-block-parent'` | CSS class for empty blocks (Visual Builder) |
| `containerProps`    | `Record<string, any>` | `{}`                                   | Additional props to bind to the container   |
| `showEmptyState`    | `boolean`             | `true`                                 | Show empty state when no blocks             |
| `emptyStateClass`   | `string`              | `'contentstack-empty-state'`           | CSS class for empty state                   |
| `emptyStateMessage` | `string`              | `'No content blocks available'`        | Message to show in empty state              |

**Advanced Props:**

| Prop                   | Type      | Default           | Description                              |
| ---------------------- | --------- | ----------------- | ---------------------------------------- |
| `keyField`             | `string`  | `'_metadata.uid'` | Custom key field for blocks              |
| `autoExtractBlockName` | `boolean` | `true`            | Auto-extract block name from object keys |
| `blockNamePrefix`      | `string`  | `''`              | Prefix to remove from block names        |

#### SEO Metadata Support (NEW)

The component can automatically set SEO metadata when using the auto-fetch pattern, using Nuxt's native [`useSeoMeta`](https://nuxt.com/docs/4.x/api/composables/use-seo-meta) types and functionality.

**Simple Usage:**

```vue
<template>
  <!-- Pass SEO metadata directly using useSeoMeta format -->
  <ContentstackModularBlocks
    content-type-uid="page"
    :url="$route.path"
    :seo-meta="{
      title: 'My Page Title',
      description: 'My page description',
      ogTitle: 'My Social Title',
      ogDescription: 'My social description',
      ogImage: 'https://example.com/image.jpg',
      twitterCard: 'summary_large_image',
    }"
    :component-map="componentMapping"
  />
</template>
```

**Dynamic SEO from Entry Data:**

```vue
<script setup>
// Get entry data first, then use it for SEO
const { data: page } = await useGetEntryByUrl({
  contentTypeUid: "page",
  url: useRoute().path,
});

// Create SEO object from entry data
const seoMeta = computed(() => ({
  title: page.value?.seo_title || page.value?.title,
  description: page.value?.seo_description || page.value?.description,
  ogTitle: page.value?.social_title || page.value?.title,
  ogDescription: page.value?.social_description || page.value?.description,
  ogImage: page.value?.featured_image?.url,
  canonical: `https://example.com${page.value?.url}`,
  robots: page.value?.no_index ? "noindex,nofollow" : "index,follow",
}));
</script>

<template>
  <!-- Use computed SEO metadata -->
  <ContentstackModularBlocks
    :blocks="page?.components"
    :seo-meta="seoMeta"
    :component-map="componentMapping"
  />
</template>
```

**Auto-Generate SEO from Entry Data:**

When using the auto-fetch pattern, you can automatically generate SEO metadata from the fetched entry data:

```vue
<template>
  <!-- Auto-generate SEO using default field mapping -->
  <ContentstackModularBlocks
    content-type-uid="page"
    :url="$route.path"
    :auto-seo-meta="true"
    :component-map="componentMapping"
  />
</template>
```

**Custom Field Mapping:**

```vue
<template>
  <!-- Custom field mapping for SEO generation -->
  <ContentstackModularBlocks
    content-type-uid="page"
    :url="$route.path"
    :auto-seo-meta="{
      title: 'page_title|title',
      description: 'meta_description|description',
      ogTitle: 'social_title|page_title|title',
      ogImage: 'featured_image.url',
      canonical: 'canonical_url',
      twitterCard: 'summary_large_image',
    }"
    :component-map="componentMapping"
  />
</template>
```

**Default Auto-SEO Field Mapping:**

When `autoSeoMeta: true`, these fields are automatically mapped:

| SEO Meta Tag    | Entry Fields (fallback order)                       |
| --------------- | --------------------------------------------------- |
| `title`         | `seo_title` → `title` → `name`                      |
| `description`   | `seo_description` → `description` → `summary`       |
| `ogTitle`       | `seo_title` → `title` → `name`                      |
| `ogDescription` | `seo_description` → `description` → `summary`       |
| `ogImage`       | `featured_image.url` → `og_image.url` → `image.url` |

**Combining Manual and Auto SEO:**

```vue
<template>
  <!-- Auto-generate base SEO, override specific fields -->
  <ContentstackModularBlocks
    content-type-uid="page"
    :url="$route.path"
    :auto-seo-meta="true"
    :seo-meta="{
      canonical: 'https://example.com' + $route.path,
      robots: 'index,follow',
    }"
    :component-map="componentMapping"
  />
</template>
```

**All useSeoMeta Options Supported:**

Since we pass the `seoMeta` prop directly to Nuxt's `useSeoMeta`, you can use any of the 100+ supported meta tags:

**Benefits:**

- ✅ **XSS Safe**: Uses Nuxt's built-in `useSeoMeta` for secure meta tag handling
- ✅ **TypeScript Support**: Full type safety with 100+ meta tag types
- ✅ **Auto-Generation**: Automatically extract SEO from fetched entry data
- ✅ **Flexible Mapping**: Custom field mapping with fallback support
- ✅ **Priority System**: Manual `seoMeta` overrides auto-generated values
- ✅ **SSR First**: SEO metadata is set during server-side rendering for optimal SEO
- ✅ **Search Engine Ready**: Meta tags are available when crawlers visit your pages
- ✅ **Flexible**: Choose from auto-detection, custom mapping, or function-based logic

#### Data Structure Support

The component supports two common Contentstack modular block structures:

**Auto-extraction (default):**

```json
{
  "components": [
    {
      "hero": {
        "title": "Welcome",
        "subtitle": "To our site"
      },
      "_metadata": { "uid": "hero_123" }
    },
    {
      "grid": {
        "columns": 3,
        "items": [...]
      },
      "_metadata": { "uid": "grid_456" }
    }
  ]
}
```

**Content type based:**

```json
{
  "modular_blocks": [
    {
      "_content_type_uid": "hero_block",
      "title": "Welcome",
      "subtitle": "To our site",
      "_metadata": { "uid": "hero_123" }
    },
    {
      "_content_type_uid": "grid_block",
      "columns": 3,
      "items": [...],
      "_metadata": { "uid": "grid_456" }
    }
  ]
}
```

#### Component Props

Each rendered component receives:

```typescript
// Original block props
{
  title: "Welcome",
  subtitle: "To our site",
  // ... other block fields

  // Additional meta props
  blockType: "hero",
  blockMetadata: { uid: "hero_123", ... }
}
```

#### Live Preview Integration

The component automatically adds Live Preview attributes:

```html
<section class="contentstack-modular-blocks">
  <component
    :is="Hero"
    :title="Welcome"
    data-block-type="hero"
    data-block-index="0"
    data-cslp="hero.title"
  />
</section>
```

#### Slots

The component provides several slots for customizing different states:

| Slot      | Description                  | Available When                            |
| --------- | ---------------------------- | ----------------------------------------- |
| `loading` | Custom loading state content | Auto-fetch is enabled and data is loading |
| `error`   | Custom error state content   | Auto-fetch fails or encounters an error   |
| `empty`   | Custom empty state content   | No blocks are available to render         |

```vue
<template>
  <ContentstackModularBlocks
    content-type-uid="page"
    :url="$route.path"
    :component-map="componentMapping"
  >
    <!-- Custom loading spinner -->
    <template #loading>
      <div class="flex items-center justify-center py-12">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
        ></div>
        <span class="ml-3">Loading page content...</span>
      </div>
    </template>

    <!-- Custom error message -->
    <template #error>
      <div class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 class="text-red-800 font-semibold">Content Unavailable</h3>
        <p class="text-red-600 mt-2">
          Unable to load page content. Please try again later.
        </p>
      </div>
    </template>

    <!-- Custom empty state -->
    <template #empty>
      <div class="text-center py-12 text-gray-500">
        <h3 class="text-lg font-medium">No Content Available</h3>
        <p class="mt-2">This page doesn't have any content blocks yet.</p>
      </div>
    </template>
  </ContentstackModularBlocks>
</template>
```

#### Error Handling

- **Missing components**: Falls back to `fallbackComponent`
- **Empty blocks**: Shows configurable empty state (customizable via `#empty` slot)
- **Invalid data**: Gracefully handles malformed block data
- **Missing keys**: Uses index-based keys as fallback
- **Auto-fetch errors**: Shows error state (customizable via `#error` slot)
- **Loading states**: Shows loading state during auto-fetch (customizable via `#loading` slot)

#### `ContentstackFallbackBlock`

The module includes a built-in fallback component that provides a developer-friendly display for unmapped block types. This component automatically:

- **Displays the block title** (from `title`, `name`, `heading`, or `blockType` fields)
- **Shows the block type** in a styled badge
- **Renders all props as formatted JSON** in an expandable details section
- **Provides helpful guidance** on how to map the component properly
- **Supports dark mode** for better developer experience

**Features:**

- 🎨 **Styled interface** with clear visual hierarchy
- 📱 **Responsive design** that works on all screen sizes
- 🌙 **Dark mode support** with `prefers-color-scheme`
- 🔍 **Collapsible JSON** to avoid cluttering the UI
- 🛠️ **Developer hints** showing how to fix unmapped components

**Example output:**

```
┌─────────────────────────────────────┐
│ Welcome Hero                Type: hero │
├─────────────────────────────────────┤
│ ▶ View Props                        │
│   {                                 │
│     "title": "Welcome Hero",        │
│     "subtitle": "Get started now",  │
│     "cta_text": "Learn More"       │
│   }                                 │
├─────────────────────────────────────┤
│ This is a fallback component.       │
│ Map "hero" to a proper Vue component│
└─────────────────────────────────────┘
```

You can override this by providing your own `fallbackComponent`:

```vue
<ContentstackModularBlocks
  :blocks="page.components"
  :component-map="componentMapping"
  :fallback-component="MyCustomFallback"
/>
```

## Composables

This module provides several composables for working with Contentstack content. All composables support live preview, personalization, and use Nuxt's caching system.

### `useAutoFetchedContent` (NEW)

Access content that was automatically fetched by the route-based middleware.

```ts
const { content, isLoaded, meta, refresh, getContentFor } =
  useAutoFetchedContent<Page>({
    contentType: "page", // Optional: filter by content type
    fallbackToManual: false, // Optional: fallback to manual fetching
  });

// Content is automatically available based on current route
if (isLoaded.value && content.value) {
  console.log(content.value.title);
}

// Get content for other routes
const aboutContent = getContentFor("/about", "page");

// Manual refresh if needed
await refresh();
```

### `useGetEntryByUrl`

Query any entry with a URL field. Listens to live editing changes and supports personalization.

```ts
const { data: page } = await useGetEntryByUrl<Page>({
  contentTypeUid: "page",
  url: "/about",
  referenceFieldPath: ["reference.fields"],
  jsonRtePath: ["rich_text_field"],
  locale: "en-us",
  replaceHtmlCslp: true,
});
```

### `useGetEntry`

Fetch a single entry by its UID.

```ts
const { data: article } = await useGetEntry<Article>({
  contentTypeUid: "article",
  entryUid: "your_entry_uid",
  referenceFieldPath: ["author", "category"],
  jsonRtePath: ["content"],
  locale: "en-us",
});
```

### `useGetEntries`

Fetch multiple entries with filtering, pagination, and sorting.

```ts
const { data: articles } = await useGetEntries<Article>({
  contentTypeUid: "article",
  referenceFieldPath: ["author"],
  locale: "en-us",
  limit: 10,
  skip: 0,
  orderBy: "created_at",
  includeCount: true,
  where: {
    status: "published",
    published_at: { $gte: "2024-01-01" },
    tags: { $exists: true },
  },
});

// Access results
console.log(articles.value?.entries); // Article[]
console.log(articles.value?.count); // Total count if includeCount: true
```

### `useGetAsset`

Fetch a single asset by its UID.

```ts
const { data: image } = await useGetAsset<Asset>({
  assetUid: "your_asset_uid",
  locale: "en-us",
});
```

### `useGetAssets`

Fetch multiple assets with filtering and pagination.

```ts
const { data: images } = await useGetAssets<Asset>({
  locale: "en-us",
  limit: 20,
  orderBy: "created_at",
  where: {
    content_type: "image/jpeg",
    // Note: Asset filtering is limited; most filters are applied client-side
  },
});
```

### Query Operators

Entry composables (`useGetEntries`, `useGetEntry`, `useGetEntryByUrl`) support advanced query operators in the `where` parameter:

**Note**: Asset filtering has limited server-side support. The `useGetAssets` composable applies most filters client-side after fetching.

```ts
where: {
  // Exact match
  status: "published",

  // Array contains
  tags: ["tech", "news"],

  // Comparison operators
  view_count: { $gt: 1000 },
  created_at: { $gte: "2024-01-01", $lt: "2024-12-31" },

  // Existence checks
  featured_image: { $exists: true },

  // Pattern matching
  title: { $regex: "nuxt.*contentstack" },

  // Not equal
  author: { $ne: "guest" }
}
```

## @nuxt/image Integration

This module includes a custom @nuxt/image provider for seamless integration with Contentstack's Image Delivery API.

### Setup

1. Install @nuxt/image:

```bash
npm install @nuxt/image
```

2. Add both modules to your `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: ["nuxt-contentstack", "@nuxt/image"],

  // Optional: Set Contentstack as default provider
  image: {
    provider: "contentstack",
  },
});
```

### Usage

The Contentstack provider automatically registers when both modules are installed. You can use `<NuxtImg>` and `<NuxtPicture>` components directly with Contentstack asset URLs - no need to pass asset UIDs or version UIDs as modifiers:

```vue
<template>
  <!-- Basic usage with Contentstack assets -->
  <NuxtImg
    :src="page.image.url"
    :alt="page.image.title"
    width="800"
    height="400"
    :modifiers="{
      auto: 'webp,compress',
      quality: 90,
    }"
    provider="contentstack"
  />

  <!-- Responsive image with automatic optimization -->
  <NuxtImg
    :src="hero.image.url"
    :alt="hero.image.title"
    sizes="100vw sm:50vw lg:33vw"
    densities="1x 2x"
    :modifiers="{
      auto: 'webp,compress',
      quality: 90,
    }"
    provider="contentstack"
  />

  <!-- Advanced transformations -->
  <NuxtImg
    :src="gallery.image.url"
    width="600"
    height="400"
    fit="cover"
    :modifiers="{
      blur: 5,
      brightness: 110,
      contrast: 120,
      saturation: 130,
    }"
    provider="contentstack"
  />

  <!-- Art direction for different devices -->
  <NuxtPicture
    :src="article.featured_image.url"
    :imgAttrs="{ alt: article.title }"
    sizes="100vw md:50vw"
    :modifiers="{
      auto: 'webp,compress',
      quality: 85,
    }"
    provider="contentstack"
  />
</template>
```

### Benefits

- ✅ **Automatic image optimization** with WebP and compression
- ✅ **Responsive images** with sizes and densities
- ✅ **Contentstack transformations** via Image Delivery API
- ✅ **Lazy loading** and performance optimizations
- ✅ **Art direction** support with NuxtPicture
- ✅ **Developer experience** - familiar @nuxt/image API

### Available Modifiers

The Contentstack provider supports all standard @nuxt/image modifiers plus Contentstack-specific transformations:

```typescript
// Common modifiers
:modifiers="{
  // Image optimization
  auto: 'webp,compress',
  quality: 90,

  // Dimensions and cropping
  width: 800,
  height: 400,
  fit: 'cover', // crop, bounds, fill, scale

  // Effects
  blur: 5,
  brightness: 110,
  contrast: 120,
  saturation: 130,

  // Format
  format: 'webp',
}"
```

### `useImageTransform` Composable

For advanced use cases where you need programmatic control over image transformations, you can use the `useImageTransform` composable. This is particularly useful when you need to apply transformations dynamically or when working with regular `<img>` tags instead of `<NuxtImg>`.

```ts
const { transformedUrl, updateTransform, resetTransform } = useImageTransform(
  originalImageUrl,
  {
    width: 800,
    height: 600,
    quality: 80,
    format: "webp",
    fit: "crop"
  }
);

// Use in template
<img :src="transformedUrl" alt="Transformed image" />

// Update transforms reactively
updateTransform({ width: 1200, quality: 90 });

// Advanced transforms
const { transformedUrl: advancedUrl } = useImageTransform(imageUrl, {
  width: 800,
  height: 600,
  quality: 85,
  format: "webp",
  overlay: {
    relativeURL: "/watermark.png",
    align: "bottom-right",
    width: "20p" // 20% of base image
  },
  sharpen: {
    amount: 5,
    radius: 2,
    threshold: 0
  },
  saturation: 10,
  brightness: 5
});
```

**When to use `useImageTransform` vs `<NuxtImg>`:**

- **Use `<NuxtImg>`** for most cases - it's optimized, supports responsive images, and handles lazy loading
- **Use `useImageTransform`** when you need dynamic transformations, working with regular `<img>` tags, or building custom image components

#### Supported Image Transforms

- **Dimensions**: `width`, `height`, `dpr` (device pixel ratio)
- **Quality & Format**: `quality`, `format`, `auto` optimization
- **Cropping**: `fit`, `crop`, `trim`
- **Effects**: `blur`, `saturation`, `brightness`, `contrast`, `sharpen`
- **Overlays**: Add watermarks or other images
- **Advanced**: `orient`, `pad`, `bg-color`, `frame`, `resizeFilter`

## Nuxt DevTools Integration

This module includes a custom tab in Nuxt DevTools that provides powerful debugging and monitoring capabilities for your Contentstack integration.

### Features

The Contentstack DevTools tab offers four main panels:

#### 🔍 **Content Inspector**

- View all fetched content entries with metadata
- Track entry status (published, draft, etc.)
- Display content type, UID, locale, and version information
- Show fetch timestamps for debugging cache behavior

#### 📊 **Query Monitor**

- Real-time monitoring of all Contentstack API calls
- Display request parameters as formatted JSON
- Show response summaries and performance metrics
- Track query status (success, error, pending)
- Monitor average query response times

#### 💾 **Cache Status**

- View cache hit rates and total requests
- Monitor cache size and memory usage
- Display all cached entries with timestamps
- Manual cache invalidation and clearing capabilities

#### ⚡ **Live Preview Status**

- Monitor Live Preview connection status
- Track real-time content update events
- Display update counts and timestamps
- Show current Live Preview mode (builder/preview)

## Contribution

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  npm install
  
  # Generate type stubs
  npm run dev:prepare
  
  # Develop with the playground
  npm run dev
  
  # Build the playground
  npm run dev:build
  
  # Run ESLint
  npm run lint
  
  # Run Vitest
  npm run test
  npm run test:watch
  
  # Release new version
  npm run release
  ```

</details>

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nuxt-contentstack/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-contentstack
[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-contentstack.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npmjs.com/package/nuxt-contentstack
[license-src]: https://img.shields.io/npm/l/nuxt-contentstack.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-contentstack
[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
