"use client"

import * as React from "react"
import { parseDate } from "chrono-node"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export interface DatePickerProps {
  date?: Date | undefined
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  error?: string
  disabled?: boolean
  minDate?: Date // Minimum selectable date (default: today)
}

export const DatePicker = React.forwardRef<
  HTMLInputElement,
  DatePickerProps
>(({ 
  date, 
  onDateChange, 
  placeholder = "Tomorrow or next week", 
  className,
  error,
  disabled,
  minDate
}, ref) => {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState("")
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date)
  const [month, setMonth] = React.useState<Date | undefined>(date || new Date())

  // Set minimum date to today if not provided
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const minSelectableDate = minDate || today

  // Initialize value from date prop
  React.useEffect(() => {
    if (date) {
      setSelectedDate(date)
      setValue(formatDate(date))
      setMonth(date)
    } else {
      setValue("")
      setSelectedDate(undefined)
    }
  }, [date])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setValue(inputValue)

    const parsedDate = parseDate(inputValue)
    if (parsedDate) {
      // Check if date is in the past
      const dateToCheck = new Date(parsedDate)
      dateToCheck.setHours(0, 0, 0, 0)
      
      if (dateToCheck < minSelectableDate) {
        // Don't set date if it's in the past
        return
      }

      setSelectedDate(parsedDate)
      setMonth(parsedDate)
      onDateChange?.(parsedDate)
    } else {
      setSelectedDate(undefined)
      onDateChange?.(undefined)
    }
  }

  const handleCalendarSelect = (newDate: Date | undefined) => {
    if (newDate) {
      // Check if date is in the past
      const dateToCheck = new Date(newDate)
      dateToCheck.setHours(0, 0, 0, 0)
      
      if (dateToCheck < minSelectableDate) {
        // Don't allow selecting past dates
        return
      }

      setSelectedDate(newDate)
      setValue(formatDate(newDate))
      setMonth(newDate)
      onDateChange?.(newDate)
    } else {
      setSelectedDate(undefined)
      setValue("")
      onDateChange?.(undefined)
    }
    setOpen(false)
  }

  return (
    <div className="space-y-2">
      <div className="relative flex gap-2">
        <Input
          ref={ref}
          id="date"
          value={value}
          placeholder={placeholder}
          className={cn("bg-background pr-10", error && "border-destructive", className)}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
          disabled={disabled}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-picker"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
              type="button"
              disabled={disabled}
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={handleCalendarSelect}
              disabled={(date) => {
                const dateToCheck = new Date(date)
                dateToCheck.setHours(0, 0, 0, 0)
                return dateToCheck < minSelectableDate
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      {selectedDate && (
        <div className="text-muted-foreground px-1 text-sm">
          Event will be on{" "}
          <span className="font-medium">{formatDate(selectedDate)}</span>.
        </div>
      )}
    </div>
  )
})

DatePicker.displayName = 'DatePicker'

export default DatePicker
