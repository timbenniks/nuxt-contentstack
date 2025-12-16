/**
 * Contentstack error types
 */
export type ContentstackErrorCode =
  | 'NETWORK_ERROR'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN'

/**
 * Standardized Contentstack error structure
 */
export interface ContentstackError {
  code: ContentstackErrorCode
  message: string
  originalError?: unknown
  context?: string
}

/**
 * Determine error code from error object
 */
function getErrorCode(error: unknown): ContentstackErrorCode {
  if (error && typeof error === 'object') {
    const err = error as any
    
    // Network errors
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.message?.includes('fetch')) {
      return 'NETWORK_ERROR'
    }
    
    // Not found errors (common in Contentstack API)
    if (err.status === 404 || err.message?.includes('not found') || err.message?.includes('404')) {
      return 'NOT_FOUND'
    }
    
    // Validation errors
    if (err.status === 400 || err.status === 422 || err.message?.includes('validation')) {
      return 'VALIDATION_ERROR'
    }
  }
  
  return 'UNKNOWN'
}

/**
 * Extract error message from error object
 */
function getErrorMessage(error: unknown, context: string): string {
  if (error && typeof error === 'object') {
    const err = error as any
    return err.message || err.error || `Error in ${context}`
  }
  
  if (typeof error === 'string') {
    return error
  }
  
  return `Unknown error in ${context}`
}

/**
 * Handle and standardize Contentstack errors
 */
export function handleContentstackError(
  error: unknown,
  context: string
): ContentstackError {
  return {
    code: getErrorCode(error),
    message: getErrorMessage(error, context),
    originalError: error,
    context,
  }
}

/**
 * Log Contentstack error with consistent formatting
 */
export function logContentstackError(
  error: ContentstackError,
  context?: string
): void {
  const contextMsg = context || error.context || 'Contentstack'
  console.error(`[${contextMsg}] ${error.code}: ${error.message}`)
  
  if (error.originalError && process.env.NODE_ENV === 'development') {
    console.error('Original error:', error.originalError)
  }
}

