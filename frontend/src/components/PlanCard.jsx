import React from 'react';
import { Card, Button, Badge, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/PlanCard.css';

export default function PlanCard({ plan, onJoin, onInterest }) {
  const {
    id,
    title,
    description,
    date,
    time,
    location,
    category,
    maxParticipants,
    currentParticipants,
    image,
    creator,
    isJoined = false,
    isInterested = false
  } = plan;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Sports': 'fas fa-running',
      'Food': 'fas fa-utensils',
      'Travel': 'fas fa-map-marker-alt',
      'Art': 'fas fa-palette',
      'Music': 'fas fa-music',
      'Movies': 'fas fa-film',
      'Games': 'fas fa-gamepad',
      'Other': 'fas fa-ellipsis-h'
    };
    return icons[category] || icons['Other'];
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Sports': 'success',
      'Food': 'warning',
      'Travel': 'info',
      'Art': 'danger',
      'Music': 'primary',
      'Movies': 'secondary',
      'Games': 'dark',
      'Other': 'light'
    };
    return colors[category] || colors['Other'];
  };

  return (
    <Card className="plan-card h-100">
      {/* Activity Image */}
      <div className="plan-image-container">
        <Card.Img 
          variant="top" 
          src={image || '/api/placeholder/300/200'} 
          alt={title}
          className="plan-image"
        />
        <div className="plan-category-badge">
          <Badge bg={getCategoryColor(category)} className="category-badge">
            <i className={`${getCategoryIcon(category)} me-1`}></i>
            {category}
          </Badge>
        </div>
      </div>

      <Card.Body className="d-flex flex-column">
        {/* Title and Description */}
        <div className="flex-grow-1">
          <Card.Title className="plan-title">{title}</Card.Title>
          <Card.Text className="plan-description text-muted">
            {description}
          </Card.Text>
        </div>

        {/* Activity Details */}
        <div className="plan-details mb-3">
          <Row className="g-2">
            <Col xs={12}>
              <div className="plan-detail-item">
                <i className="fas fa-calendar-alt text-primary me-2"></i>
                <span>{formatDate(date)}</span>
              </div>
            </Col>
            <Col xs={12}>
              <div className="plan-detail-item">
                <i className="fas fa-clock text-primary me-2"></i>
                <span>{formatTime(time)}</span>
              </div>
            </Col>
            <Col xs={12}>
              <div className="plan-detail-item">
                <i className="fas fa-map-marker-alt text-primary me-2"></i>
                <span className="plan-location">{location}</span>
              </div>
            </Col>
            <Col xs={12}>
              <div className="plan-detail-item">
                <i className="fas fa-users text-primary me-2"></i>
                <span>
                  {currentParticipants}/{maxParticipants} people
                </span>
              </div>
            </Col>
          </Row>
        </div>

        {/* Activity Creator */}
        <div className="plan-creator mb-3">
          <div className="d-flex align-items-center">
            <div className="creator-avatar me-2">
              <i className="fas fa-user-circle fa-2x text-muted"></i>
            </div>
            <div>
              <small className="text-muted">Created by</small>
              <div className="creator-name">{creator?.username || 'User'}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="plan-actions">
          <Row className="g-2">
            <Col xs={6}>
              <Button
                variant={isJoined ? "success" : "outline-success"}
                size="sm"
                className="w-100 plan-action-btn"
                onClick={() => onJoin && onJoin(id)}
                disabled={isJoined || currentParticipants >= maxParticipants}
              >
                <i className="fas fa-plus me-1"></i>
                {isJoined ? 'Joined' : 'Join'}
              </Button>
            </Col>
            <Col xs={6}>
              <Button
                variant={isInterested ? "warning" : "outline-warning"}
                size="sm"
                className="w-100 plan-action-btn"
                onClick={() => onInterest && onInterest(id)}
              >
                <i className="fas fa-heart me-1"></i>
                {isInterested ? 'Interested' : 'Interest'}
              </Button>
            </Col>
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
}
