import { useState, useCallback } from "react"

type FilterParams = {
  filter?: 'hot' | 'new' | 'expiring' | 'all'
  category?: string
  search?: string
}

export function usePlanFilters() {
  const [filterParams, setFilterParams] = useState<FilterParams>({})
  const [activeTab, setActiveTab] = useState<'feed' | 'saved' | 'my-plans'>('feed')

  const handleFilterChange = useCallback((
    groupId: string,
    optionId: string,
    checked: boolean
  ) => {
    if (checked) {
      if (groupId === 'status') {
        setFilterParams(prev => ({
          ...prev,
          filter: optionId === 'all' ? undefined : (optionId as 'hot' | 'new' | 'expiring' | 'all')
        }))
      } else if (groupId === 'category') {
        setFilterParams(prev => ({
          ...prev,
          category: optionId === 'all' ? undefined : optionId
        }))
      }
    }
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilterParams({})
  }, [])

  return {
    filterParams,
    setFilterParams,
    handleFilterChange,
    handleClearFilters,
    activeTab,
    setActiveTab
  }
}

