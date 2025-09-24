# Nuxt DevTools Integration

**Priority**: High  
**Effort**: High  
**Status**: ✅ Completed  
**Phase**: 1 (Essential Features)

## ✅ Completion Summary

**Completed in**: Branch `feature/nuxt-devtools-integration`  
**Date**: January 2025

### What Was Delivered

- ✅ Custom Contentstack tab in Nuxt DevTools
- ✅ Real-time content and query monitoring
- ✅ Cache statistics and management
- ✅ Live Preview status tracking
- ✅ Clean, theme-adaptive interface
- ✅ Dynamic data tracking from composables
- ✅ Clean architecture with proper separation of concerns

### Key Features Implemented

- **Content Inspector**: View all fetched entries with metadata
- **Query Monitor**: Real-time API calls with parameters and performance metrics
- **Cache Status**: Hit rates, cache management, and statistics
- **Live Preview Status**: Connection status and real-time update tracking
- **Error Tracking**: Failed requests and debugging information
- **Theme Support**: Automatic light/dark mode adaptation

## Description

Add a custom tab to Nuxt DevTools for debugging Contentstack content, monitoring queries, and inspecting cache status.

## Goal

Provide developers with visual tools to debug Contentstack integration, monitor performance, and inspect content fetching in real-time.

## What DevTools Integration Provides

- **Content Inspector** - View all fetched entries and assets
- **Query Monitor** - Real-time API calls with performance metrics
- **Cache Status** - Hit/miss rates and cache invalidation
- **Live Preview Status** - Connection status and real-time updates
- **Error Tracking** - Failed requests and debugging information

## Implementation Steps

1. **Setup DevTools structure** - Create devtools directory and components
2. **Register with Nuxt DevTools** - Add module integration
3. **Create client interface** - Vue components for the DevTools tab
4. **Add server hooks** - Track and expose runtime data
5. **Test integration** - Verify DevTools tab appears and functions

## Files to create/modify

- `src/devtools/` - New directory for DevTools components
- `src/devtools/client.vue` - Main DevTools tab interface
- `src/devtools/server.ts` - Server-side data collection
- `src/module.ts` - Register DevTools integration
- `playground/` - Test the DevTools integration

## DevTools Module Registration

In `src/module.ts`:

```typescript
// Register DevTools integration
addDevToolsCustomTab({
  name: "contentstack",
  title: "Contentstack",
  icon: "i-simple-icons-contentstack",
  category: "modules",
  view: {
    type: "iframe",
    src: "/__nuxt_devtools__/contentstack",
  },
});

// Add DevTools server middleware
addServerHandler({
  route: "/__nuxt_devtools__/contentstack",
  handler: resolve("./runtime/devtools/server"),
});
```

## Client Interface

`src/devtools/client.vue`:

```vue
<template>
  <div class="contentstack-devtools">
    <!-- Navigation Tabs -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- Content Inspector Tab -->
    <div v-if="activeTab === 'content'" class="tab-content">
      <h3>Fetched Content</h3>
      <div class="content-list">
        <div
          v-for="item in contentstackData.entries"
          :key="item.uid"
          class="content-item"
        >
          <div class="content-header">
            <span class="content-type">{{ item.content_type_uid }}</span>
            <span class="content-uid">{{ item.uid }}</span>
            <span class="content-status" :class="item.status">{{
              item.status
            }}</span>
          </div>
          <div class="content-details">
            <pre>{{ JSON.stringify(item, null, 2) }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Query Monitor Tab -->
    <div v-if="activeTab === 'queries'" class="tab-content">
      <h3>API Queries</h3>
      <div class="queries-list">
        <div
          v-for="query in contentstackData.queries"
          :key="query.id"
          class="query-item"
        >
          <div class="query-header">
            <span class="query-method">{{ query.method }}</span>
            <span class="query-url">{{ query.url }}</span>
            <span class="query-time">{{ query.duration }}ms</span>
            <span class="query-status" :class="query.status">{{
              query.status
            }}</span>
          </div>
          <div class="query-details">
            <div>Request: {{ query.params }}</div>
            <div>Response: {{ query.response?.length || 0 }} items</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Cache Status Tab -->
    <div v-if="activeTab === 'cache'" class="tab-content">
      <h3>Cache Statistics</h3>
      <div class="cache-stats">
        <div class="stat-card">
          <h4>Hit Rate</h4>
          <div class="stat-value">{{ contentstackData.cache.hitRate }}%</div>
        </div>
        <div class="stat-card">
          <h4>Total Requests</h4>
          <div class="stat-value">
            {{ contentstackData.cache.totalRequests }}
          </div>
        </div>
        <div class="stat-card">
          <h4>Cache Size</h4>
          <div class="stat-value">{{ contentstackData.cache.size }}</div>
        </div>
      </div>

      <h4>Cache Entries</h4>
      <div class="cache-entries">
        <div
          v-for="entry in contentstackData.cache.entries"
          :key="entry.key"
          class="cache-entry"
        >
          <span class="cache-key">{{ entry.key }}</span>
          <span class="cache-age">{{ entry.age }}s ago</span>
          <button @click="invalidateCache(entry.key)">Invalidate</button>
        </div>
      </div>
    </div>

    <!-- Live Preview Tab -->
    <div v-if="activeTab === 'preview'" class="tab-content">
      <h3>Live Preview Status</h3>
      <div class="preview-status">
        <div
          class="status-indicator"
          :class="{ connected: contentstackData.livePreview.connected }"
        >
          {{
            contentstackData.livePreview.connected
              ? "Connected"
              : "Disconnected"
          }}
        </div>
        <div>Last Update: {{ contentstackData.livePreview.lastUpdate }}</div>
        <div>
          Updates Received: {{ contentstackData.livePreview.updatesCount }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const activeTab = ref("content");
const contentstackData = ref({
  entries: [],
  queries: [],
  cache: { hitRate: 0, totalRequests: 0, size: 0, entries: [] },
  livePreview: { connected: false, lastUpdate: null, updatesCount: 0 },
});

const tabs = [
  { id: "content", name: "Content" },
  { id: "queries", name: "Queries" },
  { id: "cache", name: "Cache" },
  { id: "preview", name: "Live Preview" },
];

onMounted(() => {
  // Fetch initial data from server
  fetchDevToolsData();

  // Setup real-time updates
  setupWebSocket();
});

async function fetchDevToolsData() {
  try {
    const response = await fetch("/__nuxt_devtools__/contentstack/data");
    contentstackData.value = await response.json();
  } catch (error) {
    console.error("Failed to fetch DevTools data:", error);
  }
}

function setupWebSocket() {
  // Setup WebSocket for real-time updates
  const ws = new WebSocket(
    "ws://localhost:3000/__nuxt_devtools__/contentstack/ws"
  );

  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    // Update specific data based on update type
    if (update.type === "query") {
      contentstackData.value.queries.unshift(update.data);
    } else if (update.type === "cache") {
      contentstackData.value.cache = update.data;
    }
    // ... handle other update types
  };
}

async function invalidateCache(key: string) {
  try {
    await fetch(`/__nuxt_devtools__/contentstack/cache/invalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    await fetchDevToolsData(); // Refresh data
  } catch (error) {
    console.error("Failed to invalidate cache:", error);
  }
}
</script>

<style scoped>
.contentstack-devtools {
  padding: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e5e5e5;
}

.tabs button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.tabs button.active {
  border-bottom-color: #10b981;
  color: #10b981;
}

.content-item,
.query-item,
.cache-entry {
  border: 1px solid #e5e5e5;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 0.5rem;
}

.content-header,
.query-header {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 0.5rem;
}

.stat-card {
  border: 1px solid #e5e5e5;
  border-radius: 0.5rem;
  padding: 1rem;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #10b981;
}

.status-indicator {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: #ef4444;
  color: white;
}

.status-indicator.connected {
  background: #10b981;
}
</style>
```

## Server Handler

`src/devtools/server.ts`:

```typescript
import { defineEventHandler, getQuery } from "h3";

// Store DevTools data
const devToolsData = {
  entries: [],
  queries: [],
  cache: { hitRate: 95, totalRequests: 150, size: 25, entries: [] },
  livePreview: { connected: true, lastUpdate: new Date(), updatesCount: 5 },
};

export default defineEventHandler(async (event) => {
  const { path } = getQuery(event);

  if (event.node.req.url?.includes("/data")) {
    // Return current DevTools data
    return devToolsData;
  }

  if (event.node.req.url?.includes("/cache/invalidate")) {
    // Handle cache invalidation
    const { key } = await readBody(event);
    // Invalidate specific cache key
    devToolsData.cache.entries = devToolsData.cache.entries.filter(
      (entry) => entry.key !== key
    );
    return { success: true };
  }

  // Return the DevTools HTML interface
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Contentstack DevTools</title>
        <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
      </head>
      <body>
        <div id="app"></div>
        <!-- Load client.vue component -->
      </body>
    </html>
  `;
});
```

## Data Collection Integration

To collect real-time data, add hooks to existing composables:

```typescript
// In useGetEntryByUrl.ts - add DevTools tracking
if (process.dev) {
  // Track query for DevTools
  const queryData = {
    id: Date.now(),
    method: "GET",
    url: `/entries?content_type_uid=${contentTypeUid}&url=${url}`,
    params: { contentTypeUid, url, locale },
    status: "pending",
    startTime: Date.now(),
  };

  // Add to DevTools data
  addDevToolsQuery(queryData);

  // Update on completion
  queryData.status = "success";
  queryData.duration = Date.now() - queryData.startTime;
  queryData.response = result;
  updateDevToolsQuery(queryData);
}
```

## Expected Outcome

After implementation, developers will see a "Contentstack" tab in Nuxt DevTools that provides:

- ✅ **Visual content inspection** - See all fetched entries and assets
- ✅ **Query monitoring** - Real-time API calls with performance metrics
- ✅ **Cache insights** - Hit rates, cache size, and manual invalidation
- ✅ **Live preview status** - Connection status and update tracking
- ✅ **Debug capabilities** - Error tracking and request/response inspection

## Benefits for Developers

- 🔍 **Easy debugging** - Visual inspection of content and queries
- ⚡ **Performance monitoring** - Identify slow queries and cache issues
- 🔄 **Live preview debugging** - Monitor real-time content updates
- 🛠️ **Development efficiency** - Quick access to all Contentstack data
