<script lang="ts" setup>
import { useGetEntryByUrl } from "#imports";
import type { Page } from "../../types";

type PageProps = Omit<Page, "$"> & {
  cslp?: Page["$"];
};

const { data: page } = await useGetEntryByUrl<PageProps>({
  contentTypeUid: "page",
  url: "/",
  jsonRtePath: ["rich_text", "blocks.block.copy"],
});
</script>

<template>
  <main style="max-width: 800px; margin: 0 auto">
    <h1 v-bind="page?.cslp && page.cslp.title">{{ page?.title }}</h1>
    <p v-bind="page?.cslp && page.cslp.description">{{ page?.description }}</p>
    <nuxt-img
      v-bind="page?.image?.cslp && page?.image?.cslp.url"
      :src="page?.image?.url"
      :alt="page?.image?.title"
      provider="contentstack"
    />

    <div
      v-if="page?.rich_text"
      v-bind="page?.cslp && page?.cslp.rich_text"
      v-html="page?.rich_text"
    />

    <div v-bind="page?.cslp && page?.cslp.blocks">
      <BlockItem
        v-for="item in page?.blocks"
        :key="item.block._metadata.uid"
        v-bind="item.block"
      />
    </div>
  </main>
</template>
