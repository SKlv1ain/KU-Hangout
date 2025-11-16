"use client"

import { useRef } from "react"
import { SearchIcon } from "lucide-react"
import { Label } from "@/components/ui/label"
import { LocationMap } from "@/components/maps/LocationMap"
import { useGoogleMaps } from "@/hooks/maps/useGoogleMaps"
import { useGooglePlacesAutocomplete } from "@/hooks/maps/useGooglePlacesAutocomplete"
import { DEFAULT_MAP_OPTIONS } from "@/lib/maps/mapUtils"
import { cn } from "@/lib/utils"

interface GooglePlacesAutocompleteProps {
  id?: string
  value: string
  onChange: (value: string) => void
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void
  placeholder?: string
  error?: string
  className?: string
  label?: string
  required?: boolean
}

export function GooglePlacesAutocomplete({
  id,
  value,
  onChange,
  onPlaceSelect,
  placeholder = "Enter location",
  error,
  className,
  label,
  required = false,
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { apiKey, isReady, loadError } = useGoogleMaps()

  const { selectedLocation, setSelectedLocation } = useGooglePlacesAutocomplete({
    inputRef,
    value,
    onChange,
    onPlaceSelect,
  })

  // Fallback to regular input if script not loaded or error
  if (!isReady || loadError) {
    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={id}>
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
        )}
        <div
          className={cn(
            "flex h-9 items-center gap-2 border-b px-3 flex-shrink-0",
            error && "border-destructive",
            className
          )}
        >
          <SearchIcon className="size-4 shrink-0 opacity-50" />
          <input
            id={id}
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
              error && "border-destructive"
            )}
          />
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        {(!apiKey || apiKey === "" || loadError) && (
          <p className="text-xs text-muted-foreground">
            {!apiKey || apiKey === ""
              ? "Google Maps API key not configured. Please add REACT_APP_GOOGLE_MAPS_API_KEY or VITE_GOOGLE_MAPS_API_KEY to your .env file. Using manual input."
              : "Google Maps failed to load. Using manual input."}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div
        className={cn(
          "flex h-9 items-center gap-2 border-b px-3 flex-shrink-0",
          error && "border-destructive",
          className
        )}
      >
        <SearchIcon className="size-4 shrink-0 opacity-50" />
        <input
          id={id}
          ref={inputRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value)
            // Clear map when user clears the input
            if (!e.target.value.trim()) {
              setSelectedLocation(null)
            }
          }}
          placeholder={placeholder}
          className={cn(
            "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50"
          )}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {selectedLocation && (
        <LocationMap
          location={value}
          lat={selectedLocation.lat}
          lng={selectedLocation.lng}
          height="200px"
          mapOptions={{
            ...DEFAULT_MAP_OPTIONS,
            zoomControl: true,
          }}
          showClickIndicator={false}
        />
      )}
    </div>
  )
}

