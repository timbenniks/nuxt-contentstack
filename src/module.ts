import { defineNuxtModule, addPlugin, addImportsDir, createResolver, useLogger } from '@nuxt/kit'
import { Region } from '@contentstack/delivery-sdk'
import type { StackConfig } from '@contentstack/delivery-sdk'
import { defu } from 'defu'
import chalk from 'chalk'
import { name, version } from '../package.json'
import { getURLsforRegion, type LivePreviewSdkOptions } from './utils'

export interface ModuleOptions {
  debug: boolean
  deliverySdkOptions: StackConfig
  livePreviewSdkOptions: LivePreviewSdkOptions
}

const logger = useLogger(name)
const CONFIG_KEY = 'contentstack' as const

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'contentstack',
    version,
    configKey: CONFIG_KEY,
    compatibility: {
      nuxt: '^3.12.0',
      bridge: false,
    },
  },

  defaults: {
    debug: false,
    deliverySdkOptions: {
      apiKey: '',
      deliveryToken: '',
      environment: '',
      region: Region.US,
      branch: 'main',
      locale: 'en-us',
      live_preview: {
        enable: false,
        host: '',
        preview_token: '',
      },
    },
    livePreviewSdkOptions: {
      ssr: false,
      editableTags: false,
      enable: false,
      debug: false,
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
  },

  setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)

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

    if (_options.deliverySdkOptions.live_preview.enable) {
      _options.livePreviewSdkOptions.enable = true
      _options.deliverySdkOptions.live_preview.host = getURLsforRegion(_options.deliverySdkOptions.region).preview
      _options.livePreviewSdkOptions.clientUrlParams.host = getURLsforRegion(_options.deliverySdkOptions.region).app

      logger.box(`${chalk.bold('⚡️')} Contentstack Live preview enabled`)
    }

    if (_options.deliverySdkOptions.live_preview.enable && !_options.deliverySdkOptions.live_preview.preview_token) {
      logger.error(`No Contentstack live preview token. Make sure you specify a ${chalk.bold('preview_token')} in your Contentstack live_preview config.`)
    }

    if (_options.debug) {
      _options.livePreviewSdkOptions.debug = true

      logger.box(`${chalk.bgYellow('DEBUG')} Contentstack options object\n\n${JSON.stringify(_options, null, 2)}`)
    }

    addPlugin(resolver.resolve('./runtime/contentstack'))
    addImportsDir(resolver.resolve('./runtime/composables'))
  },
})
