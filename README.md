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

- Complete set of Vue composables (entries, assets, by URL)
- Advanced filtering, pagination, and sorting
- Live Preview & Visual Builder support
- Personalization support with server-side middleware
- Image transformations with `useImageTransform` composable
- @nuxt/image integration with automatic optimization
- TypeScript support with full type safety
- Exposed SDKs: Delivery SDK, Live Preview Utils SDK, Personalize SDK

## Quick Setup

```bash
npx nuxi module add nuxt-contentstack
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["nuxt-contentstack"],

  "nuxt-contentstack": {
    // Required
    apiKey: "your_contentstack_api_key",
    deliveryToken: "your_delivery_token",
    environment: "your_environment",

    // Optional
    region: "eu", // 'us' | 'eu' | 'au' | 'azure-na' | 'azure-eu' | 'gcp-na' | 'gcp-eu'
    branch: "main",
    locale: "en-us",

    // Live Preview
    livePreview: {
      enable: true,
      previewToken: "your_preview_token",
      editableTags: true,
      editButton: true, // or object with enable, position, exclude, includeByQueryParameter
      mode: "builder", // 'builder' | 'preview'
      ssr: false,
    },

    // Personalization
    personalization: {
      enable: true,
      projectUid: "your_project_uid",
    },

    debug: true,
  },
});
```

## Configuration

### Core Settings

| Option          | Type      | Required | Default   | Description                                    |
| --------------- | --------- | -------- | --------- | ---------------------------------------------- |
| `apiKey`        | `string`  | Yes      | -         | Contentstack stack API key (starts with "blt") |
| `deliveryToken` | `string`  | Yes      | -         | Delivery token (starts with "cs")              |
| `environment`   | `string`  | Yes      | -         | Target environment ('preview' \| 'production') |
| `region`        | `string`  | No       | `'us'`    | Contentstack region                            |
| `branch`        | `string`  | No       | `'main'`  | Content branch                                 |
| `locale`        | `string`  | No       | `'en-us'` | Default locale                                 |
| `debug`         | `boolean` | No       | `false`   | Enable debug logging                           |

### Live Preview

| Option         | Type                     | Default     | Description                           |
| -------------- | ------------------------ | ----------- | ------------------------------------- |
| `enable`       | `boolean`                | `false`     | Enable live preview                   |
| `previewToken` | `string`                 | -           | Preview token (required if enabled)   |
| `editableTags` | `boolean`                | `false`     | Add editable tags for visual building |
| `editButton`   | `boolean \| object`      | `false`     | Enable/edit button config             |
| `mode`         | `'builder' \| 'preview'` | `'builder'` | Live preview mode                     |
| `ssr`          | `boolean`                | `false`     | Enable SSR mode (experimental)        |

Edit button object:

```ts
editButton: {
  enable: boolean
  position?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center'
  exclude?: ('insideLivePreviewPortal' | 'outsideLivePreviewPortal')[]
  includeByQueryParameter?: boolean
}
```

### Personalization

| Option       | Type      | Required | Description                 |
| ------------ | --------- | -------- | --------------------------- |
| `enable`     | `boolean` | Yes      | Enable personalization      |
| `projectUid` | `string`  | Yes      | Personalization project UID |

## Provides

Access via `useNuxtApp().$contentstack`:

```ts
const {
  stack, // Delivery SDK Stack instance
  ContentstackLivePreview, // Live Preview Utils SDK
  Personalize, // Personalize SDK
  livePreviewEnabled, // boolean
  editableTags, // boolean
  variantAlias, // Variant manifest for personalization
  VB_EmptyBlockParentClass, // Visual Builder empty block class
} = useNuxtApp().$contentstack;
```

### Personalization SDK Usage

```ts
const { Personalize } = useNuxtApp().$contentstack;

// Set user attributes
await Personalize.set({ age: 20 });

// Trigger impression
await Personalize.triggerImpression(experienceShortId);

// Trigger conversion event
await Personalize.triggerEvent("eventKey");
```

## Composables

All composables support live preview updates, personalization variants, and Nuxt's caching system.

### `useGetEntryByUrl`

Fetch entry by URL field.

```ts
const { data, status, refresh } = await useGetEntryByUrl<Page>({
  contentTypeUid: "page",
  url: "/about",
  referenceFieldPath: ["author", "category"],
  jsonRtePath: ["rich_text_field"],
  locale: "en-us",
  replaceHtmlCslp: true,
});
```

### `useGetEntry`

Fetch single entry by UID.

```ts
const { data } = await useGetEntry<Article>({
  contentTypeUid: "article",
  entryUid: "your_entry_uid",
  referenceFieldPath: ["author"],
  jsonRtePath: ["content"],
  locale: "en-us",
});
```

### `useGetEntries`

Fetch multiple entries with filtering, pagination, and sorting.

```ts
const { data } = await useGetEntries<Article>({
  contentTypeUid: "article",
  referenceFieldPath: ["author"],
  locale: "en-us",
  limit: 10,
  skip: 0,
  orderBy: "created_at",
  includeCount: true,
  where: {
    status: "published",
    view_count: { $gt: 1000 },
    created_at: { $gte: "2024-01-01", $lt: "2024-12-31" },
    featured_image: { $exists: true },
    title: { $regex: "nuxt.*contentstack" },
    tags: ["tech", "news"],
    author: { $ne: "guest" },
  },
});

// Access results
console.log(data.value?.entries); // Article[]
console.log(data.value?.count); // number (if includeCount: true)
```

### `useGetAsset`

Fetch single asset by UID.

```ts
const { data } = await useGetAsset<Asset>({
  assetUid: "your_asset_uid",
  locale: "en-us",
});
```

### `useGetAssets`

Fetch multiple assets with filtering.

```ts
const { data } = await useGetAssets<Asset>({
  locale: "en-us",
  limit: 20,
  orderBy: "created_at",
  includeCount: true,
  where: {
    content_type: "image/jpeg",
    // Note: Most asset filters are applied client-side
  },
});
```

### Query Operators

Supported in `where` clause for entry composables:

- Exact match: `field: "value"`
- Array contains: `tags: ["tech", "news"]`
- Comparison: `field: { $gt: 100, $gte: 50, $lt: 200, $lte: 150, $ne: "value" }`
- Existence: `field: { $exists: true }`
- Regex: `field: { $regex: "pattern" }`

### `useImageTransform`

Transform Contentstack images programmatically.

```ts
const { transformedUrl, updateTransform, resetTransform } = useImageTransform(
  imageUrl,
  {
    width: 800,
    height: 600,
    quality: 80,
    format: "webp",
    fit: "crop",
    blur: 5,
    saturation: 10,
    brightness: 5,
    overlay: {
      relativeURL: "/watermark.png",
      align: "bottom-right",
      width: "20p",
    },
    sharpen: {
      amount: 5,
      radius: 2,
      threshold: 0,
    },
  }
);

// Update reactively
updateTransform({ width: 1200, quality: 90 });
```

## Components

### `ContentstackModularBlocks`

Renders Contentstack modular blocks as Vue components with auto-fetch capability. By default, auto-fetch is enabled with `contentTypeUid: 'page'` and `url: '/'`. To disable auto-fetch when using pre-fetched blocks, set these props to `undefined`.

**Pattern 1: Auto-fetch Entry**

```vue
<script setup>
const componentMapping = {
  hero: Hero,
  grid: Grid,
  text_block: TextBlock,
};
</script>

<template>
  <ContentstackModularBlocks
    content-type-uid="page"
    :url="$route.path"
    blocks-field-path="components"
    :reference-field-path="['author']"
    :json-rte-path="['rich_text']"
    :auto-seo-meta="true"
    :component-map="componentMapping"
  >
    <template #loading>Loading...</template>
    <template #error>Failed to load</template>
    <template #empty>No content</template>
  </ContentstackModularBlocks>
</template>
```

**Pattern 2: Pre-fetched Blocks**

```vue
<script setup>
const { data: page } = await useGetEntryByUrl({
  contentTypeUid: "page",
  url: useRoute().path,
});

const componentMapping = {
  hero: Hero,
  grid: Grid,
};
</script>

<template>
  <ContentstackModularBlocks
    :blocks="page.components"
    :component-map="componentMapping"
  />
</template>
```

### Props

| Prop                   | Type                                | Default                                | Description                           |
| ---------------------- | ----------------------------------- | -------------------------------------- | ------------------------------------- |
| `blocks`               | `ContentstackBlock[]`               | `[]`                                   | Array of modular blocks               |
| `componentMap`         | `ComponentMapping`                  | `{}`                                   | Block type → Vue component mapping    |
| `fallbackComponent`    | `Component`                         | `ContentstackFallbackBlock`            | Component for unmapped blocks         |
| `contentTypeUid`       | `string`                            | `'page'`                               | Content type for auto-fetch           |
| `url`                  | `string`                            | `'/'`                                  | URL for auto-fetch                    |
| `blocksFieldPath`      | `string`                            | `'components'`                         | Field path to extract blocks          |
| `referenceFieldPath`   | `string[]`                          | `[]`                                   | Reference fields to include           |
| `jsonRtePath`          | `string[]`                          | `[]`                                   | JSON RTE field paths                  |
| `locale`               | `string`                            | `'en-us'`                              | Locale                                |
| `replaceHtmlCslp`      | `boolean`                           | `editableTags`                         | Replace HTML CSLP tags                |
| `seoMeta`              | `SeoMetaInput`                      | -                                      | SEO metadata (passed to `useSeoMeta`) |
| `autoSeoMeta`          | `boolean \| Record<string, string>` | `false`                                | Auto-generate SEO from entry          |
| `containerClass`       | `string`                            | `'contentstack-modular-blocks'`        | Container CSS class                   |
| `emptyBlockClass`      | `string`                            | `'visual-builder__empty-block-parent'` | Empty block CSS class                 |
| `showEmptyState`       | `boolean`                           | `true`                                 | Show empty state                      |
| `keyField`             | `string`                            | `'_metadata.uid'`                      | Key field for blocks                  |
| `autoExtractBlockName` | `boolean`                           | `true`                                 | Auto-extract block name               |

### SEO Metadata

**Manual SEO:**

```vue
<ContentstackModularBlocks
  :seo-meta="{
    title: 'Page Title',
    description: 'Page description',
    ogImage: 'https://example.com/image.jpg',
  }"
/>
```

**Auto-generate SEO:**

```vue
<!-- Default field mapping -->
<ContentstackModularBlocks :auto-seo-meta="true" />

<!-- Custom field mapping -->
<ContentstackModularBlocks
  :auto-seo-meta="{
    title: 'seo_title|title|name',
    description: 'meta_description|description',
    ogImage: 'featured_image.url',
  }"
/>
```

Default auto-SEO mapping:

- `title`: `seo_title` → `title` → `name`
- `description`: `seo_description` → `description` → `summary`
- `ogImage`: `featured_image.url` → `og_image.url` → `image.url`

### Slots

- `loading` - Custom loading state (auto-fetch mode)
- `error` - Custom error state (auto-fetch mode)
- `empty` - Custom empty state

### `ContentstackFallbackBlock`

Built-in fallback component for unmapped block types. Displays block title, type badge, and props as formatted JSON.

## @nuxt/image Integration

### Setup

```bash
npm install @nuxt/image
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["nuxt-contentstack", "@nuxt/image"],

  image: {
    providers: {
      contentstack: {
        name: "contentstack",
        provider:
          "node_modules/nuxt-contentstack/dist/runtime/providers/contentstack",
      },
    },
    provider: "contentstack", // Optional: set as default
  },
});
```

### Usage

```vue
<template>
  <!-- Basic usage -->
  <NuxtImg
    :src="image.url"
    :alt="image.title"
    width="800"
    height="400"
    :modifiers="{ auto: 'webp,compress', quality: 90 }"
    provider="contentstack"
  />

  <!-- Responsive -->
  <NuxtImg
    :src="image.url"
    sizes="100vw sm:50vw lg:33vw"
    :modifiers="{ auto: 'webp,compress' }"
  />

  <!-- Art direction -->
  <NuxtPicture
    :src="image.url"
    sizes="100vw md:50vw"
    :modifiers="{ auto: 'webp,compress' }"
  />
</template>
```

### Supported Modifiers

- `auto`: `'webp'` | `'webp,compress'`
- `quality`: `number`
- `format`: `'webp'` | `'png'` | `'jpg'` | `'jpeg'` | `'gif'` | `'auto'`
- `width`, `height`, `dpr`: `number`
- `fit`: `'bounds'` | `'crop'`
- `blur`, `brightness`, `contrast`, `saturation`: `number`
- `sharpen`: `{ amount, radius, threshold }`
- `overlay`: `{ relativeURL, align, repeat, width, height, pad }`

## Development

```bash
# Install dependencies
npm install

# Generate type stubs
npm run dev:prepare

# Develop with playground
npm run dev

# Build playground
npm run dev:build

# Lint
npm run lint

# Test
npm run test
npm run test:watch

# Release
npm run release
```

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nuxt-contentstack/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-contentstack
[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-contentstack.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npmjs.com/package/nuxt-contentstack
[license-src]: https://img.shields.io/npm/l/nuxt-contentstack.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-contentstack
[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
