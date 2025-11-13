'use client';

import * as React from 'react';
import { FilterIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export interface FilterOption {
  id: string;
  label: string;
  checked?: boolean;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
}

export interface FiltersProps {
  filterGroups?: FilterGroup[];
  onFilterChange?: (groupId: string, optionId: string, checked: boolean) => void;
  onClearFilters?: () => void;
  className?: string;
}

const defaultFilterGroups: FilterGroup[] = [
  {
    id: 'status',
    label: 'Status',
    options: [
      { id: 'active', label: 'Active', checked: false },
      { id: 'inactive', label: 'Inactive', checked: false },
      { id: 'pending', label: 'Pending', checked: true },
    ],
  },
  {
    id: 'category',
    label: 'Category',
    options: [
      { id: 'sales', label: 'Sales', checked: false },
      { id: 'marketing', label: 'Marketing', checked: true },
      { id: 'support', label: 'Support', checked: false },
    ],
  },
];

export const Filters = React.forwardRef<
  HTMLButtonElement,
  FiltersProps
>(({ filterGroups = defaultFilterGroups, onFilterChange, onClearFilters, className }, ref) => {
  const [filters, setFilters] = React.useState(filterGroups);

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
    );

    if (onFilterChange) {
      onFilterChange(groupId, optionId, checked);
    }
  };

  const handleClearFilters = () => {
    setFilters(prevFilters =>
      prevFilters.map(group => ({
        ...group,
        options: group.options.map(option => ({ ...option, checked: false })),
      }))
    );

    if (onClearFilters) {
      onClearFilters();
    }
  };

  const activeFiltersCount = filters.reduce(
    (count, group) => count + group.options.filter(option => option.checked).length,
    0
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          ref={ref}
          variant="outline"
          size="sm"
          className={className}
        >
          <FilterIcon className="mr-2 h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Filters</DropdownMenuLabel>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs"
              onClick={handleClearFilters}
            >
              <XIcon className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {filters.map((group, groupIndex) => (
          <div key={group.id}>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-2 py-1.5">
              {group.label}
            </DropdownMenuLabel>
            {group.options.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.id}
                checked={option.checked}
                onCheckedChange={(checked) =>
                  handleFilterChange(group.id, option.id, checked)
                }
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
            {groupIndex < filters.length - 1 && <DropdownMenuSeparator />}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

Filters.displayName = 'Filters';

export default Filters;