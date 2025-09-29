import { joinURL } from "ufo";
import type { ProviderGetImage } from '@nuxt/image'

// Create a simple URL builder that works without @nuxt/image dependencies
function buildParams(modifiers: Record<string, any>): string {
  const params = new URLSearchParams();

  // Map common @nuxt/image properties to Contentstack parameters
  const keyMapping: Record<string, string> = {
    width: "width",
    height: "height",
    quality: "quality",
    format: "format",
    auto: "auto",
    blur: "blur",
    brightness: "brightness",
    contrast: "contrast",
    saturation: "saturation",
    dpr: "dpr",
  };

  // Map fit values
  const fitMapping: Record<string, string> = {
    fill: "crop",
    inside: "crop",
    outside: "crop",
    cover: "bounds",
    contain: "bounds",
  };

  Object.entries(modifiers).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      const mappedKey = keyMapping[key] || key;
      let mappedValue = value;

      if (key === 'fit' && fitMapping[value]) {
        mappedValue = fitMapping[value];
        params.append('resize', mappedValue);
      } else {
        params.append(mappedKey, String(mappedValue));
      }
    }
  });

  return params.toString();
}

const getImage: ProviderGetImage = (
  src: string,
  { modifiers = {}, baseURL = "/" } = {}
) => {
  // Ensure src is a string
  if (typeof src !== 'string') {
    console.error('Contentstack provider: src must be a string, received:', typeof src, src);
    return { url: '' };
  }

  // Ensure baseURL is a string
  if (typeof baseURL !== 'string') {
    console.warn('Contentstack provider: baseURL must be a string, received:', typeof baseURL, baseURL);
    baseURL = '/';
  }

  // Handle asset-specific modifiers
  const { assetuid, versionuid, ...imageModifiers } = modifiers;

  // Add automatic optimization defaults
  const enhancedModifiers = {
    auto: "webp,compress",
    quality: 80,
    ...imageModifiers, // User modifiers override defaults
  };

  const operations = buildParams(enhancedModifiers);

  // Build URL - src is already the full Contentstack URL
  let url = src;

  // If src is not a full URL, prepend baseURL
  if (!src.startsWith('http://') && !src.startsWith('https://')) {
    // Ensure both parameters are strings before joining
    if (typeof baseURL === 'string' && typeof src === 'string') {
      url = joinURL(baseURL, src);
    } else {
      console.warn('Contentstack provider: Invalid baseURL or src for joinURL', { baseURL, src });
      url = src; // fallback to original src
    }
  }

  return {
    url: url + (operations ? "?" + operations : ""),
  };
};

// Default export is required for @nuxt/image providers in Nuxt 4
export default getImage

// Also export named for backwards compatibility
export { getImage }
