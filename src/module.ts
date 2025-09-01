import { defineNuxtModule, addPlugin, addImportsDir, createResolver, useLogger, addServerHandler } from '@nuxt/kit'
import { defu } from 'defu'
import chalk from 'chalk'
import { name, version } from '../package.json'
import { getURLsforRegion, type LivePreviewSdkOptions, type DeliverySdkOptions, type PersonalizeSdkOptions } from './runtime/utils'

export interface ModuleOptions {
  debug: boolean
  deliverySdkOptions: DeliverySdkOptions
  livePreviewSdkOptions: LivePreviewSdkOptions
  personalizeSdkOptions: PersonalizeSdkOptions
}

const logger = useLogger(name)
const CONFIG_KEY = 'nuxt-contentstack' as const

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'contentstack',
    version,
    configKey: CONFIG_KEY,
    compatibility: {
      nuxt: '^4',
    },
  },

  defaults: {
    debug: false,
    deliverySdkOptions: {
      apiKey: '',
      deliveryToken: '',
      environment: '',
      region: 'eu',
      branch: 'main',
      locale: 'en-us',
      live_preview: {
        enable: false,
        host: '',
        preview_token: '',
      },
    },
    livePreviewSdkOptions: {
      editableTags: false,
      ssr: false,
      enable: false,
      debug: false,
      mode: 'preview',
      clientUrlParams: {
        host: '',
      },
      editButton: {
        enable: false,
        exclude: [],
        includeByQueryParameter: false,
        position: 'top',
      },
    },
    personalizeSdkOptions: {
      enable: false,
      projectUid: '',
      host: '',
    },
  },

  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

    // Add CommonJS packages to transpile to handle ESM import issues
    _nuxt.options.build = _nuxt.options.build || {}
    _nuxt.options.build.transpile = _nuxt.options.build.transpile || []

    // All CommonJS dependencies that might cause issues
    const commonJSDeps = [
      '@contentstack/core',
      '@contentstack/utils',
      '@contentstack/delivery-sdk',
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

    _nuxt.options.runtimeConfig.public.contentstack = defu(_nuxt.options.runtimeConfig.public.contentstack, _options)

    if (!_options.deliverySdkOptions.apiKey) {
      logger.error(`No Contentstack apiKey. Make sure you specify an ${chalk.bold('apiKey')} in your Contentstack config.`)
    }

    if (!_options.deliverySdkOptions.environment) {
      logger.error(`No Contentstack environment. Make sure you specify a ${chalk.bold('environment')} in your Contentstack config.`)
    }

    if (!_options.deliverySdkOptions.deliveryToken) {
      logger.error(`No Contentstack apiKey. Make sure you specify a ${chalk.bold('deliveryToken')} in your Contentstack config.`)
    }

    logger.success(`Contentstack region: ${chalk.bold(_options.deliverySdkOptions.region)}`)
    logger.success(`Contentstack branch: ${chalk.bold(_options.deliverySdkOptions.branch)}`)

    if (_options.deliverySdkOptions?.live_preview?.enable) {
      _options.livePreviewSdkOptions.enable = true
      _options.deliverySdkOptions.live_preview.host = getURLsforRegion(_options.deliverySdkOptions.region).preview

      if (_options.livePreviewSdkOptions.clientUrlParams) {
        _options.livePreviewSdkOptions.clientUrlParams.host = getURLsforRegion(_options.deliverySdkOptions.region).application
      }

      logger.box(`${chalk.bold('⚡️')} Contentstack Live preview enabled`)
    }

    if (_options.deliverySdkOptions?.live_preview?.enable && !_options.deliverySdkOptions.live_preview.preview_token) {
      logger.error(`No Contentstack live preview token. Make sure you specify a ${chalk.bold('preview_token')} in your Contentstack live_preview config.`)
    }

    if (_options.personalizeSdkOptions.enable) {
      _options.personalizeSdkOptions.host = getURLsforRegion(_options.deliverySdkOptions.region).personalizeEdge
    }


    if (_options.debug) {
      _options.livePreviewSdkOptions.debug = true

      logger.box(`${chalk.bgYellow('DEBUG')} Contentstack options object\n\n${JSON.stringify(_options, null, 2)}`)
    }

    addPlugin(resolver.resolve('./runtime/contentstack'))
    addImportsDir(resolver.resolve('./runtime/composables'))

    if (_options.personalizeSdkOptions.enable) {
      addServerHandler({
        handler: resolver.resolve('./runtime/server/middleware/personalize'),
        middleware: true,
      })
    }
  }
})
