"use client"

import { GoogleMap, Marker } from "@react-google-maps/api"
import { MapPin, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { useGoogleMaps } from "@/hooks/maps/useGoogleMaps"
import {
  generateGoogleMapsUrl,
  generateStaticMapUrl,
  DEFAULT_MAP_OPTIONS,
  DEFAULT_MAP_CONTAINER_STYLE,
} from "@/lib/maps/mapUtils"

interface LocationMapProps {
  location: string
  lat?: number | null
  lng?: number | null
  height?: string | number
  className?: string
  showClickIndicator?: boolean
  mapOptions?: google.maps.MapOptions
}

/**
 * Reusable component for displaying a location on a map
 * Supports interactive map, static map fallback, and clickable to open Google Maps
 */
export function LocationMap({
  location,
  lat,
  lng,
  height = "200px",
  className,
  showClickIndicator = true,
  mapOptions = DEFAULT_MAP_OPTIONS,
}: LocationMapProps) {
  const { apiKey, isReady } = useGoogleMaps()

  const hasLocation = (lat && lng) || location
  const mapCenter = lat && lng ? { lat, lng } : null

  const handleMapClick = () => {
    const url = generateGoogleMapsUrl(location, lat, lng)
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer")
    }
  }

  if (!hasLocation) return null

  const staticMapUrl = generateStaticMapUrl(apiKey, location, lat, lng, {
    height: typeof height === "number" ? height : parseInt(height),
  })

  return (
    <div
      onClick={handleMapClick}
      className={cn(
        "relative rounded-md overflow-hidden border border-border cursor-pointer",
        "hover:border-primary transition-colors group",
        className
      )}
      style={{ height }}
    >
      {/* Try interactive map first if we have coordinates and API ready */}
      {mapCenter && isReady ? (
        <GoogleMap
          mapContainerStyle={DEFAULT_MAP_CONTAINER_STYLE}
          center={mapCenter}
          zoom={15}
          options={mapOptions}
          onClick={handleMapClick}
        >
          <Marker position={mapCenter} />
        </GoogleMap>
      ) : staticMapUrl ? (
        // Fallback to static map image
        <img
          src={staticMapUrl}
          alt={`Map showing ${location}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // If static map fails, show placeholder
            const target = e.target as HTMLImageElement
            target.style.display = "none"
            const parent = target.parentElement
            if (parent) {
              parent.innerHTML = `
                <div class="w-full h-full bg-muted flex items-center justify-center">
                  <div class="text-center space-y-2">
                    <svg class="h-8 w-8 text-muted-foreground mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    <p class="text-xs text-muted-foreground">Click to open in Google Maps</p>
                  </div>
                </div>
              `
            }
          }}
        />
      ) : (
        // Final fallback: placeholder
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <div className="text-center space-y-2">
            <MapPin className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground">
              Click to open in Google Maps
            </p>
          </div>
        </div>
      )}

      {/* Click indicator overlay */}
      {showClickIndicator && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center pointer-events-none">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-md flex items-center gap-2 text-xs font-medium">
            <ExternalLink className="h-3 w-3" />
            <span>Open in Google Maps</span>
          </div>
        </div>
      )}
    </div>
  )
}

