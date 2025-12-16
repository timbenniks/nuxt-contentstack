export default defineNuxtConfig({
  modules: [
    '../../../src/module',
  ],
  'nuxt-contentstack': {
    // Minimal config for testing - these are required but won't be used
    apiKey: 'test-api-key',
    deliveryToken: 'test-delivery-token',
    environment: 'test-environment',
  },
})
