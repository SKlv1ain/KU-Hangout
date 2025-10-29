import React from 'react';
import { Card, Row, Col, Badge, Button, ProgressBar } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/UserProfile.css';

export default function UserProfile({ user, stats, onEditProfile }) {
  const {
    id,
    username,
    email,
    avatar,
    bio,
    joinDate,
    location,
    interests = [],
    socialLinks = {}
  } = user || {};

  const {
    totalPlans = 0,
    joinedPlans = 0,
    completedPlans = 0,
    friendsCount = 0,
    rating = 0
  } = stats || {};

  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getInterestIcon = (interest) => {
    const icons = {
      'Sports': 'fas fa-running',
      'Food': 'fas fa-utensils',
      'Travel': 'fas fa-map-marker-alt',
      'Art': 'fas fa-palette',
      'Music': 'fas fa-music',
      'Movies': 'fas fa-film',
      'Games': 'fas fa-gamepad',
      'Books': 'fas fa-book',
      'Technology': 'fas fa-laptop',
      'Other': 'fas fa-ellipsis-h'
    };
    return icons[interest] || icons['Other'];
  };

  const getInterestColor = (interest) => {
    const colors = {
      'Sports': 'success',
      'Food': 'warning',
      'Travel': 'info',
      'Art': 'danger',
      'Music': 'primary',
      'Movies': 'secondary',
      'Games': 'dark',
      'Books': 'light',
      'Technology': 'outline-primary',
      'Other': 'outline-secondary'
    };
    return colors[interest] || colors['Other'];
  };

  return (
    <Card className="user-profile-card">
      <Card.Header className="user-profile-header">
        <div className="profile-header-content">
          <div className="profile-avatar">
            {avatar ? (
              <img 
                src={avatar} 
                alt={username}
                className="avatar-image"
              />
            ) : (
              <div className="avatar-placeholder">
                <i className="fas fa-user fa-2x"></i>
              </div>
            )}
          </div>
          <div className="profile-info">
            <h4 className="profile-name">{username || 'User'}</h4>
            <p className="profile-bio">{bio || 'No personal information available'}</p>
            <div className="profile-meta">
              <span className="profile-location">
                <i className="fas fa-map-marker-alt me-1"></i>
                {location || 'Location not specified'}
              </span>
              <span className="profile-join-date">
                <i className="fas fa-calendar-alt me-1"></i>
                Joined {formatJoinDate(joinDate)}
              </span>
            </div>
          </div>
        </div>
        
        {onEditProfile && (
          <div className="profile-actions">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={onEditProfile}
              className="edit-profile-btn"
            >
              <i className="fas fa-edit me-1"></i>
              Edit Profile
            </Button>
          </div>
        )}
      </Card.Header>

      <Card.Body className="user-profile-body">
        {/* Usage Statistics */}
        <div className="profile-stats">
          <h6 className="stats-title">
            <i className="fas fa-chart-bar me-2"></i>
            Usage Statistics
          </h6>
          <Row className="g-3">
            <Col xs={6} md={3}>
              <div className="stat-item">
                <div className="stat-number">{totalPlans}</div>
                <div className="stat-label">Plans Created</div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="stat-item">
                <div className="stat-number">{joinedPlans}</div>
                <div className="stat-label">Plans Joined</div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="stat-item">
                <div className="stat-number">{completedPlans}</div>
                <div className="stat-label">Plans Completed</div>
              </div>
            </Col>
            <Col xs={6} md={3}>
              <div className="stat-item">
                <div className="stat-number">{friendsCount}</div>
                <div className="stat-label">Friends</div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Rating */}
        {rating > 0 && (
          <div className="profile-rating">
            <h6 className="rating-title">
              <i className="fas fa-star me-2"></i>
              Rating
            </h6>
            <div className="rating-content">
              <div className="rating-stars">
                {[...Array(5)].map((_, index) => (
                  <i 
                    key={index}
                    className={`fas fa-star ${index < Math.floor(rating) ? 'text-warning' : 'text-muted'}`}
                  ></i>
                ))}
              </div>
              <span className="rating-number">{rating.toFixed(1)}/5.0</span>
            </div>
          </div>
        )}

        {/* Interests */}
        {interests.length > 0 && (
          <div className="profile-interests">
            <h6 className="interests-title">
              <i className="fas fa-heart me-2"></i>
              Interests
            </h6>
            <div className="interests-list">
              {interests.map((interest, index) => (
                <Badge 
                  key={index}
                  bg={getInterestColor(interest)}
                  className="interest-badge"
                >
                  <i className={`${getInterestIcon(interest)} me-1`}></i>
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Social Links */}
        {Object.keys(socialLinks).length > 0 && (
          <div className="profile-social">
            <h6 className="social-title">
              <i className="fas fa-share-alt me-2"></i>
              Social Media
            </h6>
            <div className="social-links">
              {Object.entries(socialLinks).map(([platform, url]) => (
                <a 
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <i className={`fab fa-${platform} me-1`}></i>
                  {platform}
                </a>
              ))}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
