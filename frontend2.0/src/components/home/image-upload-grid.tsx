"use client"

import { useState, useRef } from "react"
import { X, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface ImageUploadGridProps {
  images: (File | string)[]
  onImagesChange: (images: (File | string)[]) => void
  maxImages?: number
  className?: string
}

export function ImageUploadGrid({
  images,
  onImagesChange,
  maxImages = 9,
  className
}: ImageUploadGridProps) {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const handleFileSelect = (index: number, file: File | null) => {
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }

    const newImages = [...images]
    if (index < newImages.length) {
      // Replace existing image
      newImages[index] = file
    } else {
      // Add new image
      newImages.push(file)
    }
    onImagesChange(newImages.slice(0, maxImages))
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragIndex(index)
  }

  const handleDragLeave = () => {
    setDragIndex(null)
  }

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragIndex(null)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(index, file)
    }
  }

  const getImageUrl = (image: File | string): string => {
    if (typeof image === 'string') {
      return image
    }
    return URL.createObjectURL(image)
  }

  return (
    <div className={cn("flex flex-col h-full w-full", className)}>
      <div className="grid grid-cols-3 gap-2 flex-1 h-full w-full">
        {Array.from({ length: maxImages }).map((_, index) => {
          const hasImage = index < images.length
          const image = hasImage ? images[index] : null

          return (
            <div
              key={index}
              className={cn(
                "relative rounded-lg border-2 border-dashed transition-all w-full h-full",
                dragIndex === index
                  ? "border-primary bg-primary/10"
                  : hasImage
                  ? "border-border"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50 bg-muted/30"
              )}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              {hasImage && image ? (
                <>
                  <img
                    src={getImageUrl(image)}
                    alt={`Upload ${index + 1}`}
                    className="h-full w-full rounded-lg object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full shadow-md"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </>
              ) : (
                <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 p-2">
                  <input
                    ref={(el) => (fileInputRefs.current[index] = el)}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileSelect(index, e.target.files?.[0] || null)}
                  />
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground text-center">
                    {index === 0 ? "Add Image" : ""}
                  </span>
                </label>
              )}
            </div>
          )
        })}
      </div>
      {images.length === 0 && (
        <p className="text-xs text-destructive text-center mt-2 flex-shrink-0">
          At least 1 image is required
        </p>
      )}
    </div>
  )
}

