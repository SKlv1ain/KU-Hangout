export const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1568036193587-84226a9c5a1b?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
  "https://images.unsplash.com/photo-1654054041538-ad6a3fb653d5?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=800",
]

export const FILTER_GROUPS = [
  {
    id: 'status',
    label: 'Status',
    options: [
      { id: 'all', label: 'All' },
      { id: 'hot', label: 'Hot' },
      { id: 'new', label: 'New' },
      { id: 'expiring', label: 'Expiring' },
    ],
  },
  {
    id: 'category',
    label: 'Category',
    options: [
      { id: 'all', label: 'All' },
      { id: 'sports', label: 'Sports' },
      { id: 'food', label: 'Food' },
      { id: 'travel', label: 'Travel' },
      { id: 'art', label: 'Art' },
      { id: 'music', label: 'Music' },
      { id: 'movie', label: 'Movies' },
      { id: 'game', label: 'Games' },
    ],
  },
] as const

