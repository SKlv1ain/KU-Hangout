/**
 * Generate Google Maps URL for opening in new tab
 * Uses coordinates if available, otherwise falls back to location text search
 */
export function generateGoogleMapsUrl(
  location: string,
  lat?: number | null,
  lng?: number | null
): string | null {
  if (lat && lng) {
    // Use coordinates for precise location
    return `https://www.google.com/maps?q=${lat},${lng}`
  }

  if (location) {
    // Fallback to location text search
    const encodedLocation = encodeURIComponent(location)
    return `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`
  }

  return null
}

/**
 * Generate Google Maps Static API URL for displaying map image
 * Shows a red marker at the location
 */
export function generateStaticMapUrl(
  apiKey: string,
  location: string,
  lat?: number | null,
  lng?: number | null,
  options?: {
    width?: number
    height?: number
    zoom?: number
  }
): string | null {
  if (!apiKey) return null

  const width = options?.width || 600
  const height = options?.height || 200
  const zoom = options?.zoom || 15

  if (lat && lng) {
    // Use coordinates with marker
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${lat},${lng}&key=${apiKey}`
  }

  if (location) {
    // Use location text with marker
    const encodedLocation = encodeURIComponent(location)
    return `https://maps.googleapis.com/maps/api/staticmap?center=${encodedLocation}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${encodedLocation}&key=${apiKey}`
  }

  return null
}

/**
 * Default map options for Google Maps
 */
export const DEFAULT_MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  clickableIcons: false,
}

/**
 * Default map container style
 */
export const DEFAULT_MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "100%",
} as const

