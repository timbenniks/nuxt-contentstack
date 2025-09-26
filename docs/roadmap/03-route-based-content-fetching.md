# Route-based Content Fetching Middleware

**Priority**: High  
**Effort**: Medium  
**Status**: ✅ Completed  
**Phase**: 1 (Essential Features)

> **✅ Implementation Complete!** This feature has been fully implemented and is available in the Nuxt Contentstack module. The auto-fetch middleware, composables, and configuration are all working and documented in the main README.md.

## Description

Add optional middleware to automatically fetch page content based on the current route, reducing boilerplate in pages and components.

## Goal

Provide automatic content fetching for pages without requiring manual composable calls in every component, while maintaining flexibility through configuration.

## What This Provides

- **Automatic content fetching** - Pages automatically get their content based on URL
- **Reduced boilerplate** - No need to call `useGetEntryByUrl` in every page component
- **Configurable** - Enable/disable per route pattern or globally
- **Performance optimized** - Smart caching and deduplication
- **Flexible routing** - Support custom URL patterns and content type mapping

## Implementation Steps

1. **Add configuration schema** - Define middleware settings and validation
2. **Create conditional middleware** - Only register if enabled in config
3. **Implement route matching** - Pattern matching for include/exclude rules
4. **Add content type mapping** - Map routes to content types
5. **Create API endpoints** - Server-side content fetching
6. **Add state management** - Store fetched content in Nuxt state
7. **Test different scenarios** - Various route patterns and configurations

## Files to create/modify

- `src/module.ts` - Add configuration schema and conditional middleware registration
- `src/runtime/middleware/contentstack-auto-fetch.global.ts` - Smart middleware
- `src/runtime/server/api/contentstack/auto-fetch.ts` - Server-side fetching
- `src/runtime/composables/useAutoFetchedContent.ts` - Access auto-fetched content
- `playground/nuxt.config.ts` - Example configuration
- `README.md` - Documentation for the feature

## Configuration Options

In `nuxt.config.ts`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  contentstack: {
    apiKey: "blt...",
    deliveryToken: "cs...",
    environment: "preview",

    // Route-based content fetching
    autoFetch: {
      enabled: true, // Enable/disable the middleware

      // Route patterns to include
      include: [
        "/", // Homepage
        "/about", // Specific routes
        "/blog/*", // Wildcard patterns
        "/pages/**", // Deep wildcard patterns
      ],

      // Route patterns to exclude
      exclude: ["/admin/**", "/api/**", "/_nuxt/**", "/auth/*"],

      // Content type mapping by route pattern
      contentTypeMapping: {
        "/": "page", // Homepage uses 'page' content type
        "/blog/*": "article", // Blog routes use 'article' content type
        "/products/*": "product", // Product routes use 'product' content type
        default: "page", // Fallback content type
      },

      // Additional options
      options: {
        locale: "en-us", // Default locale
        includeReferences: ["author", "category"], // Default references to include
        includeFallback: true, // Include fallback content
        cacheKey: "auto-fetch", // Cache key prefix
        errorHandling: "silent", // "silent" | "throw" | "log"
      },
    },
  },
});
```

## Module Configuration Schema

In `src/module.ts`:

```typescript
export interface AutoFetchConfig {
  enabled: boolean;
  include: string[];
  exclude: string[];
  contentTypeMapping: Record<string, string>;
  options: {
    locale: string;
    includeReferences: string[];
    includeFallback: boolean;
    cacheKey: string;
    errorHandling: "silent" | "throw" | "log";
  };
}

// Add to module options
export interface ModuleOptions {
  // ... existing options
  autoFetch?: Partial<AutoFetchConfig>;
}

// In module setup
const autoFetchConfig: AutoFetchConfig = defu(options.autoFetch, {
  enabled: false, // Disabled by default
  include: [],
  exclude: ["/admin/**", "/api/**", "/_nuxt/**"],
  contentTypeMapping: { default: "page" },
  options: {
    locale: "en-us",
    includeReferences: [],
    includeFallback: true,
    cacheKey: "auto-fetch",
    errorHandling: "silent",
  },
});

// Only register middleware if enabled
if (autoFetchConfig.enabled) {
  addRouteMiddleware({
    name: "contentstack-auto-fetch",
    path: resolve("./runtime/middleware/contentstack-auto-fetch.global.ts"),
    global: true,
  });
}
```

## Smart Middleware Implementation

`src/runtime/middleware/contentstack-auto-fetch.global.ts`:

```typescript
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Get configuration from runtime config
  const { autoFetch } = useRuntimeConfig().public.contentstack;

  if (!autoFetch.enabled) return;

  // Check if route should be processed
  if (!shouldProcessRoute(to.path, autoFetch.include, autoFetch.exclude)) {
    return;
  }

  // Determine content type for this route
  const contentType = getContentTypeForRoute(
    to.path,
    autoFetch.contentTypeMapping
  );

  // Skip if already fetched (for client-side navigation)
  const cacheKey = `${autoFetch.options.cacheKey}-${contentType}-${to.path}`;
  const existingContent = useState(cacheKey);
  if (existingContent.value) {
    return;
  }

  // Fetch content for this route
  try {
    const content = await $fetch("/api/contentstack/auto-fetch", {
      query: {
        url: to.path,
        contentType,
        locale: autoFetch.options.locale,
        includeReferences: autoFetch.options.includeReferences.join(","),
        includeFallback: autoFetch.options.includeFallback,
      },
    });

    // Store in state for components to access
    useState(cacheKey, () => content);

    // Also store in a general key for easy access
    useState("contentstack.currentPage", () => content);
  } catch (error) {
    // Handle errors based on configuration
    if (autoFetch.options.errorHandling === "throw") {
      throw error;
    } else if (autoFetch.options.errorHandling === "log") {
      console.error(`Failed to auto-fetch content for ${to.path}:`, error);
    }
    // 'silent' mode does nothing
  }
});

// Helper functions for route matching
function shouldProcessRoute(
  path: string,
  include: string[],
  exclude: string[]
): boolean {
  // Implementation details...
}

function getContentTypeForRoute(
  path: string,
  mapping: Record<string, string>
): string {
  // Implementation details...
}

function matchRoutePattern(path: string, pattern: string): boolean {
  // Implementation details...
}
```

## Expected Outcome

After implementation, developers can:

1. **Enable auto-fetching globally or per route pattern**
2. **Access content automatically** without manual composable calls:
   ```vue
   <script setup>
   const { content } = useAutoFetchedContent<Page>()
   // content.value is automatically populated
   </script>
   ```
3. **Configure content type mapping** for different route patterns
4. **Maintain performance** through smart caching and deduplication
5. **Keep flexibility** by easily disabling or customizing the behavior

## Benefits

- ✅ **Reduced boilerplate** - No manual fetching in every component
- ✅ **Better DX** - Content "just works" based on URL
- ✅ **Configurable** - Enable/disable per project needs
- ✅ **Performance optimized** - Smart caching and route matching
- ✅ **Flexible** - Support for complex routing patterns
- ✅ **Backward compatible** - Existing manual fetching still works

---

## ✅ Implementation Summary

**This feature has been successfully implemented and includes:**

### 🛠️ **Components Delivered:**

- **Auto-fetch middleware** (`src/runtime/middleware/contentstack-auto-fetch.global.ts`)
- **Server API endpoint** (`src/runtime/server/api/contentstack/auto-fetch.ts`)
- **useAutoFetchedContent composable** (`src/runtime/composables/useAutoFetchedContent.ts`)
- **Module configuration** integration in `src/module.ts`
- **TypeScript types** and full type safety
- **Playground examples** demonstrating usage
- **Comprehensive documentation** in README.md

### ⚙️ **Configuration Features:**

- **Route patterns** - Include/exclude with wildcard support (`*`, `**`)
- **Content type mapping** - Map routes to specific content types
- **Error handling modes** - Silent, log, or throw options
- **Reference inclusion** - Configure which references to fetch
- **Locale support** - Per-route locale configuration
- **Debug output** - Full visibility into auto-fetch configuration

### 🚀 **Key Capabilities:**

- **Zero-config content fetching** - Just enable and go
- **Smart caching** - Efficient deduplication and storage
- **Flexible routing** - Support for complex URL patterns
- **Production ready** - Robust error handling and performance optimized
- **Developer friendly** - Comprehensive debug output and clear documentation

**Status**: Ready for production use! 🎉
