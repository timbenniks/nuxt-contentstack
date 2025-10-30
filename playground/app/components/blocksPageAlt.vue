<script lang="ts" setup>
import blockItem from "./BlockItem.vue";

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
