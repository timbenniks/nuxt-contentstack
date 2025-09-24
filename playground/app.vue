<script lang="ts" setup>
import type { Page, File } from "./types";

const pageUid = "blte55cf3411ecaee0e";
const imageUid = "bltef1ad5f7d7008800";

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

        <!-- Using transformed image -->
        <img
          v-if="responsiveImage"
          class="mb-4 rounded-lg"
          width="768"
          height="414"
          :src="responsiveImage"
          :alt="page?.image?.title || 'Page image'"
          v-bind="page?.image?.$ && page?.image?.$.url"
        >

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
          <img
            :src="thumbnailImage"
            :alt="heroAsset.title"
            class="w-24 h-24 object-cover rounded"
          >
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
            <img
              :src="image.url + '?width=150&height=150&fit=crop&format=webp'"
              :alt="image.title"
              class="w-full h-24 object-cover rounded mb-2"
            >
            <p class="text-xs font-medium truncate">{{ image.title }}</p>
            <p class="text-xs text-gray-500">{{ image.file_size }} bytes</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Example 6: useImageTransform -->
    <section class="border-b pb-8">
      <h2 class="text-2xl font-bold mb-4">🎨 useImageTransform Example</h2>
      <div class="bg-indigo-50 p-4 rounded-lg">
        <p class="text-sm text-indigo-600 mb-4">
          Interactive image transformations with reactive URLs
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-semibold mb-2">Original Image</h4>
            <img
              v-if="originalImageUrl"
              :src="originalImageUrl + '?width=300&height=200&fit=crop'"
              alt="Original image"
              class="w-full rounded border"
            >
          </div>

          <div>
            <h4 class="font-semibold mb-2">Transformed Image</h4>
            <img
              v-if="thumbnailImage"
              :src="thumbnailImage"
              alt="Transformed image"
              class="w-full rounded border"
            >
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
            <img
              v-if="item.block.image"
              :src="item.block.image.url"
              :alt="item.block.image.title"
              width="200"
              height="112"
              class="w-full h-48 object-cover"
              v-bind="item.block.$ && item.block.$.image"
            >
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
