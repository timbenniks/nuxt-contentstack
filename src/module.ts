import { defineNuxtModule, addPlugin, addImportsDir, createResolver, useLogger, addServerHandler, addComponent } from '@nuxt/kit'
import { defu } from 'defu'
import chalk from 'chalk'
import { name, version } from '../package.json'
import { getURLsforRegion, type LivePreviewSdkOptions, type DeliverySdkOptions, type PersonalizeSdkOptions } from './runtime/utils'
import type { RegionInput } from '@timbenniks/contentstack-endpoints'

// Simplified, developer-friendly configuration
export interface ModuleOptions {
  // Core Contentstack settings
  apiKey: string
  deliveryToken: string
  environment: string
  region?: RegionInput
  branch?: string
  locale?: string
  host?: string,

  // Live Preview settings (simplified)
  livePreview?: {
    enable?: boolean
    previewToken?: string
    editableTags?: boolean
    editButton?: boolean | {
      enable?: boolean
      position?: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'top-center' | 'bottom-left' | 'bottom-right' | 'bottom-center'
      exclude?: ('insideLivePreviewPortal' | 'outsideLivePreviewPortal')[]
      includeByQueryParameter?: boolean
    }
    mode?: 'builder' | 'preview'
    ssr?: boolean,
    host?: string
  }

  // Personalization settings (simplified)
  personalization?: {
    enable?: boolean
    projectUid?: string
  }

  // General settings
  debug?: boolean
}

const logger = useLogger(name)

// Internal function to convert simplified config to SDK-specific configs
function transformModuleOptions(options: ModuleOptions): {
  deliverySdkOptions: DeliverySdkOptions
  livePreviewSdkOptions: LivePreviewSdkOptions
  personalizeSdkOptions?: PersonalizeSdkOptions
  debug: boolean
} {
  const {
    apiKey,
    deliveryToken,
    environment,
    region = 'us',
    branch = 'main',
    locale = 'en-us',
    livePreview = {},
    personalization = {},
    debug = false,
    host,
  } = options

  // Build Delivery SDK options
  const deliverySdkOptions: DeliverySdkOptions = {
    apiKey,
    deliveryToken,
    environment,
    region,
    branch,
    locale,
    host: host || getURLsforRegion(region).contentDelivery,
    live_preview: {
      enable: livePreview.enable || false,
      host: '', // Will be set automatically based on region
      preview_token: livePreview.previewToken || '',
    }
  }

  // Build Live Preview SDK options
  const editButtonConfig = typeof livePreview.editButton === 'boolean'
    ? { enable: livePreview.editButton, exclude: [], includeByQueryParameter: false, position: 'top' as const }
    : {
      enable: livePreview.editButton?.enable ?? false,
      exclude: livePreview.editButton?.exclude || [],
      includeByQueryParameter: livePreview.editButton?.includeByQueryParameter || false,
      position: livePreview.editButton?.position || 'top'
    }

  const livePreviewSdkOptions: LivePreviewSdkOptions = {
    editableTags: livePreview.editableTags || false,
    ssr: livePreview.ssr || false,
    enable: livePreview.enable || false,
    debug: debug,
    mode: livePreview.mode || 'builder',
    clientUrlParams: {
      host: livePreview.host || getURLsforRegion(region).application,
    },
    editButton: editButtonConfig,
  }

  // Build Personalization SDK options (optional)
  let personalizeSdkOptions: PersonalizeSdkOptions | undefined
  if (personalization.enable && personalization.projectUid) {
    personalizeSdkOptions = {
      enable: true,
      projectUid: personalization.projectUid,
      host: '', // Will be set automatically based on region
    }
  }

  return {
    deliverySdkOptions,
    livePreviewSdkOptions,
    personalizeSdkOptions,
    debug
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: name,
    docs: 'https://github.com/timbenniks/nuxt-contentstack',
    compatibility: {
      nuxt: '>=3.20.1'
    },
  },

  defaults: {
    apiKey: '',
    deliveryToken: '',
    environment: '',
    region: 'us',
    branch: 'main',
    locale: 'en-us',
    livePreview: {
      enable: false,
      previewToken: '',
      editableTags: false,
      editButton: false,
      mode: 'builder',
      ssr: false,
    },
    personalization: {
      enable: false,
      projectUid: '',
    },
    debug: false,
  },

  setup(options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    // Transform simplified config to internal SDK configs
    const transformedOptions = transformModuleOptions(options)
    const { deliverySdkOptions, livePreviewSdkOptions, personalizeSdkOptions, debug } = transformedOptions

    // Add CommonJS packages to transpile to handle ESM import issues
    _nuxt.options.build = _nuxt.options.build || {}
    _nuxt.options.build.transpile = _nuxt.options.build.transpile || []

    // All CommonJS dependencies that might cause issues
    const commonJSDeps = [
      '@contentstack/utils',
      '@contentstack/delivery-sdk',
      '@contentstack/core',
      '@contentstack/live-preview-utils',
      '@contentstack/personalize-edge-sdk',
      'classnames',
      'humps',
      'lodash',
      'qs',
      'lodash-es',
      'lodash.merge',
    ]

    commonJSDeps.forEach((dep) => {
      if (!_nuxt.options.build.transpile.includes(dep)) {
        _nuxt.options.build.transpile.push(dep)
      }
    })

    // Configure Vite to properly handle CommonJS dependencies
    _nuxt.options.vite = _nuxt.options.vite || {}
    _nuxt.options.vite.optimizeDeps = _nuxt.options.vite.optimizeDeps || {}
    _nuxt.options.vite.optimizeDeps.include = _nuxt.options.vite.optimizeDeps.include || []

    commonJSDeps.forEach((dep) => {
      if (!_nuxt.options.vite.optimizeDeps!.include!.includes(dep)) {
        _nuxt.options.vite.optimizeDeps!.include!.push(dep)
      }
    })

    // Force ESM for these packages in SSR
    _nuxt.options.vite.ssr = _nuxt.options.vite.ssr || {}
    if (!_nuxt.options.vite.ssr.noExternal) {
      _nuxt.options.vite.ssr.noExternal = []
    }
    if (_nuxt.options.vite.ssr && Array.isArray(_nuxt.options.vite.ssr.noExternal)) {
      commonJSDeps.forEach((dep) => {
        if (_nuxt.options.vite.ssr && Array.isArray(_nuxt.options.vite.ssr.noExternal)) {
          if (!(_nuxt.options.vite.ssr.noExternal as string[]).includes(dep)) {
            (_nuxt.options.vite.ssr.noExternal as string[]).push(dep)
          }
        }
      })
    }

    // Store the transformed SDK configs in runtime config
    _nuxt.options.runtimeConfig.public.contentstack = defu(_nuxt.options.runtimeConfig.public.contentstack, {
      deliverySdkOptions,
      livePreviewSdkOptions,
      personalizeSdkOptions,
      debug
    })

    // Validation with better error messages
    if (!options.apiKey) {
      logger.error(`Missing required ${chalk.bold('apiKey')} in your Contentstack configuration.`)
    }

    if (!options.environment) {
      logger.error(`Missing required ${chalk.bold('environment')} in your Contentstack configuration.`)
    }

    if (!options.deliveryToken) {
      logger.error(`Missing required ${chalk.bold('deliveryToken')} in your Contentstack configuration.`)
    }

    logger.success(`Contentstack region: ${chalk.bold(options.region || 'us')}`)
    logger.success(`Contentstack branch: ${chalk.bold(options.branch || 'main')}`)

    // Handle live preview setup
    if (options.livePreview?.enable) {
      if (deliverySdkOptions.live_preview) {
        deliverySdkOptions.live_preview.host = getURLsforRegion(options.region).preview
      }
      if (livePreviewSdkOptions.clientUrlParams) {
        livePreviewSdkOptions.clientUrlParams.host = getURLsforRegion(options.region).application
      }

      logger.box(`${chalk.bold('⚡️')} Contentstack Live preview enabled`)

      if (!options.livePreview.previewToken) {
        logger.error(`Live preview is enabled but missing ${chalk.bold('livePreview.previewToken')} in your configuration.`)
      }
    }

    // Handle personalization setup
    if (options.personalization?.enable) {
      if (!options.personalization.projectUid) {
        logger.error(`Personalization is enabled but missing ${chalk.bold('personalization.projectUid')} in your configuration.`)
      } else {
        personalizeSdkOptions!.host = getURLsforRegion(options.region).personalizeEdge
      }
    }

    if (debug) {
      logger.box(`${chalk.bgBlue('DEBUG')} SDK options\n\n${JSON.stringify(transformedOptions, null, 2)}`)
    }

    addPlugin(resolver.resolve('./runtime/contentstack'))
    addImportsDir(resolver.resolve('./runtime/composables'))
    addImportsDir(resolver.resolve('./runtime/providers'))

    // Register components
    addComponent({
      name: 'ContentstackModularBlocks',
      filePath: resolver.resolve('./runtime/components/ContentstackModularBlocks.vue'),
    })

    addComponent({
      name: 'ContentstackFallbackBlock',
      filePath: resolver.resolve('./runtime/components/ContentstackFallbackBlock.vue'),
    })

    if (personalizeSdkOptions?.enable) {
      addServerHandler({
        handler: resolver.resolve('./runtime/server/middleware/personalize'),
        middleware: true,
      })
    }
  },
})
