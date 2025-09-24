import { defineEventHandler } from "h3";

export default defineEventHandler(async () => {
  // Return a simple HTML page that includes Vue and our component
  return `<!DOCTYPE html>
<html>
<head>
  <title>Contentstack DevTools</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    /* DevTools theme variables */
    :root {
      --devtools-bg: #ffffff;
      --devtools-bg-soft: #fafafa;
      --devtools-border: #e5e5e5;
      --devtools-text: #374151;
      --devtools-text-light: #6b7280;
      --devtools-primary: #10b981;
      --devtools-bg-hover: #f9fafb;
      --devtools-card-bg: #ffffff;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --devtools-bg: #1a1a1a;
        --devtools-bg-soft: #242424;
        --devtools-border: #333333;
        --devtools-text: #e5e7eb;
        --devtools-text-light: #9ca3af;
        --devtools-primary: #10b981;
        --devtools-bg-hover: #2a2a2a;
        --devtools-card-bg: #242424;
      }
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--devtools-bg);
      color: var(--devtools-text);
      height: 100vh;
      overflow: hidden;
    }

    #app { height: 100vh; overflow-y: auto; }

    .contentstack-devtools { padding: 1rem; }

    .tabs {
      display: flex; gap: 0.5rem; margin-bottom: 1rem;
      border-bottom: 1px solid var(--devtools-border);
    }

    .tabs button {
      padding: 0.5rem 1rem; border: none; background: none; cursor: pointer;
      border-bottom: 2px solid transparent; position: relative; display: flex;
      align-items: center; gap: 0.5rem; color: var(--devtools-text);
      transition: all 0.2s ease;
    }

    .tabs button:hover { color: var(--devtools-primary); }

    .tabs button.active {
      border-bottom-color: var(--devtools-primary);
      color: var(--devtools-primary);
    }

    .tab-count {
      background: var(--devtools-primary); color: white; border-radius: 1rem;
      padding: 0.125rem 0.375rem; font-size: 0.75rem; min-width: 1rem; text-align: center;
    }

    .tab-header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;
    }

    .tab-header h3 { margin: 0; color: var(--devtools-text); }

    .refresh-btn, .clear-cache-btn {
      padding: 0.5rem 1rem; border: 1px solid var(--devtools-border);
      background: var(--devtools-card-bg); color: var(--devtools-text);
      border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem;
      transition: background 0.2s ease;
    }

    .refresh-btn:hover, .clear-cache-btn:hover {
      background: var(--devtools-bg-hover);
    }

    .empty-state {
      text-align: center; padding: 2rem; color: var(--devtools-text-light);
      background: var(--devtools-card-bg); border-radius: 0.5rem;
      border: 1px solid var(--devtools-border);
    }

    .content-item, .query-item {
      border: 1px solid var(--devtools-border); border-radius: 0.5rem;
      padding: 1rem; margin-bottom: 0.5rem; background: var(--devtools-card-bg);
    }

    .content-header, .query-header {
      display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap;
    }

    .content-type, .query-composable {
      background: rgba(16, 185, 129, 0.2);
      color: var(--devtools-primary); padding: 0.25rem 0.5rem;
      border-radius: 0.25rem; font-size: 0.75rem; font-weight: 500;
    }

    .content-uid {
      font-family: monospace;
      background: var(--devtools-bg-soft); color: var(--devtools-text-light);
      padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;
    }

    .content-status, .query-status {
      padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;
      font-weight: 500; text-transform: uppercase;
    }

    .content-status.published, .query-status.success {
      background: rgba(34, 197, 94, 0.2); color: #22c55e;
    }

    .content-status.draft, .query-status.pending {
      background: rgba(245, 158, 11, 0.2); color: #f59e0b;
    }

    .query-status.error {
      background: rgba(239, 68, 68, 0.2); color: #ef4444;
    }

    .content-time, .query-time {
      font-size: 0.75rem; color: var(--devtools-text-light);
    }

    .stat-card {
      border: 1px solid var(--devtools-border); border-radius: 0.5rem;
      padding: 1rem; text-align: center; background: var(--devtools-card-bg);
    }

    .stat-card h4 {
      margin: 0 0 0.5rem 0; color: var(--devtools-text-light);
      font-size: 0.875rem; font-weight: 500;
    }

    .stat-value {
      font-size: 2rem; font-weight: bold; color: var(--devtools-primary);
    }

    .cache-stats {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem; margin-bottom: 2rem;
    }

    .connection-indicator {
      font-size: 1.25rem; font-weight: bold; padding: 0.5rem;
      border-radius: 0.375rem; text-align: center;
    }

    .connection-indicator.connected {
      background: rgba(34, 197, 94, 0.2); color: #22c55e;
    }

    .connection-indicator:not(.connected) {
      background: rgba(239, 68, 68, 0.2); color: #ef4444;
    }

    .query-stats {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-item {
      font-size: 0.875rem;
      color: var(--devtools-text-light);
    }

    .stat-item strong {
      color: var(--devtools-text);
      font-weight: 600;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h4 {
      margin: 0 0 0.5rem 0;
      color: var(--devtools-text);
      font-size: 1.125rem;
      font-weight: 600;
    }

    .query-params {
      margin-top: 0.5rem;
    }

    .params-json {
      background: var(--devtools-bg-soft);
      padding: 0.75rem;
      border-radius: 0.375rem;
      font-family: monospace;
      font-size: 0.75rem;
      color: var(--devtools-text);
      border: 1px solid var(--devtools-border);
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
      margin-top: 0.25rem;
    }

    .query-response {
      margin-top: 0.5rem;
      padding: 0.5rem;
      background: rgba(16, 185, 129, 0.1);
      border-radius: 0.375rem;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .query-error {
      margin-top: 0.5rem;
      color: #ef4444 !important;
      background: rgba(239, 68, 68, 0.1);
      padding: 0.5rem;
      border-radius: 0.375rem;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
  </style>
</head>
<body>
  <div id="app">
    <div class="contentstack-devtools">
      <div class="tabs">
        <button v-for="tab in tabs" :key="tab.id" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
          {{ tab.name }}
          <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <!-- Content Tab -->
      <div v-if="activeTab === 'content'" class="tab-content">
        <div class="tab-header">
          <h3>Fetched Content</h3>
          <div class="query-stats">
            <span class="stat-item">Total: <strong>{{ contentstackData.entries.length }}</strong></span>
            <button class="refresh-btn" @click="refreshData">Refresh</button>
          </div>
        </div>

        <div v-if="contentstackData.entries.length === 0" class="empty-state">
          <div class="empty-icon">📄</div>
          <h4>No content has been fetched yet</h4>
          <p>Navigate to a page that uses Contentstack composables to see content entries here</p>
        </div>

        <div v-else class="content-list">
          <div v-for="item in contentstackData.entries" :key="item.uid" class="content-item">
            <div class="content-header">
              <span class="content-type">{{ item.content_type_uid }}</span>
              <span class="content-uid">{{ item.uid }}</span>
              <span class="content-status" :class="item.status">{{ item.status }}</span>
              <span class="content-time">{{ formatTime(item.fetchedAt) }}</span>
            </div>
            <h4>{{ item.title || 'Untitled' }}</h4>
            <p><strong>Locale:</strong> {{ item.locale || 'en-us' }}</p>
            <p><strong>Version:</strong> {{ item._version || 'N/A' }}</p>
          </div>
        </div>
      </div>

      <!-- Queries Tab -->
      <div v-if="activeTab === 'queries'" class="tab-content">
        <div class="tab-header">
          <h3>API Queries</h3>
          <div class="query-stats">
            <span class="stat-item">Total: <strong>{{ contentstackData.queries.length }}</strong></span>
            <span class="stat-item">Avg: <strong>{{ averageQueryTime }}ms</strong></span>
            <button class="refresh-btn" @click="refreshData">Refresh</button>
          </div>
        </div>

        <div v-if="contentstackData.queries.length === 0" class="empty-state">
          <div class="empty-icon">📊</div>
          <h4>No API queries recorded yet</h4>
          <p>Navigate through your app to see Contentstack API calls here</p>
        </div>

        <div v-else class="queries-list">
          <div v-for="query in contentstackData.queries" :key="query.id" class="query-item">
            <div class="query-header">
              <span class="query-composable">{{ query.composable }}</span>
              <span class="query-status" :class="query.status">{{ query.status }}</span>
              <span class="query-time">{{ query.duration || 0 }}ms</span>
            </div>
            <p><strong>URL:</strong> {{ query.url }}</p>
            <p><strong>Method:</strong> {{ query.method || 'GET' }}</p>

            <div v-if="query.params && Object.keys(query.params).length > 0" class="query-params">
              <p><strong>Parameters:</strong></p>
              <pre class="params-json">{{ JSON.stringify(query.params, null, 2) }}</pre>
            </div>

            <div v-if="query.response" class="query-response">
              <p><strong>Response:</strong> {{ getResponseSummary(query.response) }}</p>
            </div>

            <p v-if="query.error" class="query-error"><strong>Error:</strong> {{ query.error }}</p>
          </div>
        </div>
      </div>

      <!-- Cache Tab -->
      <div v-if="activeTab === 'cache'" class="tab-content">
        <div class="tab-header">
          <h3>Cache Statistics</h3>
          <button class="clear-cache-btn" @click="clearAllCache">Clear All Cache</button>
        </div>

        <div class="cache-stats">
          <div class="stat-card">
            <h4>Hit Rate</h4>
            <div class="stat-value">{{ contentstackData.cache.hitRate }}%</div>
          </div>
          <div class="stat-card">
            <h4>Total Requests</h4>
            <div class="stat-value">{{ contentstackData.cache.totalRequests }}</div>
          </div>
          <div class="stat-card">
            <h4>Cache Size</h4>
            <div class="stat-value">{{ contentstackData.cache.size }}</div>
          </div>
        </div>
      </div>

      <!-- Live Preview Tab -->
      <div v-if="activeTab === 'preview'" class="tab-content">
        <div class="tab-header">
          <h3>Live Preview Status</h3>
        </div>

        <div class="stat-card">
          <div :class="['connection-indicator', { connected: contentstackData.livePreview.connected }]">
            {{ contentstackData.livePreview.connected ? "🟢 Connected" : "🔴 Disconnected" }}
          </div>
          <div style="margin-top: 1rem; text-align: left;">
            <div><strong>Status:</strong> {{ contentstackData.livePreview.enabled ? 'Enabled' : 'Disabled' }}</div>
            <div><strong>Mode:</strong> {{ contentstackData.livePreview.mode }}</div>
            <div><strong>Updates Received:</strong> {{ contentstackData.livePreview.updatesCount }}</div>
            <div v-if="contentstackData.livePreview.lastUpdate">
              <strong>Last Update:</strong> {{ formatTime(contentstackData.livePreview.lastUpdate) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const { createApp, ref, computed, onMounted } = Vue;

    createApp({
      setup() {
        const activeTab = ref("content");
        const contentstackData = ref({
          entries: [],
          queries: [],
          cache: { hitRate: 0, totalRequests: 0, size: 0, entries: [] },
          livePreview: { connected: false, enabled: false, updatesCount: 0 }
        });

        const tabs = computed(() => [
          { id: "content", name: "Content", count: contentstackData.value.entries.length },
          { id: "queries", name: "Queries", count: contentstackData.value.queries.length },
          { id: "cache", name: "Cache", count: contentstackData.value.cache.entries.length },
          { id: "preview", name: "Live Preview" },
        ]);

        const averageQueryTime = computed(() => {
          const queries = contentstackData.value.queries;
          if (queries.length === 0) return 0;
          const total = queries.reduce((sum, q) => sum + (q.duration || 0), 0);
          return Math.round(total / queries.length);
        });

        async function fetchDevToolsData() {
          try {
            const response = await fetch("/__nuxt_devtools__/contentstack/data");
            if (response.ok) {
              const data = await response.json();
              contentstackData.value = data;
            }
          } catch (error) {
            console.error("Failed to fetch DevTools data:", error);
          }
        }

        async function refreshData() {
          await fetchDevToolsData();
        }

        async function clearAllCache() {
          try {
            await fetch("/__nuxt_devtools__/contentstack/cache/clear", { method: "POST" });
            await fetchDevToolsData();
          } catch (error) {
            console.error("Failed to clear cache:", error);
          }
        }

        function formatTime(timestamp) {
          if (!timestamp) return "Never";
          const date = new Date(timestamp);
          return date.toLocaleTimeString();
        }

        function getResponseSummary(response) {
          if (!response) return 'No data';

          if (typeof response === 'object') {
            if (response.uid) {
              return 'Entry: ' + (response.title || response.uid) + ' (' + (response.content_type_uid || 'unknown') + ')';
            }
            if (Array.isArray(response)) {
              return response.length + ' items';
            }
            const keys = Object.keys(response);
            return 'Object with ' + keys.length + ' properties';
          }

          return String(response).substring(0, 50) + (String(response).length > 50 ? '...' : '');
        }

        onMounted(() => {
          fetchDevToolsData();
          setInterval(fetchDevToolsData, 5000);
        });

        return {
          activeTab,
          contentstackData,
          tabs,
          averageQueryTime,
          refreshData,
          clearAllCache,
          formatTime,
          getResponseSummary
        };
      }
    }).mount('#app');
  </script>
</body>
</html>`;
});
