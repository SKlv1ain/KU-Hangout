import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import CustomNavbar from '../components/Navbar.jsx';
import PlanCard from '../components/PlanCard.jsx';
import Sidebar from '../components/Sidebar.jsx';
import ActivityFeed from '../components/ActivityFeed.jsx';
import CategoryFilter from '../components/CategoryFilter.jsx';
import CreateActivityModal from '../components/CreateActivityModal.jsx';
import { getPlans } from '../services/planService.js';
import '../styles/Home.css';

// Category mapping for display
const defaultCategories = [
  { id: 'all', name: 'All' },
  { id: 'sports', name: 'Sports' },
  { id: 'food', name: 'Food' },
  { id: 'travel', name: 'Travel' },
  { id: 'art', name: 'Art' },
  { id: 'music', name: 'Music' },
  { id: 'movie', name: 'Movies' },
  { id: 'game', name: 'Games' },
  { id: 'other', name: 'Other' }
];

export default function Home() {
  const { user } = useAuth();

  // State management
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [plans, setPlans] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryCounts, setCategoryCounts] = useState({});

          // Fetch category counts on mount
          useEffect(() => {
            const fetchCategoryCounts = async () => {
              try {
                const categories = ['all', 'sports', 'food', 'travel', 'art', 'music', 'movie', 'game', 'other'];
                const counts = {};
                
                // Fetch count for each category
                for (const category of categories) {
                  try {
                    const params = { filter: 'all' };
                    if (category !== 'all') {
                      params.category = category;
                    }
                    const response = await getPlans(params);
                    counts[category] = response.length;
                  } catch (error) {
                    counts[category] = 0;
                  }
                }
                
                setCategoryCounts(counts);
              } catch (error) {
                console.error('Error fetching category counts:', error);
              }
            };

            fetchCategoryCounts();
          }, []); // Only fetch on mount

          // Fetch plans from API
          useEffect(() => {
            const fetchPlans = async () => {
              try {
                setLoading(true);
                // Build query parameters
                const params = {
                  filter: 'all'
                };
                
                // Add category filter from CategoryFilter component
                if (selectedCategory && selectedCategory !== 'all') {
                  params.category = selectedCategory;
                }
                
                // Add category filter from Sidebar (if different from CategoryFilter)
                // CategoryFilter takes precedence
                if (!selectedCategory || selectedCategory === 'all') {
                  if (filters.category && filters.category !== '') {
                    // Map Sidebar category value to category ID
                    const sidebarCategoryMap = {
                      'Sports': 'sports',
                      'Food': 'food',
                      'Travel': 'travel',
                      'Art': 'art',
                      'Music': 'music',
                      'Movies': 'movie',
                      'Games': 'game',
                      'Other': 'other'
                    };
                    const categoryId = sidebarCategoryMap[filters.category] || filters.category.toLowerCase();
                    params.category = categoryId;
                  }
                }
                
                // Add search term if provided
                if (searchTerm && searchTerm.trim()) {
                  params.search = searchTerm.trim();
                }
                
                const response = await getPlans(params);
                const plansData = response.map(plan => ({
                  id: plan.id,
                  title: plan.title,
                  description: plan.description,
                  date: plan.event_time.split('T')[0], // Extract date part
                  time: plan.event_time.split('T')[1].split('.')[0].substring(0, 5), // Extract time part
                  location: plan.location,
                  category: plan.tags_display && plan.tags_display.length > 0 ? plan.tags_display[0].name : 'Other',
                  maxParticipants: plan.max_people,
                  currentParticipants: plan.people_joined || 1,
                  image: null,
                  creator: { username: plan.creator_username || 'Unknown' },
                  isJoined: false,
                  isInterested: false,
                  isExpired: plan.is_expired,
                  timeUntilEvent: plan.time_until_event
                }));
                setPlans(plansData);
              } catch (error) {
                console.error('Error fetching plans:', error);
                setPlans([]);
              } finally {
                setLoading(false);
              }
            };

            fetchPlans();
            
            // Auto-refresh every 30 seconds to update expiration status
            const interval = setInterval(fetchPlans, 30000);
            
            return () => clearInterval(interval);
          }, [selectedCategory, filters, searchTerm]); // Re-fetch when category, filters, or search term changes

  // Event handlers
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleJoin = (planId) => {
    console.log('Joining plan:', planId);
    // TODO: Implement join functionality
  };

  const handleInterest = (planId) => {
    console.log('Interested in plan:', planId);
    // TODO: Implement interest functionality
  };

          const handleCreateActivity = async (activityData) => {
            console.log('Creating activity:', activityData);
            
            // Store image URL from activityData for the newly created plan
            const newPlanImage = activityData.image;
            
            // Add to plans state immediately for better UX
            setPlans(prevPlans => [activityData, ...prevPlans]);
            
            // Create activity entry
            const newActivity = {
              id: Date.now() + 1,
              type: 'created',
              user: { username: user?.username || 'Anonymous' },
              timestamp: new Date().toISOString(),
              plan: activityData
            };
            
            // Add to activities state
            setActivities(prevActivities => [newActivity, ...prevActivities]);
            
            setShowCreateModal(false);
            
            // Refresh category counts
            const fetchCategoryCounts = async () => {
              try {
                const categories = ['all', 'sports', 'food', 'travel', 'art', 'music', 'movie', 'game', 'other'];
                const counts = {};
                
                for (const category of categories) {
                  try {
                    const params = { filter: 'all' };
                    if (category !== 'all') {
                      params.category = category;
                    }
                    const response = await getPlans(params);
                    counts[category] = response.length;
                  } catch (error) {
                    counts[category] = 0;
                  }
                }
                
                setCategoryCounts(counts);
              } catch (error) {
                console.error('Error refreshing category counts:', error);
              }
            };
            
            fetchCategoryCounts();
            
            // Refresh data from API to ensure consistency
            try {
              const params = {
                filter: 'all'
              };
              
              // Add category filter from CategoryFilter component
              if (selectedCategory && selectedCategory !== 'all') {
                params.category = selectedCategory;
              }
              
              // Add category filter from Sidebar
              if (!selectedCategory || selectedCategory === 'all') {
                if (filters.category && filters.category !== '') {
                  const sidebarCategoryMap = {
                    'Sports': 'sports',
                    'Food': 'food',
                    'Travel': 'travel',
                    'Art': 'art',
                    'Music': 'music',
                    'Movies': 'movie',
                    'Games': 'game',
                    'Other': 'other'
                  };
                  const categoryId = sidebarCategoryMap[filters.category] || filters.category.toLowerCase();
                  params.category = categoryId;
                }
              }
              
              // Add search term if provided
              if (searchTerm && searchTerm.trim()) {
                params.search = searchTerm.trim();
              }
              
              const response = await getPlans(params);
              const plansData = response.map(plan => {
                // If this is the newly created plan, use the image from activityData
                const isNewPlan = plan.id === activityData.id;
                return {
                  id: plan.id,
                  title: plan.title,
                  description: plan.description,
                  date: plan.event_time.split('T')[0],
                  time: plan.event_time.split('T')[1].split('.')[0].substring(0, 5),
                  location: plan.location,
                  category: plan.tags_display && plan.tags_display.length > 0 ? plan.tags_display[0].name : 'Other',
                  maxParticipants: plan.max_people,
                  currentParticipants: plan.people_joined || 1,
                  image: isNewPlan ? newPlanImage : null, // Use uploaded image for new plan
                  creator: { username: plan.creator_username || 'Unknown' },
                  isJoined: false,
                  isInterested: false,
                  isExpired: plan.is_expired,
                  timeUntilEvent: plan.time_until_event
                };
              });
              setPlans(plansData);
            } catch (error) {
              console.error('Error refreshing plans:', error);
            }
          };

  return (
    <div className="home-container">
      <CustomNavbar />
      
      <Container className="py-4">
        {/* Main Content */}
        <Row>
          {/* Sidebar */}
          <Col lg={3} className="mb-4">
            <Sidebar 
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
            />
          </Col>

          {/* Main Content Area */}
          <Col lg={9}>
            {/* Category Filter and Create Button */}
            <div className="mb-4 d-flex justify-content-between align-items-center">
              <div className="flex-grow-1">
                <CategoryFilter 
                  selectedCategory={selectedCategory}
                  onCategorySelect={handleCategorySelect}
                  categoryCounts={categoryCounts}
                />
              </div>
              <div className="ms-3">
                <Button 
                  variant="success" 
                  size="lg"
                  className="create-activity-btn"
                  onClick={() => setShowCreateModal(true)}
                >
                  <i className="fas fa-plus me-2"></i>
                  Create Activity
                </Button>
              </div>
            </div>

            {/* Results Count */}
            {!loading && (
              <div className="mb-3 results-count">
                <p className="text-muted mb-0">
                  <i className="fas fa-list me-2"></i>
                  Showing <strong>{plans.length}</strong> {plans.length === 1 ? 'activity' : 'activities'}
                  {selectedCategory !== 'all' && (
                    <span className="ms-2">
                      in <strong>{defaultCategories.find(c => c.id === selectedCategory)?.name || selectedCategory}</strong>
                    </span>
                  )}
                  {searchTerm && searchTerm.trim() && (
                    <span className="ms-2">
                      for "<strong>{searchTerm.trim()}</strong>"
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Plans Grid */}
            <Row className="g-4 mb-5">
              {loading ? (
                <Col xs={12}>
                  <Card className="text-center py-5">
                    <Card.Body>
                      <div className="spinner-border text-success mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <h5 className="text-muted">Loading activities...</h5>
                    </Card.Body>
                  </Card>
                </Col>
              ) : plans.length > 0 ? (
                plans.map(plan => (
                  <Col md={6} lg={4} key={plan.id}>
                    <PlanCard 
                      plan={plan}
                      onJoin={handleJoin}
                      onInterest={handleInterest}
                    />
                  </Col>
                ))
              ) : (
                <Col xs={12}>
                  <Card className="text-center py-5">
                    <Card.Body>
                      <i className="fas fa-calendar-plus fa-3x text-muted mb-3"></i>
                      <h5 className="text-muted mb-3">No activities yet</h5>
                      <p className="text-muted mb-4">
                        Be the first to create an activity and start connecting with others!
                      </p>
                      <Button 
                        variant="success" 
                        onClick={() => setShowCreateModal(true)}
                        className="create-activity-btn"
                      >
                        <i className="fas fa-plus me-2"></i>
                        Create First Activity
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              )}
            </Row>

            {/* Activity Feed */}
            <ActivityFeed 
              activities={activities}
              onJoin={handleJoin}
              onInterest={handleInterest}
            />
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="mt-5 py-4 home-footer">
        <Container>
          <Row>
            <Col className="text-center">
              <p className="mb-0 text-muted">
                © 2024 KU Hangout - A space for meeting and creating activity plans
              </p>
            </Col>
          </Row>
        </Container>
      </footer>

      {/* Create Activity Modal */}
      <CreateActivityModal 
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onCreateActivity={handleCreateActivity}
      />
    </div>
  );
}
