"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Circle } from "lucide-react"

interface ImageCarouselProps {
  images: string[]
  alt?: string
  className?: string
  minHeight?: string
}

export function ImageCarousel({ 
  images, 
  alt = "Image", 
  className = "",
  minHeight = "280px"
}: ImageCarouselProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index: number, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setCurrentImageIndex(index)
  }

  return (
    <div 
      className={`bg-muted flex-shrink-0 relative group h-full w-full ${className}`} 
      style={{ minHeight }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative h-full w-full overflow-hidden" style={{ minHeight }}>
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`${alt} ${index + 1}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{ minHeight }}
          />
        ))}
      </div>
      
      {/* Navigation Dots */}
      <div className="absolute bottom-2 left-1/2 z-50 flex -translate-x-1/2 gap-1">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => goToImage(i, e)}
            className="bg-transparent border-none p-0 text-white/80 hover:text-white transition-colors cursor-pointer"
            style={{ backgroundColor: 'transparent', border: 'none', padding: 0 }}
            aria-label={`Go to image ${i + 1}`}
          >
            <Circle className={`h-2 w-2 transition-all ${
              i === currentImageIndex ? "fill-white" : "fill-white/40"
            }`} />
          </button>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={prevImage}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-50 bg-transparent border-none p-1 text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        style={{ backgroundColor: 'transparent', border: 'none' }}
        aria-label="Previous image"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={nextImage}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-50 bg-transparent border-none p-1 text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        style={{ backgroundColor: 'transparent', border: 'none' }}
        aria-label="Next image"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

