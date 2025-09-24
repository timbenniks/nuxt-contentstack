import { defineEventHandler, readBody, createError } from "h3";
import {
  addDevToolsEntry,
  addDevToolsQuery,
  updateDevToolsQuery,
  addDevToolsCacheEntry,
  updateLivePreviewStatus
} from './server';

export default defineEventHandler(async (event) => {
  const url = event.node.req.url || '';

  try {
    // Only allow POST requests for tracking
    if (event.node.req.method !== 'POST') {
      throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
    }

    const body = await readBody(event);

    // Track entry fetch
    if (url.includes('/track/entry')) {
      addDevToolsEntry(body);
      return { success: true, message: 'Entry tracked' };
    }

    // Track API query
    if (url.includes('/track/query/update')) {
      updateDevToolsQuery(body.id, body);
      return { success: true, message: 'Query updated' };
    }

    if (url.includes('/track/query')) {
      addDevToolsQuery(body);
      return { success: true, message: 'Query tracked' };
    }

    // Track cache operation
    if (url.includes('/track/cache')) {
      addDevToolsCacheEntry(body);
      return { success: true, message: 'Cache entry tracked' };
    }

    // Track live preview event
    if (url.includes('/track/preview')) {
      updateLivePreviewStatus(body);
      return { success: true, message: 'Live preview event tracked' };
    }

    throw createError({ statusCode: 404, statusMessage: 'Tracking endpoint not found' });

  } catch (error) {
    console.error('DevTools tracking error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown tracking error'
    });
  }
});
