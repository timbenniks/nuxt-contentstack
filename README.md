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

<!-- Highlight some of the features your module provide here -->
- ⛰ &nbsp;Query Entries
- 🚠 &nbsp;Live Preview & Visual builder
- 🌲 &nbsp;Future: Personalize

## TODO:
- Live preview with SSR mode
- Peronalization
- Docs site
- Release to NPM
- List on Nuxt modules page

## Quick Setup

Install the module to your Nuxt application with one command:

<!-- ```bash
npx nuxi module add nuxt-contentstack
``` -->

Add to `nuxt.config.ts`:

```js
modules: ['nuxt-contentstack'],

contentstack: {
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
