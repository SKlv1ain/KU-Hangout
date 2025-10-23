import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import CustomNavbar from '../components/Navbar.jsx';
import PlanCard from '../components/PlanCard.jsx';
import Sidebar from '../components/Sidebar.jsx';
import ActivityFeed from '../components/ActivityFeed.jsx';
import CategoryFilter from '../components/CategoryFilter.jsx';
import CreateActivityModal from '../components/CreateActivityModal.jsx';
import '../styles/Home.css';

export default function Home() {
  // const { user } = useAuth(); // Commented out for testing
  
  // Mock user data for testing navbar
  const mockUser = { 
    username: "testuser",
    email: "test@example.com",
    bio: "A user who loves activities and meeting new friends",
    joinDate: "2024-01-15",
    location: "Bangkok",
    interests: ["Sports", "Food", "Travel", "Music"],
    avatar: null
  };

  // State management
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock plans data
  const mockPlans = [
    {
      id: 1,
      title: "Basketball at Sports Complex",
      description: "Let's play basketball together! Everyone can join, no experience required",
      date: "2024-12-20",
      time: "18:00",
      location: "Sports Complex, Kasetsart University",
      category: "Sports",
      maxParticipants: 10,
      currentParticipants: 6,
      image: null,
      creator: { username: "john_doe" },
      isJoined: false,
      isInterested: true
    },
    {
      id: 2,
      title: "Japanese Food at Siam",
      description: "Let's go eat sushi and ramen at the new restaurant in Siam area",
      date: "2024-12-22",
      time: "19:30",
      location: "Sushi Sushi Siam",
      category: "Food",
      maxParticipants: 8,
      currentParticipants: 4,
      image: null,
      creator: { username: "sarah_wong" },
      isJoined: true,
      isInterested: false
    },
    {
      id: 3,
      title: "Visit Amphawa Floating Market",
      description: "Let's visit Amphawa Floating Market, enjoy the atmosphere and local food",
      date: "2024-12-25",
      time: "08:00",
      location: "Amphawa Floating Market, Samut Songkhram",
      category: "Travel",
      maxParticipants: 15,
      currentParticipants: 12,
      image: null,
      creator: { username: "mike_chen" },
      isJoined: false,
      isInterested: false
    },
    {
      id: 4,
      title: "Art Studio Painting Session",
      description: "Let's learn painting together at the art studio, all equipment provided",
      date: "2024-12-28",
      time: "14:00",
      location: "Art Studio Art House",
      category: "Art",
      maxParticipants: 6,
      currentParticipants: 3,
      image: null,
      creator: { username: "anna_lee" },
      isJoined: false,
      isInterested: true
    }
  ];

  // Mock activities data
  const mockActivities = [
    {
      id: 1,
      type: 'created',
      user: { username: 'john_doe' },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      plan: mockPlans[0]
    },
    {
      id: 2,
      type: 'joined',
      user: { username: 'sarah_wong' },
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      plan: mockPlans[1]
    },
    {
      id: 3,
      type: 'interested',
      user: { username: 'mike_chen' },
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      plan: mockPlans[2]
    }
  ];

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

  const handleCreateActivity = (activityData) => {
    console.log('Creating activity:', activityData);
    // TODO: Implement create activity functionality
    setShowCreateModal(false);
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

            {/* Plans Grid */}
            <Row className="g-4 mb-5">
              {mockPlans.map(plan => (
                <Col md={6} lg={4} key={plan.id}>
                  <PlanCard 
                    plan={plan}
                    onJoin={handleJoin}
                    onInterest={handleInterest}
                  />
                </Col>
              ))}
            </Row>

            {/* Activity Feed */}
            <ActivityFeed 
              activities={mockActivities}
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
