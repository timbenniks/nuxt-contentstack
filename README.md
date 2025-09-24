> Notice: This is an OSS project by @timbenniks and not an officially maintained package by the Contentstack team. Support requests can come through Github issues and via direct channels to @timbenniks.

# Nuxt Contentstack

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Contentstack integration for Nuxt.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
- [🏀 Online playground](https://stackblitz.com/github/timbenniks/nuxt-contentstack?file=playground%2Fapp.vue)
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

- ⚡️ Easy setup
- ⚡️ Complete set of Vue composables for Contentstack
- ⚡️ Query entries and assets with advanced filtering
- ⚡️ Advanced filtering and pagination
- ⚡️ Image transformations with reactive URLs
- ⚡️ **@nuxt/image integration** with automatic optimization
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
  region: 'us',
  branch: 'main',
  locale: 'en-us',

  // Live Preview (simplified)
  livePreview: {
    enable: true,
    previewToken: 'your_preview_token', // no need for preview token if you are not using live preview
    editableTags: true,
    editButton: true
  },

  // Personalization (simplified)
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

## Composables

This module provides several composables for working with Contentstack content. All composables support live preview, personalization, and use Nuxt's caching system.

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
