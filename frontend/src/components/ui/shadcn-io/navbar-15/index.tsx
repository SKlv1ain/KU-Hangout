'use client';

import * as React from 'react';
import { BookmarkIcon, HomeIcon } from 'lucide-react';
import DatePicker from './DatePicker';
import Filters from './Filters';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Types
export interface Navbar15BreadcrumbItem {
  href?: string;
  label: string;
  isCurrentPage?: boolean;
}

export interface Navbar15Props extends React.HTMLAttributes<HTMLElement> {
  breadcrumbItems?: Navbar15BreadcrumbItem[];
  showHomeIcon?: boolean;
  selectedDate?: Date;
  filterGroups?: Array<{
    id: string;
    label: string;
    options: Array<{
      id: string;
      label: string;
      checked?: boolean;
    }>;
  }>;
  savedButtonText?: string;
  onBreadcrumbClick?: (href: string) => void;
  onDateChange?: (date: Date | undefined) => void;
  onFilterChange?: (groupId: string, optionId: string, checked: boolean) => void;
  onClearFilters?: () => void;
  onSavedClick?: () => void;
}

// Default breadcrumb items
const defaultBreadcrumbItems: Navbar15BreadcrumbItem[] = [
  { href: '#', label: 'Home' },
  { label: 'Reports', isCurrentPage: true },
];

export const Navbar15 = React.forwardRef<HTMLElement, Navbar15Props>(
  (
    {
      className,
      breadcrumbItems = defaultBreadcrumbItems,
      showHomeIcon = true,
      selectedDate,
      filterGroups,
      savedButtonText = 'Saved',
      onBreadcrumbClick,
      onDateChange,
      onFilterChange,
      onClearFilters,
      onSavedClick,
      ...props
    },
    ref
  ) => {
    return (
      <header
        ref={ref}
        className={cn(
          'border-b px-4 md:px-6 [&_*]:no-underline',
          className
        )}
        {...props}
      >
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left side */}
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbItems.map((item, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {item.isCurrentPage ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        href={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          if (onBreadcrumbClick && item.href) {
                            onBreadcrumbClick(item.href);
                          }
                        }}
                        className="cursor-pointer"
                      >
                        {index === 0 && showHomeIcon ? (
                          <>
                            <HomeIcon size={16} aria-hidden="true" />
                            <span className="sr-only">{item.label}</span>
                          </>
                        ) : (
                          item.label
                        )}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Date picker */}
            <DatePicker 
              date={selectedDate}
              onDateChange={onDateChange}
            />
            {/* Filters */}
            <Filters 
              filterGroups={filterGroups}
              onFilterChange={onFilterChange}
              onClearFilters={onClearFilters}
            />
            {/* Saved button */}
            <Button
              size="sm"
              variant="outline"
              className="text-sm max-sm:aspect-square max-sm:p-0"
              onClick={(e) => {
                e.preventDefault();
                if (onSavedClick) onSavedClick();
              }}
            >
              <BookmarkIcon
                className="text-muted-foreground/80 sm:-ms-1"
                size={16}
                aria-hidden="true"
              />
              <span className="max-sm:sr-only">{savedButtonText}</span>
            </Button>
          </div>
        </div>
      </header>
    );
  }
);

Navbar15.displayName = 'Navbar15';

export { DatePicker, Filters };