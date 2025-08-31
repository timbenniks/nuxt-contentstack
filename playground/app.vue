<script lang="ts" setup>
const { data: page } = await useGetEntryByUrl({
  contentTypeUid: "page",
  url: "/",
});
</script>

<template>
  <main class="max-w-screen-2xl mx-auto">
    <section class="p-4">
      <h1
        v-if="page?.title"
        class="text-4xl font-bold mb-4"
        v-bind="page?.$ && page?.$.title"
      >
        {{ page?.title }}
      </h1>

      <p
        v-if="page?.description"
        class="mb-4"
        v-bind="page?.$ && page?.$.description"
      >
        {{ page?.description }}
      </p>

      <img
        v-if="page?.image"
        class="mb-4"
        width="640"
        height="360"
        :src="page?.image.url"
        :alt="page?.image.title"
        v-bind="page?.image?.$ && page?.image?.$.url"
      />
    </section>
  </main>
</template>
