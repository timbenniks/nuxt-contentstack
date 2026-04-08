import { defineNuxtModule, addPlugin, addImportsDir, createResolver, useLogger, addServerHandler, addComponent } from '@nuxt/kit'
import { defu } from 'defu'
import chalk from 'chalk'
import { name, version } from '../package.json'
import { getURLsforRegion, type LivePreviewSdkOptions, type DeliverySdkOptions, type PersonalizeSdkOptions } from './runtime/utils'
import type { RegionInput } from '@timbenniks/contentstack-endpoints'
import { configureViteForContentstack } from './vite-config'
import { DEFAULT_LOCALE, DEFAULT_BRANCH, DEFAULT_REGION } from './runtime/constants'

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
    region = DEFAULT_REGION,
    branch = DEFAULT_BRANCH,
    locale = DEFAULT_LOCALE,
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
    region: DEFAULT_REGION,
    branch: DEFAULT_BRANCH,
    locale: DEFAULT_LOCALE,
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

    // Auto-register Contentstack image provider if @nuxt/image is installed
    const hasNuxtImage = _nuxt.options.modules?.some((m: any) =>
      m === '@nuxt/image' || (Array.isArray(m) && m[0] === '@nuxt/image'),
    )
    if (hasNuxtImage) {
      const imageOptions = (_nuxt.options as any).image = (_nuxt.options as any).image || {}
      imageOptions.providers = imageOptions.providers || {}
      if (!imageOptions.providers.contentstack) {
        imageOptions.providers.contentstack = {
          provider: resolver.resolve('./runtime/providers/contentstack'),
          options: {},
        }
      }
    }

    // Validate required config before using it
    if (!options.apiKey) {
      logger.error(`Missing required ${chalk.bold('apiKey')} in your Contentstack configuration.`)
    }

    if (!options.environment) {
      logger.error(`Missing required ${chalk.bold('environment')} in your Contentstack configuration.`)
    }

    if (!options.deliveryToken) {
      logger.error(`Missing required ${chalk.bold('deliveryToken')} in your Contentstack configuration.`)
    }

    // Transform simplified config to internal SDK configs
    const transformedOptions = transformModuleOptions(options)
    const { deliverySdkOptions, livePreviewSdkOptions, personalizeSdkOptions, debug } = transformedOptions

    // Configure Vite to pre-bundle CJS dependencies for browser compatibility
    configureViteForContentstack(_nuxt)

    // Store the transformed SDK configs in runtime config
    _nuxt.options.runtimeConfig.public.contentstack = defu(_nuxt.options.runtimeConfig.public.contentstack, {
      deliverySdkOptions,
      livePreviewSdkOptions,
      personalizeSdkOptions,
      debug
    })

    logger.success(`Contentstack region: ${chalk.bold(options.region || DEFAULT_REGION)}`)
    logger.success(`Contentstack branch: ${chalk.bold(options.branch || DEFAULT_BRANCH)}`)

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
