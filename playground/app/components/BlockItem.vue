<script lang="ts" setup>
import type { Block } from "../../types";

interface Props extends Block {
  // Props automatically added by ContentstackModularBlocks
  blockType?: string;
  blockMetadata?: any;
  dataBlockType?: string;
  dataBlockIndex?: number;
}

defineProps<Props>();
</script>

<template>
  <div
    :key="_metadata.uid"
    v-bind="cslp && cslp[`blocks__${dataBlockIndex}`]"
    :class="[
      'flex flex-col md:flex-row items-center space-y-4 md:space-y-0 bg-white',
      layout === 'image_left' ? 'md:flex-row' : 'md:flex-row-reverse',
    ]"
  >
    <div class="w-full md:w-1/2">
      <nuxtImg
        v-if="image"
        :src="image.url"
        :alt="image.title"
        width="200"
        height="112"
        class="w-full"
        provider="contentstack"
        v-bind="cslp && cslp.image"
      />
    </div>
    <div class="w-full md:w-1/2 p-4">
      <h2 v-if="title" class="text-2xl font-bold" v-bind="cslp && cslp.title">
        {{ title }}
      </h2>
      <div v-if="copy" class="prose" v-bind="cslp && cslp.copy" v-html="copy" />
    </div>
  </div>
</template>
