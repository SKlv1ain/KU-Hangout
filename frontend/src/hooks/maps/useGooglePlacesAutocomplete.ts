import { useRef, useEffect, useState } from "react"
import { useGoogleMaps } from "./useGoogleMaps"
import { formatLocationText, extractCoordinates } from "@/lib/maps/locationUtils"

interface UseGooglePlacesAutocompleteOptions {
  inputRef: React.RefObject<HTMLInputElement | null>
  value: string
  onChange: (value: string) => void
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void
}

/**
 * Custom hook for Google Places Autocomplete
 * Handles initialization and place selection logic
 */
export function useGooglePlacesAutocomplete({
  inputRef,
  value,
  onChange,
  onPlaceSelect,
}: UseGooglePlacesAutocompleteOptions) {
  const { isReady } = useGoogleMaps()
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)

  useEffect(() => {
    if (!isReady || !inputRef.current) {
      return
    }

    // Initialize Autocomplete
    const autocomplete = new google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ["establishment", "geocode"],
        fields: ["formatted_address", "geometry", "name", "place_id"],
      }
    )

    autocompleteRef.current = autocomplete

    // Handle place selection
    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace()

      // Format location text (prefer name, truncate if needed)
      const locationText = formatLocationText(place)
      if (locationText) {
        onChange(locationText)
        onPlaceSelect?.(place)

        // Extract and store coordinates for map display
        const coords = extractCoordinates(place)
        if (coords) {
          setSelectedLocation(coords)
        }
      }
    })

    return () => {
      if (listener) {
        google.maps.event.removeListener(listener)
      }
    }
  }, [isReady, inputRef, onChange, onPlaceSelect])

  return {
    selectedLocation,
    setSelectedLocation,
  }
}

