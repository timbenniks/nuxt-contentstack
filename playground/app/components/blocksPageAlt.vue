<script lang="ts" setup>
// @ts-expect-error - Vue SFC import without explicit default export
import blockItem from "../components/BlockItem.vue";

const componentMap = {
  block: blockItem,
};
</script>

<template>
  <main style="max-width: 800px; margin: 0 auto">
    <ContentstackModularBlocks
      :component-map="componentMap"
      blocks-field-path="blocks"
      content-type-uid="page"
      url="/"
      :json-rte-path="['rich_text', 'blocks.block.copy']"
    />
  </main>
</template>
