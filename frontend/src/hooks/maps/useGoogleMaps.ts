import { useLoadScript } from "@react-google-maps/api"

const GOOGLE_MAPS_LIBRARIES: ("places")[] = ["places"]

/**
 * Get Google Maps API key from environment variables
 * Supports both VITE_ and REACT_APP_ prefixes for compatibility
 */
export function getGoogleMapsApiKey(): string {
  return (
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY ||
    ""
  )
}

/**
 * Custom hook for loading Google Maps script
 * @returns Object containing isLoaded, loadError, and apiKey
 */
export function useGoogleMaps() {
  const apiKey = getGoogleMapsApiKey()

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  })

  return {
    apiKey,
    isLoaded,
    loadError,
    isReady: isLoaded && !loadError && apiKey !== "",
  }
}

