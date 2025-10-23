import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import '../styles/CreateActivityModal.css';

export default function CreateActivityModal({ show, onHide, onCreateActivity }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    time: '',
    location: '',
    maxParticipants: '',
    image: null
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: '', label: 'Select Category' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Food', label: 'Food' },
    { value: 'Travel', label: 'Travel' },
    { value: 'Art', label: 'Art' },
    { value: 'Music', label: 'Music' },
    { value: 'Movies', label: 'Movies' },
    { value: 'Games', label: 'Games' },
    { value: 'Other', label: 'Other' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.maxParticipants || formData.maxParticipants < 2) {
      newErrors.maxParticipants = 'Maximum participants must be at least 2';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare activity data
      const activityData = {
        ...formData,
        maxParticipants: parseInt(formData.maxParticipants),
        currentParticipants: 1, // Creator is automatically included
        creator: { username: 'testuser' }, // Mock creator
        isJoined: true,
        isInterested: false
      };

      await onCreateActivity(activityData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        date: '',
        time: '',
        location: '',
        maxParticipants: '',
        image: null
      });
      setErrors({});
      
    } catch (error) {
      console.error('Error creating activity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      date: '',
      time: '',
      location: '',
      maxParticipants: '',
      image: null
    });
    setErrors({});
    onHide();
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose}
      size="lg"
      centered
      className="create-activity-modal"
    >
      <Modal.Header closeButton className="modal-header">
        <Modal.Title>
          <i className="fas fa-plus-circle me-2"></i>
          Create New Activity
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="modal-body">
        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            {/* Title */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="form-label">
                  <i className="fas fa-heading me-1"></i>
                  Activity Title *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter activity title..."
                  className={errors.title ? 'is-invalid' : ''}
                />
                {errors.title && (
                  <Form.Control.Feedback type="invalid">
                    {errors.title}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            {/* Description */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="form-label">
                  <i className="fas fa-align-left me-1"></i>
                  Description *
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your activity..."
                  className={errors.description ? 'is-invalid' : ''}
                />
                {errors.description && (
                  <Form.Control.Feedback type="invalid">
                    {errors.description}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            {/* Category and Max Participants */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="form-label">
                  <i className="fas fa-tags me-1"></i>
                  Category *
                </Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={errors.category ? 'is-invalid' : ''}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </Form.Select>
                {errors.category && (
                  <Form.Control.Feedback type="invalid">
                    {errors.category}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="form-label">
                  <i className="fas fa-users me-1"></i>
                  Max Participants *
                </Form.Label>
                <Form.Control
                  type="number"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleInputChange}
                  placeholder="e.g., 10"
                  min="2"
                  max="100"
                  className={errors.maxParticipants ? 'is-invalid' : ''}
                />
                {errors.maxParticipants && (
                  <Form.Control.Feedback type="invalid">
                    {errors.maxParticipants}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            {/* Date and Time */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="form-label">
                  <i className="fas fa-calendar-alt me-1"></i>
                  Date *
                </Form.Label>
                <Form.Control
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={errors.date ? 'is-invalid' : ''}
                />
                {errors.date && (
                  <Form.Control.Feedback type="invalid">
                    {errors.date}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="form-label">
                  <i className="fas fa-clock me-1"></i>
                  Time *
                </Form.Label>
                <Form.Control
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className={errors.time ? 'is-invalid' : ''}
                />
                {errors.time && (
                  <Form.Control.Feedback type="invalid">
                    {errors.time}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            {/* Location */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="form-label">
                  <i className="fas fa-map-marker-alt me-1"></i>
                  Location *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter location..."
                  className={errors.location ? 'is-invalid' : ''}
                />
                {errors.location && (
                  <Form.Control.Feedback type="invalid">
                    {errors.location}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            {/* Image Upload */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="form-label">
                  <i className="fas fa-image me-1"></i>
                  Activity Image (Optional)
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="form-control-file"
                />
                <Form.Text className="text-muted">
                  Upload an image to make your activity more attractive
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      
      <Modal.Footer className="modal-footer">
        <Button 
          variant="secondary" 
          onClick={handleClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          variant="success" 
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="create-btn"
        >
          {isSubmitting ? (
            <>
              <i className="fas fa-spinner fa-spin me-2"></i>
              Creating...
            </>
          ) : (
            <>
              <i className="fas fa-plus me-2"></i>
              Create Activity
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
