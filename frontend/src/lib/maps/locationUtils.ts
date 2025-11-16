/**
 * Format location text from Google Places API result
 * Prefers name over formatted_address (usually shorter)
 * Truncates to maxLength if needed (default: 100 for backend limit)
 */
export function formatLocationText(
  place: google.maps.places.PlaceResult,
  maxLength: number = 100
): string {
  // Prefer name over formatted_address (usually shorter)
  if (place.name && place.name.length <= maxLength) {
    return place.name
  }

  // Use formatted_address but truncate if needed
  if (place.formatted_address) {
    return place.formatted_address.length > maxLength
      ? place.formatted_address.substring(0, maxLength)
      : place.formatted_address
  }

  return ""
}

/**
 * Extract coordinates from Google Places API result
 */
export function extractCoordinates(
  place: google.maps.places.PlaceResult
): { lat: number; lng: number } | null {
  if (place.geometry?.location) {
    return {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    }
  }
  return null
}

