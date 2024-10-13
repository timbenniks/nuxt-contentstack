# Nuxt Contentstack

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Contentstack integration for Nuxt.

<!-- - [✨ &nbsp;Release Notes](/CHANGELOG.md) -->
- [🏀 Online playground](https://stackblitz.com/github/timbenniks/nuxt-contentstack?file=playground%2Fapp.vue)
<!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

- ⚡️ Easy setup
- ⚡️ Exposed stack
- ⚡️ Query Entries
- ⚡️ Live Preview & Visual builder setup

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
    apiKey: 'blte766efb491f96715',
    deliveryToken: 'cs620decb0e6bb175e31210ce9',
    region: Region.EU,
    environment: 'preview',
    live_preview: {
      preview_token: 'csa128deacffe0b26386090915',
      enable: true,
    },
  },
  livePreviewSdkOptions: {
    editableTags: true,
    editButton: {
      enable: true,
    },
  },
}
```

## Options
### debug
general debug dumping the complete settings object into the terminal. Also turns on debug mode in preview SDK.

### deliverySdkOptions
This is the full Contentstack StackConfig. See: https://www.contentstack.com/docs/developers/sdks/content-delivery-sdk/typescript/reference

### livePreviewSdkOptions
This is the full Contentstack configuration for Live Preview Utils.
Learn more: https://www.contentstack.com/docs/developers/set-up-live-preview/get-started-with-live-preview-utils-sdk

## Provides
This module provides a `$contentstack` object with:

- `stack`: The Stack object from the Delivery SDK. Query all the things with this.
- `ContentstackLivePreview`: The instance of Live Preview Utils SDK.
- `livePreviewEnabled`: Was live preview enabled?
- `editableTags`: Do we want editable tags fo visual building?

```ts
  const { editableTags, stack, livePreviewEnabled, ContentstackLivePreview } = useNuxtApp().$contentstack
```

## Compoasables
This module offers a composable `useGetEntryByUrl` which allows you to query any entry with a URL field. It also listens to live editing changes and will refresh your content based on entry changes in the CMS.

```ts
const { data: page } = await useGetEntryByUrl('page', '/about', ['reference.fields'], ['jsonRtePath'], 'en-us')

```

## TODO:
- Live preview with SSR mode
- Add all regions to the endpoint URL generator
- Personalization

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
