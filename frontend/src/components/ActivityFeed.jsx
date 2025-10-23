import React from 'react';
import { Card, Row, Col, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import PlanCard from './PlanCard';
import '../styles/ActivityFeed.css';

export default function ActivityFeed({ activities, onJoin, onInterest, onLoadMore }) {
  const getActivityTypeIcon = (type) => {
    const icons = {
      'created': 'fas fa-plus-circle',
      'joined': 'fas fa-user-plus',
      'interested': 'fas fa-heart',
      'updated': 'fas fa-edit',
      'cancelled': 'fas fa-times-circle'
    };
    return icons[type] || icons['created'];
  };

  const getActivityTypeColor = (type) => {
    const colors = {
      'created': 'success',
      'joined': 'info',
      'interested': 'danger',
      'updated': 'warning',
      'cancelled': 'secondary'
    };
    return colors[type] || colors['created'];
  };

  const getActivityTypeText = (type) => {
    const texts = {
      'created': 'created a new activity',
      'joined': 'joined an activity',
      'interested': 'is interested in an activity',
      'updated': 'updated an activity',
      'cancelled': 'cancelled an activity'
    };
    return texts[type] || texts['created'];
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return activityTime.toLocaleDateString('en-US');
  };

  if (!activities || activities.length === 0) {
    return (
      <Card className="activity-feed-card">
        <Card.Header className="activity-feed-header">
          <h5 className="mb-0">
            <i className="fas fa-history me-2"></i>
            Recent Activities
          </h5>
        </Card.Header>
        <Card.Body className="text-center py-5">
          <div className="empty-state">
            <i className="fas fa-calendar-plus fa-3x text-muted mb-3"></i>
            <h6 className="text-muted mb-2">No activities yet</h6>
            <p className="text-muted mb-3">
              When you create or join activity plans, they will appear here
            </p>
            <Button as={Link} to="/create" variant="success" size="sm">
              <i className="fas fa-plus me-1"></i>
              Create First Activity
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="activity-feed">
      <Card className="activity-feed-card">
        <Card.Header className="activity-feed-header">
          <h5 className="mb-0">
            <i className="fas fa-history me-2"></i>
            Recent Activities
          </h5>
        </Card.Header>
        <Card.Body className="activity-feed-body">
          <div className="activity-list">
            {activities.map((activity, index) => (
              <div key={activity.id || index} className="activity-item">
                <div className="activity-meta">
                  <div className="activity-user">
                    <div className="user-avatar">
                      <i className="fas fa-user-circle fa-2x text-muted"></i>
                    </div>
                    <div className="activity-info">
                      <div className="activity-text">
                        <strong>{activity.user?.username || 'ผู้ใช้'}</strong>
                        <span className="activity-type">
                          <Badge 
                            bg={getActivityTypeColor(activity.type)} 
                            className="activity-type-badge"
                          >
                            <i className={`${getActivityTypeIcon(activity.type)} me-1`}></i>
                            {getActivityTypeText(activity.type)}
                          </Badge>
                        </span>
                      </div>
                      <div className="activity-time">
                        {formatTimeAgo(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {activity.plan && (
                  <div className="activity-plan">
                    <PlanCard 
                      plan={activity.plan}
                      onJoin={onJoin}
                      onInterest={onInterest}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {onLoadMore && (
            <div className="load-more-section text-center mt-4">
              <Button 
                variant="outline-success" 
                onClick={onLoadMore}
                className="load-more-btn"
              >
                <i className="fas fa-chevron-down me-1"></i>
                Load More
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
