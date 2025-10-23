import React from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/CompactUserProfile.css';

export default function CompactUserProfile({ user, onEditProfile }) {
  const {
    username,
    avatar
  } = user || {};

  return (
    <div className="compact-user-profile">
      <div className="profile-avatar">
        {avatar ? (
          <img 
            src={avatar} 
            alt={username}
            className="avatar-image"
          />
        ) : (
          <div className="avatar-placeholder">
            <i className="fas fa-user"></i>
          </div>
        )}
      </div>
      
      <div className="profile-info">
        <h6 className="profile-name">{username || 'User'}</h6>
      </div>
      
      <div className="profile-action">
        <Button 
          as={Link}
          to="/profile/edit"
          variant="outline-primary" 
          size="sm"
          className="edit-profile-btn"
        >
          <i className="fas fa-edit me-1"></i>
          Edit Profile
        </Button>
      </div>
    </div>
  );
}
