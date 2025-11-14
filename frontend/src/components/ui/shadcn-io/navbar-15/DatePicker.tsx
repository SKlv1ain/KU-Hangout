'use client';

import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export const DatePicker = React.forwardRef<
  HTMLButtonElement,
  DatePickerProps
>(({ date, onDateChange, placeholder = "Pick a date", className }, ref) => {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (date !== undefined) {
      setSelectedDate(date);
    }
  }, [date]);

  const handleDateSelect = (newDate: Date | undefined) => {
    setSelectedDate(newDate);
    if (onDateChange) {
      onDateChange(newDate);
    }
    setOpen(false);
  };

  const displayDate = date !== undefined ? date : selectedDate;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          size="sm"
          className={cn(
            "justify-start text-left font-normal text-sm",
            !displayDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayDate ? format(displayDate, "PPP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={displayDate}
          onSelect={handleDateSelect}
        />
      </PopoverContent>
    </Popover>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker;