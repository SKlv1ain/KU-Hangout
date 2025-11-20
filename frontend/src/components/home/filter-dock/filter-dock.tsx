"use client"

import { useState } from "react"
import { BookmarkIcon, FilterIcon, X, Home, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LiquidButton } from "@/components/ui/shadcn-io/liquid-button"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
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
  createButtonText?: string
  activeTab?: 'feed' | 'saved' | 'my-plans'
  savedCount?: number
  myPlansCount?: number
  onDateChange?: (date: Date | undefined) => void
  onFilterChange?: (groupId: string, optionId: string, checked: boolean) => void
  onClearFilters?: () => void
  onTabChange?: (tab: 'feed' | 'saved' | 'my-plans') => void
  onCreateClick?: () => void
  className?: string
}

export function FilterDock({
  filterGroups = [],
  selectedDate,
  createButtonText = "Create plan",
  activeTab = 'feed',
  savedCount = 0,
  myPlansCount = 0,
  onDateChange,
  onFilterChange,
  onClearFilters,
  onTabChange,
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

          {/* Right side - Tabs, Date picker, and Create button */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Tabs value={activeTab} onValueChange={(value) => onTabChange?.(value as 'feed' | 'saved' | 'my-plans')}>
              <TabsList className="h-9">
                <TabsTrigger value="feed" className="gap-1.5">
                  <Home className="h-4 w-4" />
                  <span>Feed</span>
                </TabsTrigger>
                <TabsTrigger value="saved" className="gap-1.5 relative">
                  <BookmarkIcon className="h-4 w-4" />
                  <span>Saved</span>
                  {savedCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-semibold"
                    >
                      {savedCount > 99 ? '99+' : savedCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="my-plans" className="gap-1.5 relative">
                  <Sparkles className="h-4 w-4" />
                  <span>My Plans</span>
                  {myPlansCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-semibold"
                    >
                      {myPlansCount > 99 ? '99+' : myPlansCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <DatePicker 
              date={selectedDate}
              onDateChange={onDateChange}
            />
            <LiquidButton
              size="sm"
              onClick={(e) => {
                e.preventDefault()
                if (onCreateClick) onCreateClick()
              }}
            >
              {createButtonText}
            </LiquidButton>
          </div>
        </div>
      </div>
    </div>
  )
}

