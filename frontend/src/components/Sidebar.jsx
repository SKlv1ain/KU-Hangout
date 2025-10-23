import React, { useState } from 'react';
import { Card, Form, Button, Accordion } from 'react-bootstrap';
import '../styles/Sidebar.css';

export default function Sidebar({ onFilterChange, onSearch }) {
  const [filters, setFilters] = useState({
    category: '',
    dateRange: '',
    location: '',
    participants: '',
    distance: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { value: '', label: 'All' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Food', label: 'Food' },
    { value: 'Travel', label: 'Travel' },
    { value: 'Art', label: 'Art' },
    { value: 'Music', label: 'Music' },
    { value: 'Movies', label: 'Movies' },
    { value: 'Games', label: 'Games' },
    { value: 'Other', label: 'Other' }
  ];

  const dateRanges = [
    { value: '', label: 'All Days' },
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  const participantRanges = [
    { value: '', label: 'No Limit' },
    { value: '1-5', label: '1-5 people' },
    { value: '6-10', label: '6-10 people' },
    { value: '11-20', label: '11-20 people' },
    { value: '20+', label: '20+ people' }
  ];

  const distances = [
    { value: '', label: 'No Limit' },
    { value: '1km', label: '1 km' },
    { value: '5km', label: '5 km' },
    { value: '10km', label: '10 km' },
    { value: '20km', label: '20 km' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange && onFilterChange(newFilters);
  };

  const handleSearch = () => {
    onSearch && onSearch(searchTerm);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      dateRange: '',
      location: '',
      participants: '',
      distance: ''
    };
    setFilters(clearedFilters);
    setSearchTerm('');
    onFilterChange && onFilterChange(clearedFilters);
    onSearch && onSearch('');
  };

  return (
    <div className="sidebar">
      <Card className="sidebar-card">
        <Card.Header className="sidebar-header">
          <h5 className="mb-0">
            <i className="fas fa-sliders-h me-2"></i>
            Filter & Search
          </h5>
        </Card.Header>
        
        <Card.Body className="sidebar-body">
          {/* Search */}
          <div className="search-section mb-4">
            <Form.Label className="sidebar-label">
              <i className="fas fa-search me-1"></i>
              Search Activities
            </Form.Label>
            <div className="search-input-group">
              <Form.Control
                type="text"
                placeholder="Search by activity name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <Button 
                variant="success" 
                size="sm"
                onClick={handleSearch}
                className="search-btn"
              >
                <i className="fas fa-search"></i>
              </Button>
            </div>
          </div>

          <Accordion defaultActiveKey="0" className="sidebar-accordion">
            {/* Category */}
            <Accordion.Item eventKey="0" className="sidebar-accordion-item">
              <Accordion.Header className="sidebar-accordion-header">
                <i className="fas fa-tags me-2"></i>
                Category
              </Accordion.Header>
              <Accordion.Body className="sidebar-accordion-body">
                <Form.Select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="sidebar-select"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </Form.Select>
              </Accordion.Body>
            </Accordion.Item>

            {/* Date & Time */}
            <Accordion.Item eventKey="1" className="sidebar-accordion-item">
              <Accordion.Header className="sidebar-accordion-header">
                <i className="fas fa-calendar-alt me-2"></i>
                Date & Time
              </Accordion.Header>
              <Accordion.Body className="sidebar-accordion-body">
                <Form.Select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="sidebar-select"
                >
                  {dateRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </Form.Select>
              </Accordion.Body>
            </Accordion.Item>

            {/* Participants */}
            <Accordion.Item eventKey="2" className="sidebar-accordion-item">
              <Accordion.Header className="sidebar-accordion-header">
                <i className="fas fa-users me-2"></i>
                Participants
              </Accordion.Header>
              <Accordion.Body className="sidebar-accordion-body">
                <Form.Select
                  value={filters.participants}
                  onChange={(e) => handleFilterChange('participants', e.target.value)}
                  className="sidebar-select"
                >
                  {participantRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </Form.Select>
              </Accordion.Body>
            </Accordion.Item>

            {/* Distance */}
            <Accordion.Item eventKey="3" className="sidebar-accordion-item">
              <Accordion.Header className="sidebar-accordion-header">
                <i className="fas fa-map-marker-alt me-2"></i>
                Distance
              </Accordion.Header>
              <Accordion.Body className="sidebar-accordion-body">
                <Form.Select
                  value={filters.distance}
                  onChange={(e) => handleFilterChange('distance', e.target.value)}
                  className="sidebar-select"
                >
                  {distances.map(dist => (
                    <option key={dist.value} value={dist.value}>
                      {dist.label}
                    </option>
                  ))}
                </Form.Select>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>

          {/* Clear Filters Button */}
          <div className="sidebar-actions mt-4">
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={clearFilters}
              className="w-100 clear-filters-btn"
            >
              <i className="fas fa-undo me-1"></i>
              Clear Filters
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
