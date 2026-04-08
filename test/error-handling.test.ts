import { describe, it, expect, vi } from 'vitest'
import { handleContentstackError, logContentstackError } from '../src/runtime/composables/error-handling'

describe('Error Handling', () => {
  describe('handleContentstackError', () => {
    it('should classify network errors', () => {
      const error = { code: 'ECONNREFUSED', message: 'Connection refused' }
      const result = handleContentstackError(error, 'test')

      expect(result.code).toBe('NETWORK_ERROR')
      expect(result.context).toBe('test')
      expect(result.originalError).toBe(error)
    })

    it('should classify timeout errors', () => {
      const error = { code: 'ETIMEDOUT' }
      const result = handleContentstackError(error, 'test')

      expect(result.code).toBe('NETWORK_ERROR')
    })

    it('should classify 404 errors', () => {
      const error = { status: 404, message: 'Not found' }
      const result = handleContentstackError(error, 'test')

      expect(result.code).toBe('NOT_FOUND')
    })

    it('should classify validation errors (400)', () => {
      const error = { status: 400, message: 'Bad request' }
      const result = handleContentstackError(error, 'test')

      expect(result.code).toBe('VALIDATION_ERROR')
    })

    it('should classify validation errors (422)', () => {
      const error = { status: 422, message: 'Unprocessable' }
      const result = handleContentstackError(error, 'test')

      expect(result.code).toBe('VALIDATION_ERROR')
    })

    it('should default to UNKNOWN for unrecognized errors', () => {
      const error = { something: 'unexpected' }
      const result = handleContentstackError(error, 'test')

      expect(result.code).toBe('UNKNOWN')
    })

    it('should handle string errors', () => {
      const result = handleContentstackError('something went wrong', 'test')

      expect(result.code).toBe('UNKNOWN')
      expect(result.message).toBe('something went wrong')
    })

    it('should handle null/undefined errors', () => {
      const result = handleContentstackError(null, 'test')

      expect(result.code).toBe('UNKNOWN')
      expect(result.message).toBe('Unknown error in test')
    })
  })

  describe('logContentstackError', () => {
    it('should log error with context', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const error = handleContentstackError({ status: 404 }, 'useGetEntry')
      logContentstackError(error)

      expect(spy).toHaveBeenCalledWith(expect.stringContaining('useGetEntry'))
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('NOT_FOUND'))

      spy.mockRestore()
    })
  })
})
