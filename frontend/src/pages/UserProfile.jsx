import React, { useState, useEffect, useRef } from 'react';
import { 
  getCurrentUserProfile, 
  updateUserProfile, 
  updateProfilePicture
} from '../services/userProfileService';
import { Container, Row, Col, Card, Form, Button, Alert, Image, Spinner } from 'react-bootstrap';
import CustomNavbar from '../components/Navbar.jsx';
import '../styles/UserProfile.css';

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  // Helper function to get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/api/placeholder/150/150';
    if (imagePath.startsWith('http')) return imagePath;
    // Convert relative path to full URL
    return `http://localhost:8000${imagePath}`;
  };

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    contact: '',
    role: 'user'
  });

  // Load user profile on component mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getCurrentUserProfile();
      const userData = response.user || response; // Handle both formats
      const storedDisplay = localStorage.getItem('kh_display_name') || '';
      const resolvedDisplayName = (userData.display_name ?? storedDisplay) || '';

      setProfile(userData);
      setFormData({
        username: userData.username || '',
        contact: userData.contact || '',
        role: userData.role || 'user',
        display_name: resolvedDisplayName
      });
      // Keep local cache in sync if backend provides the field
      if (userData.display_name) {
        localStorage.setItem('kh_display_name', userData.display_name);
      } else if (!storedDisplay && resolvedDisplayName) {
        localStorage.setItem('kh_display_name', resolvedDisplayName);
      }
    } catch (err) {
      setError('Failed to load profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      setError('');
      setSuccess('');

      const updatedProfile = await updateUserProfile(profile.id, formData);
      setProfile(updatedProfile);

      // Persist display name locally if present
      if (formData.display_name) {
        localStorage.setItem('kh_display_name', formData.display_name);
      }

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    // Show immediate preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target.result);
    };
    reader.readAsDataURL(file);

    try {
      setUpdating(true);
      setError('');
      setSuccess('');

      const updatedProfile = await updateProfilePicture(profile.id, file);
      
      // Debug: Log the response to see what we're getting
      console.log('Updated profile:', updatedProfile);
      
      // Update profile and keep the preview image until we confirm the new URL works
      setProfile(updatedProfile);
      
      // Force image refresh by reloading profile data
      setTimeout(async () => {
        try {
          const refreshedProfile = await getCurrentUserProfile();
          const userData = refreshedProfile.user || refreshedProfile;
          setProfile(userData);
          setPreviewImage(null); // Now clear the preview
        } catch (err) {
          console.error('Failed to refresh profile:', err);
          // Keep the preview image if refresh fails
        }
      }, 500);
      setSuccess('Profile picture updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile picture: ' + err.message);
      setPreviewImage(null); // Clear preview on error
    } finally {
      setUpdating(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'danger';
      case 'leader': return 'warning';
      case 'participant': return 'info';
      default: return 'secondary';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <i className="fas fa-shield-alt"></i>;
      case 'leader': return <i className="fas fa-star"></i>;
      case 'participant': return <i className="fas fa-user"></i>;
      default: return <i className="fas fa-user"></i>;
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container>
        <Alert variant="danger">
          <Alert.Heading>Profile Not Found</Alert.Heading>
          <p>Unable to load your profile. Please try logging in again.</p>
        </Alert>
      </Container>
    );
  }

  const displayedName = (formData.display_name || formData.username || '') || '';

  return (
    <>
      <CustomNavbar />
      <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8} md={10}>
          <Card className="shadow profile-card">
            <Card.Header className="bg-primary text-white">
              <h3 className="mb-0">
                <i className="fas fa-user me-2"></i>
                My Profile
              </h3>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
              {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

              {/* Profile Picture Section */}
              <div className="text-center mb-4">
                <div className="position-relative d-inline-block profile-picture-container">
                  <Image
                    src={previewImage || getImageUrl(profile.profile_picture)}
                    alt="Profile Picture"
                    roundedCircle
                    width={150}
                    height={150}
                    className="border border-3 border-light shadow profile-picture"
                    style={{ objectFit: 'cover', opacity: updating ? 0.7 : 1 }}
                  />
                  {updating && (
                    <div className="position-absolute top-50 start-50 translate-middle">
                      <Spinner animation="border" size="sm" variant="primary" />
                    </div>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    className="position-absolute bottom-0 end-0 rounded-circle camera-button"
                    style={{ width: '40px', height: '40px' }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={updating}
                  >
                    <i className="fas fa-camera"></i>
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                {updating && (
                  <div className="mt-2">
                    <Spinner size="sm" animation="border" />
                    <small className="ms-2 text-muted">Uploading...</small>
                  </div>
                )}
                {displayedName && (
                  <div className="mt-2">
                    <h4 className="mb-0">{displayedName}</h4>
                  </div>
                )}
              </div>

              {/* Profile Info Cards */}
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="h-100 border-0 bg-light profile-info-card">
                    <Card.Body className="text-center">
                      <i className="fas fa-star text-warning mb-2" style={{ fontSize: '24px' }}></i>
                      <h6 className="text-muted mb-1">Average Rating</h6>
                      <h4 className="mb-0">{profile.avg_rating || '0.00'}</h4>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="h-100 border-0 bg-light profile-info-card">
                    <Card.Body className="text-center">
                      <i className="fas fa-user text-info mb-2" style={{ fontSize: '24px' }}></i>
                      <h6 className="text-muted mb-1">Total Reviews</h6>
                      <h4 className="mb-0">{profile.review_count || 0}</h4>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Profile Form */}
              <Form onSubmit={handleProfileUpdate}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="d-flex align-items-center">
                        <i className="fas fa-user me-2"></i> Username
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="d-flex align-items-center">
                        <i className="fas fa-user-tag me-2"></i> Display Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="display_name"
                        value={formData.display_name || ''}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        {getRoleIcon(formData.role)}
                        <span className="ms-2">Role</span>
                      </Form.Label>
                      <div>
                        <span className={`badge bg-${getRoleColor(formData.role)} fs-6`}>
                          {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
                        </span>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-phone me-2"></i>
                    Contact Information
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Phone number, email, or other contact info"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>
                    <i className="fas fa-calendar-alt me-2"></i>
                    Member Since
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={new Date(profile.created_at || profile.date_joined).toLocaleDateString()}
                    disabled
                    readOnly
                  />
                </Form.Group>

                {/* Action Buttons */}
                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  {!isEditing ? (
                    <Button
                      variant="primary"
                      onClick={() => setIsEditing(true)}
                      disabled={updating}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline-secondary"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            username: profile.username || '',
                            contact: profile.contact || '',
                            role: profile.role || 'user'
                          });
                          setError('');
                        }}
                        disabled={updating}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={updating}
                      >
                        {updating ? (
                          <>
                            <Spinner size="sm" animation="border" className="me-2" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      </Container>
    </>
  );
};

export default UserProfile;