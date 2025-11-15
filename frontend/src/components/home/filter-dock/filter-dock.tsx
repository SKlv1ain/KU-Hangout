"use client"

import { useState } from "react"
import { BookmarkIcon, FilterIcon, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/shadcn-io/navbar-15/DatePicker"
import { cn } from "@/lib/utils"

export interface FilterGroup {
  id: string
  label: string
  options: Array<{
    id: string
    label: string
    checked?: boolean
  }>
}

export interface FilterDockProps {
  filterGroups?: FilterGroup[]
  selectedDate?: Date
  savedButtonText?: string
  createButtonText?: string
  onDateChange?: (date: Date | undefined) => void
  onFilterChange?: (groupId: string, optionId: string, checked: boolean) => void
  onClearFilters?: () => void
  onSavedClick?: () => void
  onCreateClick?: () => void
  className?: string
}

export function FilterDock({
  filterGroups = [],
  selectedDate,
  savedButtonText = "Saved",
  createButtonText = "Create Plan",
  onDateChange,
  onFilterChange,
  onClearFilters,
  onSavedClick,
  onCreateClick,
  className
}: FilterDockProps) {
  const [filters, setFilters] = useState(filterGroups)

  const handleFilterChange = (groupId: string, optionId: string, checked: boolean) => {
    setFilters(prevFilters =>
      prevFilters.map(group =>
        group.id === groupId
          ? {
              ...group,
              options: group.options.map(option =>
                option.id === optionId ? { ...option, checked } : option
              ),
            }
          : group
      )
    )

    if (onFilterChange) {
      onFilterChange(groupId, optionId, checked)
    }
  }

  const handleClearFilters = () => {
    setFilters(prevFilters =>
      prevFilters.map(group => ({
        ...group,
        options: group.options.map(option => ({ ...option, checked: false })),
      }))
    )

    if (onClearFilters) {
      onClearFilters()
    }
  }

  const activeFiltersCount = filters.reduce(
    (count, group) => count + group.options.filter(option => option.checked).length,
    0
  )

  return (
    <div
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60",
        "transition-all duration-200",
        className
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left side - Filters */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-sm"
                >
                  <FilterIcon className="h-4 w-4" />
                  <span>Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="ml-1 rounded-full bg-primary text-primary-foreground px-1.5 py-0.5 text-xs font-medium">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {filters.length === 0 ? (
                  <DropdownMenuItem disabled>No filters available</DropdownMenuItem>
                ) : (
                  filters.map((group) => (
                    <DropdownMenuGroup key={group.id}>
                      <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                        {group.label}
                      </DropdownMenuLabel>
                      {group.options.map((option) => (
                        <DropdownMenuItem
                          key={option.id}
                          className="p-0"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <div className="flex items-center gap-2 px-2 py-1.5 w-full">
                            <Checkbox
                              id={`${group.id}-${option.id}`}
                              checked={option.checked || false}
                              onCheckedChange={(checked) =>
                                handleFilterChange(group.id, option.id, checked as boolean)
                              }
                            />
                            <label
                              htmlFor={`${group.id}-${option.id}`}
                              className="text-sm font-normal cursor-pointer flex-1"
                            >
                              {option.label}
                            </label>
                          </div>
                        </DropdownMenuItem>
                      ))}
                      {group.id !== filters[filters.length - 1].id && (
                        <DropdownMenuSeparator />
                      )}
                    </DropdownMenuGroup>
                  ))
                )}
                {activeFiltersCount > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleClearFilters}
                      className="text-destructive focus:text-destructive"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear all filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right side - Date picker, Saved button, and Create button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <DatePicker 
              date={selectedDate}
              onDateChange={onDateChange}
            />
            <Button
              size="sm"
              variant="outline"
              className="text-sm max-sm:aspect-square max-sm:p-0"
              onClick={(e) => {
                e.preventDefault()
                if (onSavedClick) onSavedClick()
              }}
            >
              <BookmarkIcon
                className="text-muted-foreground/80 sm:-ms-1"
                size={16}
                aria-hidden="true"
              />
              <span className="max-sm:sr-only">{savedButtonText}</span>
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
              onClick={(e) => {
                e.preventDefault()
                if (onCreateClick) onCreateClick()
              }}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{createButtonText}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

