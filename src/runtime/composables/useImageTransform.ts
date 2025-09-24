import { ref, computed, readonly } from 'vue'

export interface ImageTransformOptions {
  auto?: 'webp' | 'webp,compress'
  quality?: number
  format?: 'webp' | 'png' | 'jpg' | 'jpeg' | 'gif' | 'auto'
  width?: number
  height?: number
  fit?: 'bounds' | 'crop'
  crop?: string
  trim?: number | number[]
  orient?: 'default' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'
  dpr?: number
  disable?: 'upscale'
  overlay?: {
    relativeURL: string
    align?: 'top' | 'bottom' | 'left' | 'right' | 'middle' | 'center'
    repeat?: 'x' | 'y' | 'both'
    width?: string | number
    height?: string | number
    pad?: number
  }
  pad?: number | number[]
  bg?: string
  blur?: number
  saturation?: number
  brightness?: number
  contrast?: number
  sharpen?: {
    amount: number
    radius: number
    threshold: number
  }
  frame?: number
  resizeFilter?: 'nearest' | 'bilinear' | 'bicubic' | 'lanczos2' | 'lanczos3'
}

/**
 * Composable for transforming Contentstack images using the Image Delivery API
 * Based on the Contentstack Image Transform functionality
 */
export const useImageTransform = (baseUrl: string, options: ImageTransformOptions = {}) => {
  const transformOptions = ref<ImageTransformOptions>(options)

  const transformedUrl = computed(() => {
    if (!baseUrl) return ''

    const params = new URLSearchParams()

    // Auto optimization
    if (transformOptions.value.auto) {
      params.append('auto', transformOptions.value.auto)
    }

    // Quality
    if (transformOptions.value.quality) {
      params.append('quality', transformOptions.value.quality.toString())
    }

    // Format
    if (transformOptions.value.format) {
      params.append('format', transformOptions.value.format)
    }

    // Dimensions
    if (transformOptions.value.width) {
      params.append('width', transformOptions.value.width.toString())
    }
    if (transformOptions.value.height) {
      params.append('height', transformOptions.value.height.toString())
    }

    // Fit
    if (transformOptions.value.fit) {
      params.append('fit', transformOptions.value.fit)
    }

    // Crop
    if (transformOptions.value.crop) {
      params.append('crop', transformOptions.value.crop)
    }

    // Trim
    if (transformOptions.value.trim) {
      if (Array.isArray(transformOptions.value.trim)) {
        params.append('trim', transformOptions.value.trim.join(','))
      }
      else {
        params.append('trim', transformOptions.value.trim.toString())
      }
    }

    // Orientation
    if (transformOptions.value.orient) {
      params.append('orient', transformOptions.value.orient)
    }

    // Device Pixel Ratio
    if (transformOptions.value.dpr) {
      params.append('dpr', transformOptions.value.dpr.toString())
    }

    // Disable upscale
    if (transformOptions.value.disable) {
      params.append('disable', transformOptions.value.disable)
    }

    // Overlay
    if (transformOptions.value.overlay) {
      const overlay = transformOptions.value.overlay
      params.append('overlay', overlay.relativeURL)
      if (overlay.align) params.append('overlay-align', overlay.align)
      if (overlay.repeat) params.append('overlay-repeat', overlay.repeat)
      if (overlay.width) params.append('overlay-width', overlay.width.toString())
      if (overlay.height) params.append('overlay-height', overlay.height.toString())
      if (overlay.pad) params.append('overlay-pad', overlay.pad.toString())
    }

    // Padding
    if (transformOptions.value.pad) {
      if (Array.isArray(transformOptions.value.pad)) {
        params.append('pad', transformOptions.value.pad.join(','))
      }
      else {
        params.append('pad', transformOptions.value.pad.toString())
      }
    }

    // Background color
    if (transformOptions.value.bg) {
      params.append('bg-color', transformOptions.value.bg)
    }

    // Blur
    if (transformOptions.value.blur) {
      params.append('blur', transformOptions.value.blur.toString())
    }

    // Saturation
    if (transformOptions.value.saturation) {
      params.append('saturation', transformOptions.value.saturation.toString())
    }

    // Brightness
    if (transformOptions.value.brightness) {
      params.append('brightness', transformOptions.value.brightness.toString())
    }

    // Contrast
    if (transformOptions.value.contrast) {
      params.append('contrast', transformOptions.value.contrast.toString())
    }

    // Sharpen
    if (transformOptions.value.sharpen) {
      const { amount, radius, threshold } = transformOptions.value.sharpen
      params.append('sharpen', `${amount},${radius},${threshold}`)
    }

    // Frame (for animated images)
    if (transformOptions.value.frame) {
      params.append('frame', transformOptions.value.frame.toString())
    }

    // Resize filter
    if (transformOptions.value.resizeFilter) {
      params.append('resize-filter', transformOptions.value.resizeFilter)
    }

    const queryString = params.toString()
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
  })

  const updateTransform = (newOptions: Partial<ImageTransformOptions>) => {
    transformOptions.value = { ...transformOptions.value, ...newOptions }
  }

  const resetTransform = () => {
    transformOptions.value = {}
  }

  return {
    transformedUrl,
    transformOptions: readonly(transformOptions),
    updateTransform,
    resetTransform,
  }
}
