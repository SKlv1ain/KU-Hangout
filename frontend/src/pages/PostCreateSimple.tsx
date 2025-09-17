import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../services/postService";
import "../styles/Login.css";

function PostCreateSimple() {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    event_time: "",
    max_people: "1",
    tags: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Activity types for dropdown
  const activityTypes = [
    { value: "sport", label: "🏃‍♂️ Sport & Fitness" },
    { value: "drink", label: "🍹 Drinks & Social" },
    { value: "study", label: "📚 Study & Academic" },
    { value: "food", label: "🍜 Food & Dining" },
    { value: "entertainment", label: "🎬 Entertainment & Movies" },
    { value: "outdoor", label: "🌳 Outdoor Activities" },
    { value: "gaming", label: "🎮 Gaming" },
    { value: "shopping", label: "🛍️ Shopping" },
    { value: "travel", label: "✈️ Travel & Exploration" },
    { value: "culture", label: "🎨 Arts & Culture" },
    { value: "music", label: "🎵 Music & Concerts" },
    { value: "volunteer", label: "🤝 Volunteering" },
    { value: "networking", label: "💼 Networking & Professional" },
    { value: "hobby", label: "🎯 Hobbies & Crafts" },
    { value: "wellness", label: "🧘‍♀️ Wellness & Mindfulness" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.title || formData.title.length < 3) {
      return "Title must be at least 3 characters";
    }
    if (!formData.description || formData.description.length < 10) {
      return "Description must be at least 10 characters";
    }
    if (!formData.location || formData.location.length < 3) {
      return "Location must be at least 3 characters";
    }
    if (!formData.event_time) {
      return "Please select event date and time";
    }
    if (!formData.tags) {
      return "Please select an activity type";
    }
    
    // Check if event time is at least 1 hour in the future
    const selectedDate = new Date(formData.event_time);
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    if (selectedDate <= oneHourFromNow) {
      return "Event time must be at least 1 hour from now";
    }
    
    // Check max_people is valid
    const maxPeople = parseInt(formData.max_people);
    if (maxPeople < 1 || maxPeople > 50) {
      return "Maximum people must be between 1 and 50";
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateForm();
    if (error) {
      setErrorMessage(error);
      return;
    }
    
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Convert selected tag string to array of objects
      const tagsArray = formData.tags ? [{ name: formData.tags }] : [];

      const response = await createPost({
        title: formData.title,
        description: formData.description,
        location: formData.location,
        event_time: formData.event_time,
        max_people: parseInt(formData.max_people),
        tags: tagsArray
      });

      setSuccessMessage(`🎉 Your "${formData.title}" plan has been created successfully!`);

      // Reset form
      setFormData({
        title: "",
        description: "",
        location: "",
        event_time: "",
        max_people: "1",
        tags: ""
      });

      // Optional: navigate to feed page
      // navigate("/feed");
    } catch (error: any) {
      if (error.response && error.response.data) {
        const backendErrors = error.response.data;

        if (backendErrors.tags) {
          setErrorMessage("Please select a valid activity type.");
        } else if (backendErrors.title) {
          setErrorMessage(backendErrors.title[0]);
        } else {
          setErrorMessage("Failed to create plan. Please check your input and try again.");
        }
      } else {
        setErrorMessage("Network error occurred. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 py-8">
      <div className="login-page max-w-2xl w-full mx-4">
        <h1 className="mb-6">Create New Hangout Plan 🎯</h1>
        
        <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-300 rounded-r-lg">
          <p className="text-sm text-orange-700">
            <strong>💡 Tip:</strong> Be specific about your plan so others know exactly what to expect. 
            The more details you provide, the better matches you'll get!
          </p>
        </div>

        {successMessage && (
          <div className="error-container mb-4">
            <p className="text-green-600 bg-green-50 border border-green-300 rounded-md px-3 py-2 text-sm">
              {successMessage}
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="error-container mb-4">
            <p className="error-text">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="form-label">What do you want to do?</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., Study for midterm exam, Play basketball, Grab dinner"
              maxLength={100}
            />
          </div>

          <div>
            <label className="form-label">Tell us more about your plan</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-input resize-none"
              rows={4}
              placeholder="Describe what you're planning to do, what to expect, or any special requirements..."
              maxLength={200}
            />
            <p className="text-sm text-gray-500 mt-1">{formData.description.length}/200 characters</p>
          </div>

          <div>
            <label className="form-label">Where will this happen?</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., KU Library 3rd floor, Central World Food Court, Lumpini Park"
              maxLength={100}
            />
          </div>

          <div>
            <label className="form-label">When do you want to meet?</label>
            <input
              type="datetime-local"
              name="event_time"
              value={formData.event_time}
              onChange={handleInputChange}
              className="form-input"
              min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
            />
          </div>

          <div>
            <label className="form-label">Maximum people (including yourself)</label>
            <input
              type="number"
              name="max_people"
              value={formData.max_people}
              onChange={handleInputChange}
              className="form-input"
              placeholder="How many people can join? (1-50)"
              min="1"
              max="50"
            />
          </div>

          <div>
            <label className="form-label">What type of activity is this?</label>
            <select
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="form-input"
            >
              <option value="">Select an activity type</option>
              {activityTypes.map((activity) => (
                <option key={activity.value} value={activity.value}>
                  {activity.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? "Creating Plan..." : "Create Plan & Find People 🚀"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Your plan will be visible to other KU students who are looking for similar activities.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            You can edit or cancel your plan anytime from your profile.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PostCreateSimple;
