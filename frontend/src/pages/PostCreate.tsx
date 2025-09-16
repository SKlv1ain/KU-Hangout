import { z } from "zod";
import { useNavigate } from "react-router-dom";
import PostForm, { FormFieldConfig } from "../components/form/PostForm";

function PostCreate() {
  const navigate = useNavigate();

  // Activity types for the dropdown
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

  // Define form fields matching your plans model
  const postFields: FormFieldConfig[] = [
    {
      name: "title",
      label: "What do you want to do?",
      type: "text",
      placeholder: "e.g., Study for midterm exam, Play basketball, Grab dinner",
      validation: z.string()
        .min(3, "Title must be at least 3 characters")
        .max(100, "Title must be at most 100 characters")
    },
    {
      name: "description", 
      label: "Tell us more about your plan",
      type: "textarea",
      placeholder: "Describe what you're planning to do, what to expect, or any special requirements...",
      validation: z.string()
        .min(10, "Description must be at least 10 characters")
        .max(200, "Description must be at most 200 characters")
    },
    {
      name: "location",
      label: "Where will this happen?",
      type: "text", 
      placeholder: "e.g., KU Library 3rd floor, Central World Food Court, Lumpini Park",
      validation: z.string()
        .min(3, "Location must be at least 3 characters")
        .max(100, "Location must be at most 100 characters")
    },
    {
      name: "event_time",
      label: "When do you want to meet?",
      type: "datetime-local",
      validation: z.string()
        .refine((date) => {
          const selectedDate = new Date(date);
          const now = new Date();
          const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
          return selectedDate > oneHourFromNow;
        }, {
          message: "Event time must be at least 1 hour from now"
        })
    },
    {
      name: "max_people",
      label: "Maximum people (including yourself)",
      type: "number",
      placeholder: "How many people can join? (1-50)",
      validation: z.string()
        .refine((val) => {
          const num = parseInt(val);
          return num >= 1 && num <= 50;
        }, {
          message: "Must be between 1-50 people"
        })
    },
    {
      name: "tags",
      label: "What type of activity is this?",
      type: "select",
      placeholder: "Select an activity type",
      validation: z.string()
        .min(1, "Please select an activity type"),
      options: activityTypes
    }
  ];

  const handleSuccess = (data: any) => {
    console.log("Post created successfully:", data);
    // Show success message with some flair
    alert(`🎉 Your "${data.title}" plan has been created successfully!\n\nOthers can now find and join your activity. Check your notifications for new joiners!`);
    
    // Navigate to the post/plan detail page or back to feed
    // navigate(`/posts/${data.id}`); 
    // or navigate("/feed");
  };

  const handleError = (error: string) => {
    console.error("Failed to create post:", error);
    // Show user-friendly error message
    alert(`😞 Oops! Something went wrong: ${error}\n\nPlease check your information and try again.`);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 py-8">
      <div className="login-page max-w-2xl w-full mx-4">
        <h1 className="mb-6">Create New Hangout Plan 🎯</h1>
        
        {/* Helpful tip */}
        <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-300 rounded-r-lg">
          <p className="text-sm text-orange-700">
            <strong>💡 Tip:</strong> Be specific about your plan so others know exactly what to expect. 
            The more details you provide, the better matches you'll get!
          </p>
        </div>

        <PostForm
          title=""
          fields={postFields}
          endpoint="/api/plans/create/" // Adjust this to match your backend endpoint
          buttonText="Create Plan & Find People 🚀"
          onSuccess={handleSuccess}
          onError={handleError}
        />

        {/* Additional info */}
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

export default PostCreate;
