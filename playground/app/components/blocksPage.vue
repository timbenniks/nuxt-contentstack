<script lang="ts" setup>
import blockItem from "./BlockItem.vue";
import type { Page } from "../../types";
import { useGetEntryByUrl } from "#imports";

const componentMap = {
  block: blockItem,
};

type PageProps = Omit<Page, "$"> & {
  cslp?: Page["$"];
};

const { data: page } = await useGetEntryByUrl<PageProps>({
  contentTypeUid: "page",
  url: "/",
  jsonRtePath: ["rich_text", "blocks.block.copy"],
  locale: "en-us",
});
</script>

<template>
  <main style="max-width: 800px; margin: 0 auto">
    <ContentstackModularBlocks
      :component-map="componentMap"
      :blocks="page?.blocks"
    />
  </main>
</template>
