// DevTools integration utilities
// These functions are used by composables to track data for DevTools

interface DevToolsEntry {
  uid: string;
  content_type_uid?: string;
  title?: string;
  locale?: string;
  status?: string;
  _version?: number;
  [key: string]: any;
}

interface DevToolsQuery {
  id: string | number;
  composable: string;
  method: string;
  url: string;
  params: any;
  status: 'pending' | 'success' | 'error';
  duration?: number;
  response?: any;
  error?: string;
  startTime: number;
}

interface DevToolsCacheEntry {
  key: string;
  type: 'entry' | 'asset' | 'query';
  data: any;
  ttl?: number;
}

// Global flag to check if we're in development with DevTools enabled
export const isDevToolsEnabled = () => {
  return process.dev;
};

// Track entry fetches for DevTools
export async function trackDevToolsEntry(entry: DevToolsEntry) {
  if (!isDevToolsEnabled()) return;

  try {
    // Use globalThis.fetch for universal compatibility (server + client)
    const fetchFn = typeof globalThis.fetch !== 'undefined' ? globalThis.fetch :
      typeof window !== 'undefined' && window.fetch ? window.fetch : null;

    if (!fetchFn) {
      console.debug('DevTools: fetch not available, skipping entry tracking');
      return;
    }

    // Send to DevTools backend
    await fetchFn('http://localhost:3000/__nuxt_devtools__/contentstack/track/entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    }).catch(err => {
      console.debug('DevTools entry tracking failed:', err);
    });
  } catch (error) {
    console.debug('DevTools entry tracking error:', error);
  }
}

// Track API queries for DevTools
export function trackDevToolsQuery(query: Partial<DevToolsQuery>): string | number {
  if (!isDevToolsEnabled()) return '';

  const queryId = query.id || Date.now() + Math.random();
  const fullQuery: DevToolsQuery = {
    id: queryId,
    composable: query.composable || 'unknown',
    method: query.method || 'GET',
    url: query.url || '',
    params: query.params || {},
    status: 'pending',
    startTime: Date.now(),
    ...query
  };

  try {
    // Use universal fetch
    const fetchFn = typeof globalThis.fetch !== 'undefined' ? globalThis.fetch :
      typeof window !== 'undefined' && window.fetch ? window.fetch : null;

    if (fetchFn) {
      fetchFn('http://localhost:3000/__nuxt_devtools__/contentstack/track/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullQuery)
      }).catch(err => {
        console.debug('DevTools query tracking failed:', err);
      });
    }
  } catch (error) {
    console.debug('DevTools query tracking error:', error);
  }

  return queryId;
}

// Update query status and results
export function updateDevToolsQuery(queryId: string | number, updates: Partial<DevToolsQuery>) {
  if (!isDevToolsEnabled() || !queryId) return;

  const updateData = {
    id: queryId,
    ...updates,
    duration: updates.duration || (Date.now() - (updates.startTime || Date.now()))
  };

  try {
    // Use universal fetch
    const fetchFn = typeof globalThis.fetch !== 'undefined' ? globalThis.fetch :
      typeof window !== 'undefined' && window.fetch ? window.fetch : null;

    if (fetchFn) {
      fetchFn('http://localhost:3000/__nuxt_devtools__/contentstack/track/query/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      }).catch(err => {
        console.debug('DevTools query update failed:', err);
      });
    }
  } catch (error) {
    console.debug('DevTools query update error:', error);
  }
}

// Track cache operations for DevTools
export function trackDevToolsCache(entry: DevToolsCacheEntry) {
  if (!isDevToolsEnabled()) return;

  try {
    // Send to DevTools backend
    fetch('/__nuxt_devtools__/contentstack/track/cache', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    }).catch(err => {
      console.debug('DevTools cache tracking failed:', err);
    });
  } catch (error) {
    console.debug('DevTools cache tracking error:', error);
  }
}

// Track live preview events for DevTools
export function trackDevToolsLivePreview(event: any) {
  if (!isDevToolsEnabled()) return;

  try {
    // Use universal fetch
    const fetchFn = typeof globalThis.fetch !== 'undefined' ? globalThis.fetch :
      typeof window !== 'undefined' && window.fetch ? window.fetch : null;

    if (fetchFn) {
      fetchFn('http://localhost:3000/__nuxt_devtools__/contentstack/track/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }).catch(err => {
        console.debug('DevTools live preview tracking failed:', err);
      });
    }
  } catch (error) {
    console.debug('DevTools live preview tracking error:', error);
  }
}

// Helper to create a standardized query object
export function createDevToolsQuery(options: {
  composable: string;
  params: any;
  url?: string;
  method?: string;
}): { queryId: string | number; startTime: number } {
  const startTime = Date.now();
  const queryId = trackDevToolsQuery({
    composable: options.composable,
    method: options.method || 'GET',
    url: options.url || '',
    params: options.params,
    status: 'pending',
    startTime
  });

  return { queryId, startTime };
}

// Helper to complete a query tracking
export function completeDevToolsQuery(
  queryId: string | number,
  result: any,
  error?: string
) {
  updateDevToolsQuery(queryId, {
    status: error ? 'error' : 'success',
    response: result,
    error,
  });
}

// Debug helpers for DevTools development
export const devToolsDebug = {
  log: (message: string, data?: any) => {
    if (isDevToolsEnabled()) {
      console.log(`[DevTools] ${message}`, data);
    }
  },

  error: (message: string, error?: any) => {
    if (isDevToolsEnabled()) {
      console.error(`[DevTools] ${message}`, error);
    }
  },

  info: (message: string, data?: any) => {
    if (isDevToolsEnabled()) {
      console.info(`[DevTools] ${message}`, data);
    }
  }
};
