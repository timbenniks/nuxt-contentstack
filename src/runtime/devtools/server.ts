import { defineEventHandler, readBody, createError } from "h3";

// TypeScript interfaces
interface DevToolsEntry {
  uid: string;
  content_type_uid: string;
  title?: string;
  locale?: string;
  status: string;
  _version?: number;
  fetchedAt: string;
  [key: string]: any;
}

interface DevToolsQuery {
  id: string | number;
  composable: string;
  method: string;
  url: string;
  params: any;
  status: string;
  duration?: number;
  response?: any;
  error?: string;
  timestamp: string;
}

interface DevToolsCacheEntry {
  key: string;
  type: string;
  size: number;
  createdAt: string;
  ttl?: string;
}

interface DevToolsUpdate {
  id: string;
  type: string;
  uid: string;
  timestamp: string;
  content_type: string;
  action: string;
}

interface DevToolsData {
  entries: DevToolsEntry[];
  queries: DevToolsQuery[];
  cache: {
    hitRate: number;
    totalRequests: number;
    size: number;
    memoryUsage: number;
    entries: DevToolsCacheEntry[];
  };
  livePreview: {
    connected: boolean;
    enabled: boolean;
    lastUpdate: string | null;
    updatesCount: number;
    mode: string;
    recentUpdates: DevToolsUpdate[];
  };
}

// Dynamic DevTools data store - starts empty and gets populated by real usage
const devToolsData: DevToolsData = {
  entries: [],
  queries: [],
  cache: {
    hitRate: 0,
    totalRequests: 0,
    size: 0,
    memoryUsage: 0,
    entries: []
  },
  livePreview: {
    connected: false,
    enabled: false,
    lastUpdate: null,
    updatesCount: 0,
    mode: 'preview',
    recentUpdates: []
  },
};

// Helper functions for data management
export function addDevToolsEntry(entry: DevToolsEntry) {
  // Add timestamp if not present
  if (!entry.fetchedAt) {
    entry.fetchedAt = new Date().toISOString();
  }

  // Avoid duplicates by checking UID
  const existingIndex = devToolsData.entries.findIndex(e => e.uid === entry.uid);
  if (existingIndex >= 0) {
    devToolsData.entries[existingIndex] = entry;
  } else {
    devToolsData.entries.unshift(entry);
  }

  // Keep only last 50 entries
  if (devToolsData.entries.length > 50) {
    devToolsData.entries = devToolsData.entries.slice(0, 50);
  }
}

export function addDevToolsQuery(query: DevToolsQuery) {
  // Add timestamp if not present
  if (!query.timestamp) {
    query.timestamp = new Date().toISOString();
  }

  devToolsData.queries.unshift(query);

  // Keep only last 100 queries
  if (devToolsData.queries.length > 100) {
    devToolsData.queries = devToolsData.queries.slice(0, 100);
  }
}

export function updateDevToolsQuery(queryId: string | number, updates: Partial<DevToolsQuery>) {
  const queryIndex = devToolsData.queries.findIndex(q => q.id === queryId);
  if (queryIndex >= 0) {
    devToolsData.queries[queryIndex] = { ...devToolsData.queries[queryIndex], ...updates };
  }
}

export function addDevToolsCacheEntry(entry: DevToolsCacheEntry) {
  if (!entry.createdAt) {
    entry.createdAt = new Date().toISOString();
  }

  devToolsData.cache.entries.unshift(entry);
  devToolsData.cache.size = devToolsData.cache.entries.length;

  // Keep only last 50 cache entries
  if (devToolsData.cache.entries.length > 50) {
    devToolsData.cache.entries = devToolsData.cache.entries.slice(0, 50);
  }
}

export function updateLivePreviewStatus(event: any) {
  const { type, timestamp, ...eventData } = event;

  // Update base Live Preview status
  if (type === 'initialization' || type === 'status') {
    devToolsData.livePreview.connected = eventData.connected || false;
    devToolsData.livePreview.enabled = eventData.enabled || false;
    devToolsData.livePreview.mode = eventData.mode || 'preview';
    devToolsData.livePreview.lastUpdate = timestamp;
  }

  // Handle Live Preview update events
  if (type === 'entry_updated') {
    devToolsData.livePreview.updatesCount++;
    devToolsData.livePreview.lastUpdate = timestamp;

    // Add to recent updates
    devToolsData.livePreview.recentUpdates.unshift({
      id: `update-${Date.now()}`,
      type: 'entry_updated',
      uid: eventData.uid,
      content_type: eventData.content_type,
      action: eventData.action,
      timestamp
    });

    // Keep only last 10 updates
    if (devToolsData.livePreview.recentUpdates.length > 10) {
      devToolsData.livePreview.recentUpdates = devToolsData.livePreview.recentUpdates.slice(0, 10);
    }
  }
}

export default defineEventHandler(async (event) => {
  const url = event.node.req.url || '';

  try {
    // Handle data endpoint
    if (url.includes("/data")) {
      return devToolsData;
    }

    // Handle cache invalidation
    if (url.includes("/cache/invalidate")) {
      if (event.node.req.method !== 'POST') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
      }

      const body = await readBody(event);
      if (body.key) {
        const index = devToolsData.cache.entries.findIndex(entry => entry.key === body.key);
        if (index > -1) {
          devToolsData.cache.entries.splice(index, 1);
          devToolsData.cache.size = devToolsData.cache.entries.length;
        }
      }
      return { success: true, message: 'Cache entry invalidated' };
    }

    // Handle cache clearing
    if (url.includes("/cache/clear")) {
      if (event.node.req.method !== 'POST') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
      }

      devToolsData.cache.entries = [];
      devToolsData.cache.size = 0;
      devToolsData.cache.memoryUsage = 0;
      devToolsData.cache.hitRate = 0;

      return { success: true, message: 'All cache entries cleared' };
    }

    // Handle live preview toggle
    if (url.includes('/preview/toggle')) {
      if (event.node.req.method !== 'POST') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
      }

      devToolsData.livePreview.enabled = !devToolsData.livePreview.enabled;
      devToolsData.livePreview.connected = devToolsData.livePreview.enabled;

      return {
        success: true,
        enabled: devToolsData.livePreview.enabled,
        message: `Live preview ${devToolsData.livePreview.enabled ? 'enabled' : 'disabled'}`
      };
    }

    // For the main DevTools interface, return simple HTML that loads our client.vue component
    return `<!DOCTYPE html>
<html>
<head>
  <title>Contentstack DevTools</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #devtools-frame {
      width: 100%;
      height: 100vh;
      border: none;
    }
  </style>
</head>
<body>
  <div id="app">
    <iframe id="devtools-frame" src="/__nuxt_devtools__/contentstack/client"></iframe>
  </div>
</body>
</html>`;

  } catch (error) {
    console.error('DevTools server error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown server error'
    });
  }
});
