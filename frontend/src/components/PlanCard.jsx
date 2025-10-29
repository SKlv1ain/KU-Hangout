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
    isInterested = false,
    isExpired = false,
    timeUntilEvent = ''
  } = plan;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Bangkok'
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Bangkok'
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
      'Sports': 'success',      // Green
      'Food': 'warning',        // Yellow
      'Travel': 'info',         // Cyan
      'Art': 'danger',          // Red
      'Music': 'primary',       // Blue
      'Movies': 'secondary',    // Gray
      'Games': 'purple',        // Purple - High visibility
      'Other': 'teal'           // Teal - High visibility
    };
    return colors[category] || 'teal';
  };

  const getCategoryGradient = (category) => {
    const gradients = {
      'Sports': { start: '#22c55e', end: '#16a34a' },        // Green gradient
      'Food': { start: '#f59e0b', end: '#d97706' },         // Yellow/Orange gradient
      'Travel': { start: '#3b82f6', end: '#2563eb' },       // Blue gradient
      'Art': { start: '#ef4444', end: '#dc2626' },          // Red gradient
      'Music': { start: '#8b5cf6', end: '#7c3aed' },        // Purple gradient
      'Movies': { start: '#6b7280', end: '#4b5563' },       // Gray gradient
      'Games': { start: '#8b5cf6', end: '#6d28d9' },        // Purple gradient
      'Other': { start: '#14b8a6', end: '#0d9488' }         // Teal gradient
    };
    return gradients[category] || { start: '#14b8a6', end: '#0d9488' };
  };

  return (
    <Card className={`plan-card h-100 ${isExpired ? 'expired' : ''}`}>
      {/* Activity Image or Placeholder */}
      <div className="plan-image-container">
        {image ? (
          <Card.Img 
            variant="top" 
            src={image} 
            alt={title}
            className="plan-image"
          />
        ) : (
          <div className="plan-image-placeholder" style={{
            background: `linear-gradient(135deg, ${getCategoryGradient(category).start} 0%, ${getCategoryGradient(category).end} 100%)`
          }}>
            <div className="placeholder-content">
              <i className={`${getCategoryIcon(category)} placeholder-icon`}></i>
              <div className="placeholder-title">{title}</div>
              <div className="placeholder-location">
                <i className="fas fa-map-marker-alt me-1"></i>
                {location}
              </div>
            </div>
            <div className="placeholder-pattern"></div>
          </div>
        )}
        <div className="plan-category-badge">
          <Badge bg={getCategoryColor(category)} className="category-badge">
            <i className={`${getCategoryIcon(category)} me-1`}></i>
            {category}
          </Badge>
        </div>
        {/* Expired Badge */}
        {isExpired && (
          <div className="expired-badge">
            <Badge bg="danger" className="expired-text">
              <i className="fas fa-clock me-1"></i>
              Expired
            </Badge>
          </div>
        )}
        {/* Time Until Event */}
        {!isExpired && timeUntilEvent && (
          <div className="time-badge">
            <Badge bg="info" className="time-text">
              <i className="fas fa-hourglass-half me-1"></i>
              {timeUntilEvent}
            </Badge>
          </div>
        )}
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
                <span className="plan-location">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="location-link"
                    title="Open in Google Maps"
                  >
                    {location}
                    <i className="fas fa-external-link-alt ms-1"></i>
                  </a>
                </span>
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
                disabled={isJoined || currentParticipants >= maxParticipants || isExpired}
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
                disabled={isExpired}
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
