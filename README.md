> Notice: This is an OSS project by @timbenniks and not an officially maintained package by the Contentstack team. Support requests can come through Github issues and via direct channels to @timbenniks.

# Nuxt Contentstack

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Contentstack integration for Nuxt.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
- [🏀 Online playground](https://stackblitz.com/github/timbenniks/nuxt-contentstack?file=playground%2Fapp.vue)
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

- ⚡️ Easy setup
- ⚡️ Query Entries
- ⚡️ Live Preview & Visual builder
- ⚡️ Personalization
- ⚡️ Exposed SDks: TS Delivery SDK, Live preview Utils SDK, Personalize SDK.

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxi module add nuxt-contentstack
```

Or: add to `nuxt.config.ts`:

```js
modules: ['nuxt-contentstack'],

'nuxt-contentstack': {
  debug: true,
  deliverySdkOptions: {
    apiKey: 'blt34bdc2becb9eb935',
    deliveryToken: 'csd38b9b7f1076de03fc347531',
    region: 'eu',
    environment: 'preview',
    live_preview: {
      preview_token: 'csa2fe339f6713f8a52eff086c',
      enable: true,
    },
  },
  livePreviewSdkOptions: {
    editableTags: true,
    editButton: {
      enable: true,
    },
  },
  personalizeSdkOptions: {
    enable: true,
    projectUid: '67054a4e564522fcfa170c43',
  },
},
```

## Options

### debug

general debug dumping the complete settings object into the terminal. Also turns on debug mode in preview SDK.

### deliverySdkOptions

This is the full Contentstack StackConfig. See: https://www.contentstack.com/docs/developers/sdks/content-delivery-sdk/typescript/reference

### livePreviewSdkOptions

This is the full Contentstack configuration for Live Preview Utils.
Learn more: https://www.contentstack.com/docs/developers/set-up-live-preview/get-started-with-live-preview-utils-sdk

### personalizeSdkOptions

- `enable`: enable personalization
- `projectUid`: your personalization peroject UID (to be found in Contentstack UI)

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

## Compoasables

This module offers a composable `useGetEntryByUrl` which allows you to query any entry with a URL field. It also listens to live editing changes and will refresh your content based on entry changes in the CMS, and it understands personalization.

```ts
const { data: page } = await useGetEntryByUrl(
  "page",
  "/about",
  ["reference.fields"],
  ["jsonRtePath"],
  "en-us"
);
```

## TODO:

- Live preview with SSR mode
- Add all regions to the endpoint URL generator

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
