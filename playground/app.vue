<script lang="ts" setup>
import type { Page, File } from "./types";

const pageUid = "blte55cf3411ecaee0e";
const imageUid = "bltef1ad5f7d7008800";

// NEW: Example of auto-fetched content (replaces manual useGetEntryByUrl call)
const {
  content: autoPage,
  isLoaded: autoPageLoaded,
  meta: autoPageMeta,
  refresh: refreshAutoPage,
} = useAutoFetchedContent<Page>();

// Example 1: useGetEntryByUrl - Get a page by URL
const { data: page } = await useGetEntryByUrl<Page>({
  contentTypeUid: "page",
  url: "/",
  referenceFieldPath: ["blocks.block.image"],
  jsonRtePath: ["rich_text", "blocks.block.copy"],
  locale: "en-us",
  replaceHtmlCslp: true,
});

// Example 2: useGetEntry - Get a specific entry by UID
const { data: specificPage } = await useGetEntry<Page>({
  contentTypeUid: "page",
  entryUid: pageUid,
  referenceFieldPath: ["blocks.block.image"],
  jsonRtePath: ["rich_text"],
  locale: "en-us",
});

// Example 3: useGetEntries - Get multiple entries with filtering
const { data: allPages } = await useGetEntries<Page>({
  contentTypeUid: "page",
  referenceFieldPath: ["image"],
  locale: "en-us",
  limit: 10,
  orderBy: "created_at",
  includeCount: true,
  where: {
    title: { $exists: true },
  },
});

// Example 4: useGetAsset - Get a specific asset
const { data: heroAsset } = await useGetAsset<File>({
  assetUid: imageUid,
  locale: "en-us",
});

// Example 5: useGetAssets - Get multiple assets with filtering
const { data: images } = await useGetAssets<File>({
  locale: "en-us",
  limit: 10,
  orderBy: "created_at",
  where: {
    content_type: "image/jpeg",
    // Note: Most asset filtering is done client-side due to API limitations
  },
});

// Example 6: useImageTransform - Transform images
const originalImageUrl = page.value?.image?.url || "";
const { transformedUrl: responsiveImage } = useImageTransform(
  originalImageUrl,
  {
    width: 768,
    height: 414,
    quality: 80,
    format: "webp",
    fit: "crop",
  }
);

const { transformedUrl: thumbnailImage, updateTransform } = useImageTransform(
  originalImageUrl,
  {
    width: 200,
    height: 112,
    quality: 70,
    format: "webp",
  }
);

// Example of updating transforms reactively
const makeHighQuality = () => {
  updateTransform({ quality: 95, width: 400 });
};

// Computed values for demonstration
const totalPagesCount = computed(() => allPages.value?.count || 0);
const totalImagesCount = computed(() => images.value?.assets?.length || 0);
</script>

<template>
  <main class="max-w-screen-lg mx-auto p-4 space-y-8">
    <!-- NEW: Auto-fetched content example -->
    <section class="border-b pb-8">
      <h2 class="text-2xl font-bold mb-4">
        🚀 useAutoFetchedContent Example (NEW)
      </h2>
      <div class="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg">
        <p class="text-sm text-blue-600 mb-4">
          This content is automatically fetched based on the current route using
          the new auto-fetch middleware. No manual composable calls needed in
          the component!
        </p>

        <div v-if="autoPageLoaded && autoPage" class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-semibold text-gray-800">
              {{ autoPage.title }}
            </h3>
            <button
              class="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              @click="refreshAutoPage"
            >
              Refresh
            </button>
          </div>

          <p class="text-gray-600">{{ autoPage.description }}</p>

          <div
            v-if="autoPageMeta"
            class="text-xs text-gray-500 bg-gray-100 p-3 rounded"
          >
            <p><strong>Content Type:</strong> {{ autoPageMeta.contentType }}</p>
            <p><strong>UID:</strong> {{ autoPageMeta.uid }}</p>
            <p><strong>URL:</strong> {{ autoPageMeta.url }}</p>
            <p><strong>Fetched At:</strong> {{ autoPageMeta.fetchedAt }}</p>
          </div>

          <div class="text-xs text-blue-600 bg-blue-50 p-3 rounded">
            <p>
              <strong>How it works:</strong> The middleware automatically
              detected this route ("/") and fetched the corresponding "page"
              content type. The content is now available via the
              useAutoFetchedContent() composable without any manual setup!
            </p>
          </div>
        </div>

        <div v-else class="text-gray-500">
          <p>Auto-fetch is enabled but no content was found for this route.</p>
          <p class="text-xs mt-2">
            Make sure you have a page entry with url="/" in your Contentstack
            space.
          </p>
        </div>
      </div>
    </section>
    <!-- Example 1: useGetEntryByUrl -->
    <section class="border-b pb-8">
      <h2 class="text-2xl font-bold mb-4">🔗 useGetEntryByUrl Example</h2>
      <div v-if="page" class="bg-gray-50 p-4 rounded-lg">
        <h1
          v-if="page.title"
          class="text-3xl font-bold mb-4"
          v-bind="page?.$ && page?.$.title"
        >
          {{ page.title }}
        </h1>

        <p
          v-if="page.description"
          class="mb-4 text-gray-600"
          v-bind="page?.$ && page?.$.description"
        >
          {{ page.description }}
        </p>

        <!-- Using @nuxt/image with Contentstack provider -->
        <NuxtImg
          v-if="page?.image"
          class="mb-4 rounded-lg"
          :src="page.image.url"
          :alt="page.image.title || 'Page image'"
          width="768"
          height="414"
          v-bind="page?.image?.$ && page?.image?.$.url"
        />

        <!-- Fallback to transformed image if no asset structure -->
        <NuxtImg
          v-else-if="responsiveImage"
          class="mb-4 rounded-lg"
          width="768"
          height="414"
          :src="responsiveImage"
          :alt="page?.image?.title || 'Page image'"
          provider="contentstack"
          v-bind="page?.image?.$ && page?.image?.$.url"
        />

        <div
          v-if="page.rich_text"
          class="prose max-w-none"
          v-bind="page?.$ && page?.$.rich_text"
          v-html="page.rich_text"
        />
      </div>
    </section>

    <!-- Example 2: useGetEntry -->
    <section class="border-b pb-8">
      <h2 class="text-2xl font-bold mb-4">🎯 useGetEntry Example</h2>
      <div v-if="specificPage" class="bg-blue-50 p-4 rounded-lg">
        <p class="text-sm text-blue-600 mb-2">
          Entry UID: {{ specificPage.uid }}
        </p>
        <h3 class="text-xl font-semibold">{{ specificPage.title }}</h3>
        <p class="text-gray-600">{{ specificPage.description }}</p>
      </div>
    </section>

    <!-- Example 3: useGetEntries -->
    <section class="border-b pb-8">
      <h2 class="text-2xl font-bold mb-4">📄 useGetEntries Example</h2>
      <div class="bg-green-50 p-4 rounded-lg">
        <p class="text-sm text-green-600 mb-4">
          Found {{ totalPagesCount }} pages total, showing
          {{ allPages?.entries?.length || 0 }}
        </p>
        <div
          v-if="allPages?.entries"
          class="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div
            v-for="pageItem in allPages.entries"
            :key="pageItem.uid"
            class="bg-white p-3 rounded border"
          >
            <h4 class="font-semibold">{{ pageItem.title }}</h4>
            <p class="text-sm text-gray-500">{{ pageItem.url || "No URL" }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Example 4: useGetAsset -->
    <section class="border-b pb-8">
      <h2 class="text-2xl font-bold mb-4">🖼️ useGetAsset Example</h2>
      <div v-if="heroAsset" class="bg-purple-50 p-4 rounded-lg">
        <p class="text-sm text-purple-600 mb-2">
          Asset UID: {{ heroAsset.uid }}
        </p>
        <div class="flex items-center space-x-4">
          <NuxtImg
            v-if="heroAsset"
            :src="heroAsset.url"
            :alt="heroAsset.title"
            width="96"
            height="96"
            fit="cover"
            :modifiers="{
              auto: 'webp,compress',
              quality: 85,
            }"
            provider="contentstack"
            class="w-24 h-24 object-cover rounded"
          />
          <div>
            <h4 class="font-semibold">{{ heroAsset.title }}</h4>
            <p class="text-sm text-gray-600">{{ heroAsset.filename }}</p>
            <p class="text-xs text-gray-500">
              {{ heroAsset.content_type }} • {{ heroAsset.file_size }} bytes
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Example 5: useGetAssets -->
    <section class="border-b pb-8">
      <h2 class="text-2xl font-bold mb-4">🖼️ useGetAssets Example</h2>
      <div class="bg-orange-50 p-4 rounded-lg">
        <p class="text-sm text-orange-600 mb-4">
          Found {{ totalImagesCount }} JPEG images
        </p>
        <div
          v-if="images?.assets"
          class="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div
            v-for="image in images.assets"
            :key="image.uid"
            class="bg-white p-2 rounded border"
          >
            <NuxtImg
              :src="image.url"
              :alt="image.title"
              width="150"
              height="96"
              fit="cover"
              :modifiers="{
                auto: 'webp,compress',
                quality: 80,
              }"
              provider="contentstack"
              class="w-full h-24 object-cover rounded mb-2"
            />
            <p class="text-xs font-medium truncate">{{ image.title }}</p>
            <p class="text-xs text-gray-500">{{ image.file_size }} bytes</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Example 6: @nuxt/image Integration -->
    <section class="border-b pb-8">
      <h2 class="text-2xl font-bold mb-4">
        🖼️ @nuxt/image + Contentstack Integration
      </h2>
      <div class="bg-cyan-50 p-4 rounded-lg">
        <p class="text-sm text-cyan-600 mb-4">
          Demonstrating automatic optimization with @nuxt/image and Contentstack
          provider
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <!-- Basic responsive image -->
          <div>
            <h4 class="font-semibold mb-2">Responsive Image</h4>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              sizes="100vw sm:50vw lg:33vw"
              width="400"
              height="300"
              :modifiers="{
                auto: 'webp,compress',
                quality: 85,
              }"
              provider="contentstack"
              class="w-full rounded border"
            />
          </div>

          <!-- High quality with effects -->
          <div>
            <h4 class="font-semibold mb-2">Enhanced with Effects</h4>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="400"
              height="300"
              fit="cover"
              :modifiers="{
                brightness: 110,
                contrast: 120,
                saturation: 130,
                quality: 95,
              }"
              provider="contentstack"
              class="w-full rounded border"
            />
          </div>

          <!-- Art direction -->
          <div>
            <h4 class="font-semibold mb-2">Art Direction</h4>
            <NuxtPicture
              v-if="page?.image"
              :src="page.image.url"
              :img-attrs="{ alt: page.image.title }"
              sizes="100vw md:50vw lg:33vw"
              :modifiers="{
                auto: 'webp,compress',
                quality: 80,
              }"
              provider="contentstack"
              class="w-full rounded border"
            />
          </div>
        </div>

        <div class="mt-4 p-3 bg-white rounded text-sm">
          <p class="font-medium mb-2">
            Generated URLs (check browser DevTools):
          </p>
          <ul class="text-xs text-gray-600 space-y-1">
            <li>• Automatic WebP conversion</li>
            <li>• Responsive breakpoints</li>
            <li>• Lazy loading enabled</li>
            <li>• Contentstack Image Delivery API</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Example 6.5: Image Crops & Fit Modes -->
    <section class="border-b pb-8">
      <h2 class="text-2xl font-bold mb-4">✂️ Image Crops & Fit Modes</h2>
      <div class="bg-emerald-50 p-4 rounded-lg">
        <p class="text-sm text-emerald-600 mb-4">
          Different cropping and fitting modes using Contentstack's Image
          Delivery API
        </p>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <!-- Crop (default) -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">Crop (Default)</h5>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="200"
              height="200"
              :modifiers="{
                resize: 'crop',
                quality: 80,
              }"
              provider="contentstack"
              class="w-full rounded border"
            />
            <p class="text-xs text-gray-600 mt-1">200*200 cropped</p>
          </div>

          <!-- Bounds (fit inside) -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">Bounds (Fit)</h5>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="200"
              height="200"
              :modifiers="{
                resize: 'bounds',
                quality: 80,
              }"
              provider="contentstack"
              class="w-full rounded border bg-gray-100"
            />
            <p class="text-xs text-gray-600 mt-1">200*200 fit inside</p>
          </div>

          <!-- Fill (stretch) -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">Fill (Stretch)</h5>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="200"
              height="200"
              :modifiers="{
                resize: 'fill',
                quality: 80,
              }"
              provider="contentstack"
              class="w-full rounded border"
            />
            <p class="text-xs text-gray-600 mt-1">200*200 stretched</p>
          </div>

          <!-- Scale (proportional) -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">Scale</h5>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="200"
              height="200"
              :modifiers="{
                resize: 'scale',
                quality: 80,
              }"
              provider="contentstack"
              class="w-full rounded border bg-gray-100"
            />
            <p class="text-xs text-gray-600 mt-1">200*200 scaled</p>
          </div>
        </div>

        <!-- Aspect Ratio Examples -->
        <h4 class="text-lg font-semibold mb-3">Different Aspect Ratios</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <!-- Square -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">Square (1:1)</h5>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="300"
              height="300"
              :modifiers="{
                resize: 'crop',
                quality: 85,
              }"
              provider="contentstack"
              class="w-full rounded border"
            />
          </div>

          <!-- Wide -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">Wide (16:9)</h5>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="300"
              height="169"
              :modifiers="{
                resize: 'crop',
                quality: 85,
              }"
              provider="contentstack"
              class="w-full rounded border"
            />
          </div>

          <!-- Tall -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">Tall (9:16)</h5>
            <div class="flex justify-center">
              <NuxtImg
                v-if="page?.image"
                :src="page.image.url"
                :alt="page.image.title"
                width="169"
                height="300"
                :modifiers="{
                  resize: 'crop',
                  quality: 85,
                }"
                provider="contentstack"
                class="rounded border"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Example 6.6: Image Quality Comparison -->
    <section class="border-b pb-8">
      <h2 class="text-2xl font-bold mb-4">🎚️ Image Quality Comparison</h2>
      <div class="bg-amber-50 p-4 rounded-lg">
        <p class="text-sm text-amber-600 mb-4">
          Compare different quality settings and their file sizes
        </p>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <!-- Quality 100 -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">Quality 100</h5>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="250"
              height="167"
              :modifiers="{
                quality: 100,
                format: 'jpeg',
              }"
              provider="contentstack"
              class="w-full rounded border"
            />
            <p class="text-xs text-gray-600 mt-1">Highest quality</p>
          </div>

          <!-- Quality 80 -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">Quality 80</h5>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="250"
              height="167"
              :modifiers="{
                quality: 80,
                format: 'jpeg',
              }"
              provider="contentstack"
              class="w-full rounded border"
            />
            <p class="text-xs text-gray-600 mt-1">Good balance</p>
          </div>

          <!-- Quality 50 -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">Quality 50</h5>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="250"
              height="167"
              :modifiers="{
                quality: 50,
                format: 'jpeg',
              }"
              provider="contentstack"
              class="w-full rounded border"
            />
            <p class="text-xs text-gray-600 mt-1">Medium quality</p>
          </div>

          <!-- Quality 20 -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">Quality 20</h5>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="250"
              height="167"
              :modifiers="{
                quality: 20,
                format: 'jpeg',
              }"
              provider="contentstack"
              class="w-full rounded border"
            />
            <p class="text-xs text-gray-600 mt-1">Low quality</p>
          </div>
        </div>

        <!-- Format Comparison -->
        <h4 class="text-lg font-semibold mb-3">Format Comparison</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <!-- JPEG -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">JPEG</h5>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="300"
              height="200"
              :modifiers="{
                format: 'jpeg',
                quality: 80,
              }"
              provider="contentstack"
              class="w-full rounded border"
            />
            <p class="text-xs text-gray-600 mt-1">Standard format</p>
          </div>

          <!-- WebP -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">WebP</h5>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="300"
              height="200"
              :modifiers="{
                format: 'webp',
                quality: 80,
              }"
              provider="contentstack"
              class="w-full rounded border"
            />
            <p class="text-xs text-gray-600 mt-1">Modern format</p>
          </div>

          <!-- Auto (WebP with fallback) -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">Auto</h5>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="300"
              height="200"
              :modifiers="{
                auto: 'webp,compress',
                quality: 80,
              }"
              provider="contentstack"
              class="w-full rounded border"
            />
            <p class="text-xs text-gray-600 mt-1">Auto-optimized</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Example 6.7: Image Effects & Filters -->
    <section class="border-b pb-8">
      <h2 class="text-2xl font-bold mb-4">🎨 Image Effects & Filters</h2>
      <div class="bg-purple-50 p-4 rounded-lg">
        <p class="text-sm text-purple-600 mb-4">
          Various image effects and filters available through Contentstack
        </p>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          <!-- Original -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">Original</h5>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="200"
              height="133"
              :modifiers="{
                quality: 80,
              }"
              provider="contentstack"
              class="w-full rounded border"
            />
          </div>

          <!-- Brightness -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">Bright (+30)</h5>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="200"
              height="133"
              :modifiers="{
                brightness: 130,
                quality: 80,
              }"
              provider="contentstack"
              class="w-full rounded border"
            />
          </div>

          <!-- Contrast -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">High Contrast</h5>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="200"
              height="133"
              :modifiers="{
                contrast: 150,
                quality: 80,
              }"
              provider="contentstack"
              class="w-full rounded border"
            />
          </div>

          <!-- Saturation -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">Vibrant</h5>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="200"
              height="133"
              :modifiers="{
                saturation: 150,
                quality: 80,
              }"
              provider="contentstack"
              class="w-full rounded border"
            />
          </div>

          <!-- Blur -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">Blur</h5>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="200"
              height="133"
              :modifiers="{
                blur: 5,
                quality: 80,
              }"
              provider="contentstack"
              class="w-full rounded border"
            />
          </div>

          <!-- Desaturated -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">Desaturated</h5>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="200"
              height="133"
              :modifiers="{
                saturation: 50,
                quality: 80,
              }"
              provider="contentstack"
              class="w-full rounded border"
            />
          </div>

          <!-- Dark -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">Dark (-30)</h5>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="200"
              height="133"
              :modifiers="{
                brightness: 70,
                quality: 80,
              }"
              provider="contentstack"
              class="w-full rounded border"
            />
          </div>

          <!-- Combined Effects -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">Combined</h5>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="200"
              height="133"
              :modifiers="{
                brightness: 110,
                contrast: 120,
                saturation: 90,
                quality: 80,
              }"
              provider="contentstack"
              class="w-full rounded border"
            />
          </div>
        </div>

        <!-- Advanced Effects -->
        <h4 class="text-lg font-semibold mb-3">Advanced Effects</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Sharpen -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">Sharpened</h5>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="250"
              height="167"
              :modifiers="{
                sharpen: 5,
                quality: 80,
              }"
              provider="contentstack"
              class="w-full rounded border"
            />
            <p class="text-xs text-gray-600 mt-1">Sharpen: 5</p>
          </div>

          <!-- High DPR -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">High DPR (2x)</h5>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="250"
              height="167"
              :modifiers="{
                dpr: 2,
                quality: 80,
              }"
              provider="contentstack"
              class="w-full rounded border"
              style="width: 125px; height: 83px"
            />
            <p class="text-xs text-gray-600 mt-1">Retina ready</p>
          </div>

          <!-- Film Effect -->
          <div class="text-center">
            <h5 class="text-sm font-semibold mb-2">Film Effect</h5>
            <NuxtImg
              v-if="page?.image"
              :src="page.image.url"
              :alt="page.image.title"
              width="250"
              height="167"
              :modifiers="{
                brightness: 105,
                contrast: 110,
                saturation: 85,
                quality: 80,
              }"
              provider="contentstack"
              class="w-full rounded border"
            />
            <p class="text-xs text-gray-600 mt-1">Vintage look</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Example 7: useImageTransform -->
    <section class="border-b pb-8">
      <h2 class="text-2xl font-bold mb-4">🎨 useImageTransform Example</h2>
      <div class="bg-indigo-50 p-4 rounded-lg">
        <p class="text-sm text-indigo-600 mb-4">
          Interactive image transformations with reactive URLs
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-semibold mb-2">Original Image</h4>
            <NuxtImg
              v-if="originalImageUrl"
              :src="originalImageUrl"
              alt="Original image"
              width="300"
              height="200"
              fit="crop"
              provider="contentstack"
              class="w-full rounded border"
            />
          </div>

          <div>
            <h4 class="font-semibold mb-2">Transformed Image</h4>
            <NuxtImg
              v-if="thumbnailImage"
              :src="thumbnailImage"
              alt="Transformed image"
              provider="contentstack"
              class="w-full rounded border"
            />
            <button
              class="mt-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
              @click="makeHighQuality"
            >
              Make High Quality
            </button>
          </div>
        </div>

        <div class="mt-4 text-sm">
          <p class="font-medium">Current Transform URL:</p>
          <code class="block bg-white p-2 rounded text-xs overflow-x-auto">
            {{ thumbnailImage }}
          </code>
        </div>
      </div>
    </section>

    <!-- Original blocks content -->
    <section v-if="page?.blocks">
      <h2 class="text-2xl font-bold mb-4">📝 Page Blocks</h2>
      <div class="space-y-8" v-bind="page?.$ && page?.$.blocks">
        <div
          v-for="(item, index) in page.blocks"
          :key="item.block._metadata.uid"
          v-bind="page?.$ && page?.$[`blocks__${index}`]"
          :class="[
            'flex flex-col md:flex-row items-center space-y-4 md:space-y-0 bg-white border rounded-lg overflow-hidden',
            item.block.layout === 'image_left'
              ? 'md:flex-row'
              : 'md:flex-row-reverse',
          ]"
        >
          <div class="w-full md:w-1/2">
            <NuxtImg
              v-if="item.block.image"
              :src="item.block.image.url"
              :alt="item.block.image.title"
              width="400"
              height="300"
              fit="cover"
              :modifiers="{
                auto: 'webp,compress',
                quality: 80,
              }"
              provider="contentstack"
              class="w-full h-48 object-cover"
              v-bind="item.block.$ && item.block.$.image"
            />
          </div>
          <div class="w-full md:w-1/2 p-6">
            <h3
              v-if="item.block.title"
              class="text-xl font-bold mb-3"
              v-bind="item.block.$ && item.block.$.title"
            >
              {{ item.block.title }}
            </h3>
            <div
              v-if="item.block.copy"
              class="prose prose-sm"
              v-bind="item.block.$ && item.block.$.copy"
              v-html="item.block.copy"
            />
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
