"use client"

import { useState } from "react"
import { X, Clock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUploadGrid } from "../image-upload-grid"
import { DatePicker } from "@/components/ui/shadcn-io/navbar-15/DatePicker"
import { GooglePlacesAutocomplete } from "../google-places-autocomplete"
import { cn } from "@/lib/utils"

export interface CreatePlanFormData {
  title: string
  description: string
  location: string
  lat?: number
  lng?: number
  date: Date | undefined
  time: string
  tags: string[]
  maxParticipants: number
  requirements: string[]
  images: (File | string)[]
}

export interface CreatePlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: CreatePlanFormData) => void
}

export function CreatePlanDialog({
  open,
  onOpenChange,
  onSubmit
}: CreatePlanDialogProps) {
  const [formData, setFormData] = useState<CreatePlanFormData>({
    title: "",
    description: "",
    location: "",
    lat: undefined,
    lng: undefined,
    date: undefined,
    time: "",
    tags: [],
    maxParticipants: 1,
    requirements: [],
    images: []
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CreatePlanFormData, string>>>({})
  const [tagInput, setTagInput] = useState("")
  const [requirementInput, setRequirementInput] = useState("")

  const handleInputChange = (field: keyof CreatePlanFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      handleInputChange("tags", [...formData.tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange("tags", formData.tags.filter(tag => tag !== tagToRemove))
  }

  const handleAddRequirement = () => {
    if (requirementInput.trim() && !formData.requirements.includes(requirementInput.trim())) {
      handleInputChange("requirements", [...formData.requirements, requirementInput.trim()])
      setRequirementInput("")
    }
  }

  const handleRemoveRequirement = (reqToRemove: string) => {
    handleInputChange("requirements", formData.requirements.filter(req => req !== reqToRemove))
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreatePlanFormData, string>> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required"
    } else if (formData.location.length > 100) {
      newErrors.location = "Location must be no more than 100 characters"
    }

    if (!formData.date) {
      newErrors.date = "Date is required"
    } else {
      // Check if date is in the past
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const selectedDate = new Date(formData.date)
      selectedDate.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        newErrors.date = "Date cannot be in the past"
      }
    }

    if (!formData.time.trim()) {
      newErrors.time = "Time is required"
    }

    if (formData.maxParticipants < 1) {
      newErrors.maxParticipants = "Max participants must be at least 1"
    }

    if (formData.images.length === 0) {
      newErrors.images = "At least 1 image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit?.(formData)
      // Reset form
      setFormData({
        title: "",
        description: "",
        location: "",
        lat: undefined,
        lng: undefined,
        date: undefined,
        time: "",
        tags: [],
        maxParticipants: 1,
        requirements: [],
        images: []
      })
      setErrors({})
      setTagInput("")
      setRequirementInput("")
      onOpenChange(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      lat: undefined,
      lng: undefined,
      date: undefined,
      time: "",
      tags: [],
      maxParticipants: 1,
      requirements: [],
      images: []
    })
    setErrors({})
    setTagInput("")
    setRequirementInput("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="!max-w-[98vw] w-[98vw] h-[95vh] max-h-[95vh] p-0 flex flex-col sm:!max-w-[55vw]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
          <DialogTitle className="text-2xl">Create New Plan</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new plan for others to join
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-row divide-x overflow-hidden flex-1 min-h-0">
          {/* Left Side - Image Upload Grid (50%) */}
          <div className="flex-1 p-6 overflow-y-auto flex flex-col">
            <Label className="text-base font-semibold mb-4 block flex-shrink-0">
              Images <span className="text-destructive">*</span>
            </Label>
            <div className="flex-1 flex items-center justify-center min-h-0">
              <ImageUploadGrid
                images={formData.images}
                onImagesChange={(images) => handleInputChange("images", images)}
                maxImages={9}
                className="w-full h-full"
              />
            </div>
            {errors.images && (
              <p className="text-xs text-destructive mt-2 flex-shrink-0">{errors.images}</p>
            )}
          </div>

          {/* Right Side - Form Fields (50%) */}
          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter plan title"
                className={cn(errors.title && "border-destructive")}
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe your plan..."
                rows={4}
                className={cn(errors.description && "border-destructive")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description}</p>
              )}
            </div>

            {/* Location */}
            <GooglePlacesAutocomplete
              id="location"
              value={formData.location}
              onChange={(value) => handleInputChange("location", value)}
              onPlaceSelect={(place) => {
                // Extract lat/lng from place geometry
                if (place.geometry?.location) {
                  handleInputChange("lat", place.geometry.location.lat())
                  handleInputChange("lng", place.geometry.location.lng())
                }
              }}
              placeholder="Enter location"
              error={errors.location}
              label="Location"
              required
            />

            {/* Date */}
            <div className="space-y-2">
              <Label>
                Date <span className="text-destructive">*</span>
              </Label>
              <DatePicker
                date={formData.date}
                onDateChange={(date) => handleInputChange("date", date)}
                placeholder="Tomorrow or next week"
                error={errors.date}
              />
            </div>

            {/* Time & Max Participants */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time">
                  Time <span className="text-destructive">*</span>
                </Label>
                <div className="relative flex gap-2">
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleInputChange("time", e.target.value)}
                    className={cn("bg-background pr-10", errors.time && "border-destructive")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                    onClick={() => {
                      const timeInput = document.getElementById("time") as HTMLInputElement
                      timeInput?.showPicker?.()
                    }}
                  >
                    <Clock className="size-3.5" />
                    <span className="sr-only">Select time</span>
                  </Button>
                </div>
                {errors.time && (
                  <p className="text-xs text-destructive">{errors.time}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">
                  Max Participants <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  value={formData.maxParticipants}
                  onChange={(e) => handleInputChange("maxParticipants", parseInt(e.target.value) || 1)}
                  className={cn(errors.maxParticipants && "border-destructive")}
                />
                {errors.maxParticipants && (
                  <p className="text-xs text-destructive">{errors.maxParticipants}</p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <div className="flex gap-2">
                <Input
                  id="requirements"
                  value={requirementInput}
                  onChange={(e) => setRequirementInput(e.target.value)}
                  placeholder="Add a requirement"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddRequirement()
                    }
                  }}
                />
                <Button type="button" onClick={handleAddRequirement} variant="outline">
                  Add
                </Button>
              </div>
              {formData.requirements.length > 0 && (
                <ul className="list-disc list-inside space-y-1 mt-2 text-sm text-muted-foreground">
                  {formData.requirements.map((req, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span>{req}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRequirement(req)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

