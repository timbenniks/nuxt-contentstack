import Personalize from '@contentstack/personalize-edge-sdk'
import { toWebRequest, setCookie, defineEventHandler } from 'h3'
import type { PersonalizeSdkOptions } from '../../../utils'

export default defineEventHandler(async (event) => {
  // get options
  const { personalizeSdkOptions }: {
    personalizeSdkOptions: PersonalizeSdkOptions
  } = useRuntimeConfig().public.contentstack

  const { enable, host, projectUid } = personalizeSdkOptions

  if (!enable) {
    return
  }

  // convert H3Event to standard Request
  const request = toWebRequest(event)

  Personalize.setEdgeApiUrl(`https://${host}`)
  // Initialize Personalize with converted Request
  await Personalize.init(projectUid, { request })

  // figure out variants
  const variantParam = Personalize.getVariantParam()

  // create variant aliases that the SDK can understand
  const variantAlias = Personalize.variantParamToVariantAliases(variantParam).join(',')

  // Save variant aliases in request context for later use
  // See ~/plugins/personalize.ts to learn how `variantAlias` is added to
  // the context so the client can also read it.
  event.context.p13n = variantAlias

  // create an empty response so Personalize can add cookies to it
  // so we can remember the user and the Personalize Manifest.
  const response = new Response()
  await Personalize.addStateToResponse(response)

  // Extract the cookies from the fake Request
  const cookies = response.headers.getSetCookie()

  // Loop over the cookies array and parse them
  cookies.forEach((cookie) => {
    const [nameValue, ...options] = cookie.split('; ')
    const [name, value] = nameValue.split('=')

    const cookieOptions: Record<string, string | number> = {}
    options.forEach((option) => {
      const [key, val] = option.split('=')
      cookieOptions[key.toLowerCase()] = key === 'Max-Age' ? Number.parseInt(val) : val
    })

    // add the extracted cookies to the real Response in Nuxt
    setCookie(event, name, value, cookieOptions)
  })
})