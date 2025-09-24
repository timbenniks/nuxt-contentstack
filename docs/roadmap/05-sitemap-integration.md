# Sitemap Integration

**Priority**: Medium  
**Effort**: Low  
**Status**: 🔴 Not Started  
**Phase**: 2 (Production Ready Features)

## Description

Automatic sitemap generation from Contentstack content with support for multilingual sites, priority settings, and SEO optimization.

## Goal

Provide automatic sitemap generation that dynamically pulls content from Contentstack, handles localization, and integrates seamlessly with Nuxt's ecosystem.

## What This Provides

- **Automatic sitemap generation** - Dynamic XML sitemaps from Contentstack content
- **Multilingual support** - Proper hreflang attributes for localized content
- **SEO optimization** - Priority, change frequency, and last modified dates
- **Flexible configuration** - Include/exclude patterns and custom rules
- **Performance optimized** - Cached generation with smart invalidation
- **@nuxtjs/sitemap integration** - Works with existing sitemap infrastructure

## Implementation Steps

1. **Add configuration schema** - Define sitemap settings and validation
2. **Create sitemap API endpoint** - Server route to generate XML sitemap
3. **Implement content fetching** - Pull content from multiple content types
4. **Add localization support** - Handle multiple locales and hreflang
5. **Integrate with @nuxtjs/sitemap** - Register sitemap source automatically
6. **Add caching layer** - Cache generated sitemaps with smart invalidation
7. **Create validation helpers** - Ensure URLs and priorities are valid

## Files to create/modify

- `src/module.ts` - Add configuration schema and @nuxtjs/sitemap integration
- `src/runtime/server/api/contentstack/sitemap.ts` - Main sitemap generation endpoint
- `src/runtime/server/api/contentstack/sitemap.xml.ts` - XML sitemap endpoint
- `src/runtime/utils/sitemap.ts` - Sitemap generation utilities
- `src/runtime/composables/useSitemap.ts` - Programmatic sitemap access
- `playground/nuxt.config.ts` - Example configuration
- `README.md` - Documentation for sitemap features

## Configuration Options

In `nuxt.config.ts`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  contentstack: {
    apiKey: "blt...",
    deliveryToken: "cs...",
    environment: "preview",

    // Sitemap generation
    sitemap: {
      enabled: true, // Enable/disable sitemap generation

      // Content types to include in sitemap
      contentTypes: [
        {
          uid: "page",
          route: "/[url]", // Route pattern for this content type
          priority: 0.8, // SEO priority (0.0 - 1.0)
          changefreq: "weekly", // Change frequency
          exclude: [], // UIDs to exclude
        },
        {
          uid: "article",
          route: "/blog/[url]",
          priority: 0.6,
          changefreq: "monthly",
          exclude: ["draft-article-uid"], // Exclude specific entries
        },
        {
          uid: "product",
          route: "/products/[url]",
          priority: 0.9,
          changefreq: "daily",
          lastmod: "updated_at", // Field to use for last modified
        },
      ],

      // Localization settings
      i18n: {
        enabled: true,
        locales: ["en-us", "fr-fr", "de-de"], // Supported locales
        defaultLocale: "en-us",
        strategy: "prefix_except_default", // URL strategy
        hreflang: true, // Include hreflang attributes
      },

      // Additional options
      options: {
        hostname: "https://example.com", // Site hostname
        cacheMaxAge: 86400, // Cache duration in seconds (24 hours)
        lastmod: true, // Include lastmod in sitemap
        priority: true, // Include priority in sitemap
        changefreq: true, // Include changefreq in sitemap
        excludeRoutes: ["/admin/**", "/api/**"], // Routes to exclude
        includeRoutes: [], // Additional static routes to include

        // Advanced filtering
        filter: {
          publishedOnly: true, // Only include published content
          dateRange: {
            field: "created_at", // Date field to filter on
            from: null, // Start date (optional)
            to: null, // End date (optional)
          },
        },
      },
    },
  },

  // Integration with @nuxtjs/sitemap module
  sitemap: {
    sources: [
      // This will be automatically added by our module
      "/api/contentstack/sitemap",
    ],
  },
});
```

## Expected Outcome

After implementation, developers get:

1. **Automatic sitemap generation** that works out of the box
2. **Full multilingual support** with proper hreflang attributes
3. **Flexible configuration** for different content types and routes
4. **SEO optimization** with priorities, change frequencies, and last modified dates
5. **Performance optimization** through intelligent caching
6. **Integration with @nuxtjs/sitemap** for ecosystem compatibility
7. **Programmatic access** via composables for advanced use cases

## Benefits

- ✅ **SEO improvement** - Proper sitemaps help search engines discover content
- ✅ **Multilingual support** - Correct hreflang implementation for international SEO
- ✅ **Zero configuration** - Works with sensible defaults
- ✅ **Highly configurable** - Fine-tune for specific needs
- ✅ **Performance optimized** - Cached generation with smart invalidation
- ✅ **Ecosystem integration** - Works with existing Nuxt sitemap tools
- ✅ **Developer friendly** - Programmatic access and easy debugging
