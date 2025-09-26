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
