# Contentstack Dependency Hardening

## Why This Changed

The module used to rely mainly on `vite.optimizeDeps.include` to smooth over
CommonJS and mixed-module behavior inside the Contentstack SDK dependency tree.
That worked in the local playground more often than it worked for real consumers,
because the published module still leaves those runtime packages to be resolved
inside the consuming app.

This was especially fragile in browser and dev scenarios where Vite interop rules
can differ based on install layout and dependency resolution.

## What The Module Does Now

The module now hardens downstream builds automatically by:

- transpiling the browser-facing Contentstack packages through Nuxt
- marking those same packages as Vite SSR `noExternal` so Vite transforms them
- keeping `@contentstack/personalize-edge-sdk` isolated from the client bundle
- keeping a much smaller `optimizeDeps.include` list as a fallback instead of
  using it as the primary compatibility mechanism

The browser-facing package list is:

- `@contentstack/delivery-sdk`
- `@contentstack/live-preview-utils`
- `@contentstack/core`
- `@contentstack/utils`

## Validation Targets

This behavior should be validated against:

- local module development in the playground
- packed installs from `npm pack`
- consumer apps using npm
- consumer apps using strict pnpm layouts

If a downstream app still hits browser-side interop problems after this change,
the next step should be to identify the exact failing dependency and decide
whether that dependency needs explicit interop handling or vendoring.
