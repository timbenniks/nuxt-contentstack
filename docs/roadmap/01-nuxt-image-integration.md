# @nuxt/image Integration

**Priority**: Critical  
**Effort**: Medium  
**Status**: 🔴 Not Started  
**Phase**: 1 (Essential Features)

## Description

Create a custom @nuxt/image provider for Contentstack image optimization.

## Goal

Enable `<NuxtImg>` component to work seamlessly with Contentstack images, providing automatic optimization, responsive images, and all @nuxt/image benefits.

## Implementation Steps

1. **Create the provider file**: `src/runtime/providers/contentstack.ts`
2. **Register provider in module**: Update `src/module.ts`
3. **Add usage examples**: Update `playground/app.vue`
4. **Document usage**: Update `README.md`

## Files to create/modify

- `src/runtime/providers/contentstack.ts` - New provider (main implementation)
- `src/module.ts` - Register the provider
- `playground/app.vue` - Usage examples
- `README.md` - Documentation

## Actual Working Implementation

Based on Real Project:

```typescript
// src/runtime/providers/contentstack.ts
import { joinURL } from "ufo";
import type { ProviderGetImage } from "@nuxt/image";
import { createOperationsGenerator } from "#image";

const operationsGenerator = createOperationsGenerator({
  keyMap: {
    width: "width",
    height: "height",
    quality: "quality",
    assetuid: "assetuid",
    versionuid: "versionuid",
    auto: "auto",
  },
  valueMap: {
    fit: {
      fill: "crop",
      inside: "crop",
      outside: "crop",
      cover: "bounds",
      contain: "bounds",
    },
  },
  joinWith: "&",
  formatter: (key, value) => `${key}=${value}`,
});

export const getImage: ProviderGetImage = (
  src,
  { modifiers = {}, baseURL = "/", apiKey } = {}
) => {
  const { assetuid, versionuid, ...remainingModifiers } = modifiers;
  const operations = operationsGenerator(remainingModifiers);

  return {
    url: joinURL(
      baseURL,
      apiKey,
      assetuid,
      versionuid,
      src + (operations ? "?" + operations : "")
    ),
  };
};
```

## Key Implementation Notes

- ✅ **Use `createOperationsGenerator`** from `#image` for parameter mapping
- ✅ **Handle Contentstack asset structure** with `assetuid` and `versionuid`
- ✅ **Use `joinURL` from `ufo`** for reliable URL construction
- ✅ **Map @nuxt/image modifiers** to Contentstack parameters properly

## Enhanced Version

Optional - adds more transforms:

```typescript
// Enhanced version combining both approaches
import { joinURL } from "ufo";
import type { ProviderGetImage } from "@nuxt/image";
import { createOperationsGenerator } from "#image";

const operationsGenerator = createOperationsGenerator({
  keyMap: {
    width: "width",
    height: "height",
    quality: "quality",
    format: "format",
    auto: "auto",
    // Add Contentstack-specific transforms
    blur: "blur",
    brightness: "brightness",
    contrast: "contrast",
    saturation: "saturation",
    dpr: "dpr",
  },
  valueMap: {
    fit: {
      fill: "crop",
      inside: "crop",
      outside: "crop",
      cover: "bounds",
      contain: "bounds",
    },
    format: {
      // Ensure WebP default for optimization
      auto: "webp",
    },
  },
  joinWith: "&",
  formatter: (key, value) => `${key}=${value}`,
});

export const getImage: ProviderGetImage = (
  src,
  { modifiers = {}, baseURL = "/" } = {}
) => {
  // Handle asset-specific modifiers
  const { assetuid, versionuid, ...imageModifiers } = modifiers;

  // Add automatic optimization defaults
  const enhancedModifiers = {
    auto: "webp,compress",
    quality: 80,
    ...imageModifiers, // User modifiers override defaults
  };

  const operations = operationsGenerator(enhancedModifiers);

  // Build URL based on whether we have asset identifiers
  let url;
  if (assetuid && versionuid) {
    // Contentstack asset URL structure
    url = joinURL(baseURL, assetuid, versionuid, src);
  } else {
    // Regular image URL
    url = joinURL(baseURL, src);
  }

  return {
    url: url + (operations ? "?" + operations : ""),
  };
};
```

## Module Registration

To add in `src/module.ts`:

```typescript
// Check if @nuxt/image is installed
if (nuxt.options.modules.includes("@nuxt/image")) {
  // Register our provider
  nuxt.hook("image:providers", (providers) => {
    providers.contentstack = {
      name: "contentstack",
      provider: "~/providers/contentstack",
      options: {},
    };
  });
}
```

## Usage Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["nuxt-contentstack", "@nuxt/image"],

  // Set Contentstack as default image provider
  image: {
    provider: "contentstack",
  },
});
```

## Usage Examples

```vue
<template>
  <!-- Basic usage with Contentstack assets -->
  <NuxtImg
    :src="page.image.url"
    :alt="page.image.title"
    width="800"
    height="400"
    :modifiers="{
      assetuid: page.image.uid,
      versionuid: page.image._version,
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
      assetuid: hero.image.uid,
      versionuid: hero.image._version,
      auto: 'webp,compress',
      quality: 90,
    }"
    provider="contentstack"
  />

  <!-- Advanced transformations using Contentstack parameters -->
  <NuxtImg
    :src="gallery.image.url"
    width="600"
    height="400"
    fit="cover"
    :modifiers="{
      assetuid: gallery.image.uid,
      versionuid: gallery.image._version,
      blur: 5,
      brightness: 110,
      contrast: 120,
      saturation: 130,
    }"
    provider="contentstack"
  />

  <!-- Simple usage without asset IDs (direct URL) -->
  <NuxtImg
    src="https://images.contentstack.io/v3/assets/blt.../image.jpg"
    width="400"
    height="300"
    quality="85"
    format="webp"
    provider="contentstack"
  />

  <!-- Art direction for different devices -->
  <NuxtPicture
    :src="article.featured_image.url"
    :imgAttrs="{ alt: article.title }"
    sizes="100vw md:50vw"
    :modifiers="{
      assetuid: article.featured_image.uid,
      versionuid: article.featured_image._version,
    }"
    provider="contentstack"
  />
</template>
```

## Working with Contentstack Asset Objects

```typescript
// Typical Contentstack asset structure
interface ContentstackAsset {
  uid: string;
  url: string;
  title: string;
  filename: string;
  _version: number;
  // ... other properties
}

// Helper function to create modifiers from asset
function createAssetModifiers(asset: ContentstackAsset, transforms = {}) {
  return {
    assetuid: asset.uid,
    versionuid: asset._version,
    ...transforms,
  };
}

// Usage in component
const imageModifiers = createAssetModifiers(page.image, {
  width: 800,
  height: 400,
  quality: 90,
  auto: "webp,compress",
});
```

## Expected Outcome

After implementation, developers can use:

```vue
<NuxtImg
  :src="page.image.url"
  :modifiers="{ assetuid: page.image.uid, versionuid: page.image._version }"
  width="800"
  height="400"
  provider="contentstack"
/>
```

This provides:

- ✅ **Automatic image optimization** with WebP and compression
- ✅ **Responsive images** with sizes and densities
- ✅ **Contentstack transformations** via Image Delivery API
- ✅ **Lazy loading** and performance optimizations
- ✅ **Art direction** support with NuxtPicture
- ✅ **Developer experience** - familiar @nuxt/image API
