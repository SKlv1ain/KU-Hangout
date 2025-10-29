import React from 'react';
import { Button, Badge } from 'react-bootstrap';
import '../styles/CategoryFilter.css';

export default function CategoryFilter({ categories, selectedCategory, onCategorySelect, categoryCounts = {} }) {
  const defaultCategories = [
    { id: 'all', name: 'All', icon: 'fas fa-th', color: 'secondary' },
    { id: 'sports', name: 'Sports', icon: 'fas fa-running', color: 'success' },
    { id: 'food', name: 'Food', icon: 'fas fa-utensils', color: 'warning' },
    { id: 'travel', name: 'Travel', icon: 'fas fa-map-marker-alt', color: 'info' },
    { id: 'art', name: 'Art', icon: 'fas fa-palette', color: 'danger' },
    { id: 'music', name: 'Music', icon: 'fas fa-music', color: 'primary' },
    { id: 'movie', name: 'Movies', icon: 'fas fa-film', color: 'secondary' },
    { id: 'game', name: 'Games', icon: 'fas fa-gamepad', color: 'purple' },
    { id: 'other', name: 'Other', icon: 'fas fa-ellipsis-h', color: 'teal' }
  ];

  const categoriesToUse = categories || defaultCategories.map(cat => ({
    ...cat,
    count: categoryCounts[cat.id] || 0
  }));

  const handleCategoryClick = (categoryId) => {
    onCategorySelect && onCategorySelect(categoryId);
  };

  return (
    <div className="category-filter">
      <div className="category-filter-header">
        <h6 className="category-filter-title">
          <i className="fas fa-tags me-2"></i>
          Activity Categories
        </h6>
      </div>
      
      <div className="category-buttons">
        {categoriesToUse.map((category) => {
          // Handle special colors (purple, teal) that don't have Bootstrap variants
          const isActive = selectedCategory === category.id;
          const variant = ['purple', 'teal'].includes(category.color)
            ? (isActive ? category.color : `outline-${category.color}`)
            : (isActive ? category.color : `outline-${category.color}`);
          
          return (
            <Button
              key={category.id}
              variant={variant}
              size="sm"
              className={`category-btn ${isActive ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <i className={`${category.icon} me-1`}></i>
              {category.name}
              {(category.count !== undefined && category.count !== null) && (
                <Badge bg="light" text="dark" className="ms-1 category-count">
                  {category.count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
