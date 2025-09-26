import { defineEventHandler, getQuery, createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import { getURLsforRegion, type Region } from '../../../utils'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const {
      url,
      contentType,
      locale = 'en-us',
      includeReferences = '',
      includeFallback = 'true',
    } = query as {
      url: string
      contentType: string
      locale: string
      includeReferences: string
      includeFallback: string
    }

    // Validate required parameters
    if (!url || !contentType) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required parameters: url and contentType'
      })
    }

    // Get Contentstack configuration from runtime config
    const { deliverySdkOptions } = useRuntimeConfig().public.contentstack

    if (!deliverySdkOptions?.apiKey || !deliverySdkOptions?.deliveryToken) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Contentstack configuration missing'
      })
    }

    // Build Contentstack REST API URL using the existing utility function
    const { apiKey, deliveryToken, environment, region: regionString = 'us' } = deliverySdkOptions
    const endpoints = getURLsforRegion(regionString as Region)
    const baseUrl = `https://${endpoints.contentDelivery}/v3/content_types/${contentType}/entries`

    // Build query parameters
    const queryParams = new URLSearchParams({
      environment,
      locale,
      include_fallback: includeFallback,
      'query': JSON.stringify({ url })
    })

    // Add include references if specified
    if (includeReferences) {
      includeReferences.split(',')
        .map(ref => ref.trim())
        .filter(Boolean)
        .forEach(ref => queryParams.append('include[]', ref))
    }

    // Build final URL
    const apiUrl = `${baseUrl}?${queryParams.toString()}`

    // Make the HTTP request
    const response = await fetch(apiUrl, {
      headers: {
        'api_key': apiKey,
        'access_token': deliveryToken,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `Contentstack API error: ${response.statusText}`
      })
    }

    const data = await response.json()

    if (!data || !data.entries || data.entries.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: `No ${contentType} entry found for URL: ${url}`
      })
    }

    const entry = data.entries[0]

    return {
      success: true,
      data: entry,
      meta: {
        contentType,
        url,
        locale,
        uid: entry.uid,
        title: entry.title || 'Untitled',
        fetchedAt: new Date().toISOString(),
      }
    }

  } catch (error) {
    console.error('Auto-fetch API error:', error)

    // If it's already an HTTP error, re-throw it
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // Create a generic error
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch content',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
