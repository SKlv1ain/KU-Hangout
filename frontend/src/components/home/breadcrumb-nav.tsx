import { Navbar15, type Navbar15BreadcrumbItem } from "@/components/ui/shadcn-io/navbar-15"
import { useNavigate } from "react-router-dom"

export default function BreadcrumbNav() {
  const navigate = useNavigate()

  const handleBreadcrumbClick = (href: string) => {
    if (href.startsWith('/')) {
      navigate(href)
    }
  }

  const handleDateChange = (date: Date | undefined) => {
    console.log('Date changed:', date)
  }

  const handleFilterChange = (groupId: string, optionId: string, checked: boolean) => {
    console.log('Filter changed:', { groupId, optionId, checked })
  }

  const handleClearFilters = () => {
    console.log('Filters cleared')
  }

  const handleSavedClick = () => {
    console.log('Saved clicked')
  }

  const breadcrumbItems: Navbar15BreadcrumbItem[] = [
    { href: '/home', label: 'Home' },
    { label: 'Plans', isCurrentPage: true },
  ]

  const filterGroups = [
    {
      id: 'status',
      label: 'Status',
      options: [
        { id: 'upcoming', label: 'Upcoming', checked: false },
        { id: 'ongoing', label: 'Ongoing', checked: false },
        { id: 'completed', label: 'Completed', checked: false },
      ],
    },
    {
      id: 'category',
      label: 'Category',
      options: [
        { id: 'study', label: 'Study', checked: false },
        { id: 'social', label: 'Social', checked: false },
        { id: 'sports', label: 'Sports', checked: false },
      ],
    },
  ]

  return (
    <Navbar15
      breadcrumbItems={breadcrumbItems}
      showHomeIcon={true}
      filterGroups={filterGroups}
      savedButtonText="Saved"
      onBreadcrumbClick={handleBreadcrumbClick}
      onDateChange={handleDateChange}
      onFilterChange={handleFilterChange}
      onClearFilters={handleClearFilters}
      onSavedClick={handleSavedClick}
    />
  )
}

