# Content Preview Modes

**Priority**: Medium  
**Effort**: Medium  
**Status**: 🔴 Not Started  
**Phase**: 2 (Production Ready Features)

## Description

Comprehensive content preview system supporting draft content, scheduled publishing, and editor-friendly previews with seamless switching between preview and live modes.

## Goal

Provide content editors and developers with a robust preview system that allows viewing unpublished content, scheduled content, and different content states while maintaining security and performance.

## What This Provides

- **Draft content preview** - View unpublished content using preview tokens
- **Scheduled content support** - Preview content with future publish dates
- **Preview mode detection** - Automatic detection via query params, headers, or cookies
- **Security controls** - Secure preview access with token validation
- **Editor toolbar** - Visual preview controls for content editors
- **Multi-environment support** - Different preview configurations per environment
- **Seamless switching** - Toggle between preview and live content without page reload

## Implementation Steps

1. **Add configuration schema** - Define preview settings and validation
2. **Create preview detection middleware** - Detect preview mode from various sources
3. **Implement token switching** - Dynamically switch between preview/live tokens
4. **Build preview toolbar component** - Visual preview controls for editors
5. **Add preview composables** - Programmatic preview management
6. **Create security layer** - Validate preview access and permissions
7. **Add scheduled content support** - Handle future publish dates
8. **Implement fallback strategies** - Graceful degradation when preview fails

## Files to create/modify

- `src/module.ts` - Add configuration schema and preview integration
- `src/runtime/middleware/contentstack-preview.global.ts` - Preview detection middleware
- `src/runtime/components/ContentstackPreviewToolbar.vue` - Preview toolbar component
- `src/runtime/composables/useContentstackPreview.ts` - Preview management composable
- `src/runtime/utils/preview.ts` - Preview utilities and token management
- `src/runtime/server/api/contentstack/preview/` - Preview API endpoints
- `src/runtime/plugins/preview.client.ts` - Client-side preview initialization
- `playground/nuxt.config.ts` - Example configuration
- `README.md` - Preview documentation

## Configuration Options

In `nuxt.config.ts`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  contentstack: {
    apiKey: "blt...",
    deliveryToken: "cs...", // Live content token
    previewToken: "cs...", // Preview content token
    environment: "development",

    // Content Preview Configuration
    preview: {
      enabled: true, // Enable/disable preview functionality

      // Detection methods for preview mode
      detection: {
        queryParam: "preview", // ?preview=true
        header: "x-contentstack-preview", // X-Contentstack-Preview: true
        cookie: "contentstack_preview", // Cookie-based detection
        secretParam: "preview_secret", // ?preview_secret=secret123
        secret: process.env.CONTENTSTACK_PREVIEW_SECRET, // Secret for security
      },

      // Preview token configuration
      tokens: {
        preview: process.env.CONTENTSTACK_PREVIEW_TOKEN,
        management: process.env.CONTENTSTACK_MANAGEMENT_TOKEN, // For advanced features
        autoSwitch: true, // Automatically switch tokens based on mode
      },

      // Preview toolbar settings
      toolbar: {
        enabled: true, // Show preview toolbar
        position: "top", // "top" | "bottom" | "floating"
        showBadge: true, // Show "PREVIEW MODE" badge
        showControls: true, // Show preview controls
        allowToggle: true, // Allow users to toggle preview mode
        customCSS: "", // Custom CSS for toolbar styling
      },

      // Content options
      content: {
        includeDrafts: true, // Include draft content
        includeScheduled: true, // Include scheduled content
        showVersions: true, // Show content versions
        showMetadata: true, // Show content metadata in preview
        fallbackToLive: true, // Fallback to live content if preview unavailable
      },

      // Security settings
      security: {
        restrictedRoutes: ["/admin/**"], // Routes where preview is not allowed
        allowedOrigins: ["localhost:3000", "preview.example.com"], // Allowed origins
        sessionTimeout: 3600, // Preview session timeout (seconds)
        requireAuth: false, // Require authentication for preview access
      },

      // Performance options
      performance: {
        cachePreview: false, // Cache preview content (usually false)
        prefetchScheduled: true, // Prefetch scheduled content
        maxPreviewAge: 300, // Max age for preview content cache (seconds)
      },
    },
  },
});
```

## Expected Outcome

After implementation, content editors and developers get:

1. **Seamless preview experience** - Easy switching between live and preview content
2. **Visual preview controls** - Intuitive toolbar for managing preview mode
3. **Security features** - Protected preview access with secrets and session management
4. **Draft and scheduled content** - Full support for unpublished content states
5. **Performance optimization** - Smart caching and token management
6. **Developer-friendly APIs** - Composables for programmatic preview control
7. **Flexible configuration** - Customizable detection methods and security settings

## Benefits

- ✅ **Enhanced editor experience** - Content editors can preview changes before publishing
- ✅ **Secure preview access** - Protected with secrets and session timeouts
- ✅ **Flexible detection** - Multiple ways to enable preview mode
- ✅ **Visual feedback** - Clear indicators when in preview mode
- ✅ **Scheduled content support** - Preview future content releases
- ✅ **Performance optimized** - Efficient token switching and caching
- ✅ **Developer friendly** - Rich APIs for custom preview implementations
