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

// Cache the DevTools enabled state to avoid repeated checks
let _devToolsEnabled: boolean | null = null;

// Global flag to check if we're in development with DevTools enabled
export const isDevToolsEnabled = () => {
  // Return cached result if already computed
  if (_devToolsEnabled !== null) return _devToolsEnabled;

  // Only run in development
  if (!import.meta.dev) {
    _devToolsEnabled = false;
    return false;
  }

  // Server-side: Check if process.env indicates DevTools is enabled
  if (typeof window === 'undefined') {
    // Only enable server-side tracking if we're explicitly in dev mode with DevTools
    _devToolsEnabled = import.meta.dev && process.env.NODE_ENV === 'development';
    return _devToolsEnabled;
  }

  // Client-side: Check if Nuxt DevTools is actually available/enabled
  try {
    // Check for DevTools global or any indication that DevTools is active
    const hasDevTools = typeof window.__NUXT_DEVTOOLS__ !== 'undefined' ||
      window.location.search.includes('devtools') ||
      sessionStorage.getItem('nuxt:devtools:enabled') === 'true';

    _devToolsEnabled = hasDevTools;
    return _devToolsEnabled;
  } catch {
    // If any error occurs (e.g., sessionStorage not available), disable DevTools tracking
    _devToolsEnabled = false;
    return false;
  }
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
  // Early return with minimal overhead if DevTools is disabled
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

  // Schedule tracking to not block main execution
  const scheduleTracking = () => {
    try {
      const fetchFn = typeof globalThis.fetch !== 'undefined' ? globalThis.fetch :
        typeof window !== 'undefined' && window.fetch ? window.fetch : null;

      if (fetchFn) {
        fetchFn('http://localhost:3000/__nuxt_devtools__/contentstack/track/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fullQuery)
        }).catch(() => {
          // Silently fail to avoid any impact on production builds
        });
      }
    } catch {
      // Silently fail to avoid any impact on user experience
    }
  };

  // Use non-blocking scheduling
  if (typeof window !== 'undefined' && window.requestIdleCallback) {
    window.requestIdleCallback(scheduleTracking);
  } else if (typeof setTimeout !== 'undefined') {
    setTimeout(scheduleTracking, 0);
  } else {
    // Fallback for environments without setTimeout (rare)
    scheduleTracking();
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
