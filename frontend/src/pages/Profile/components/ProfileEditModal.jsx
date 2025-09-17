import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormInput from '@/components/FormInput.jsx';
import userService from '@/services/userService.js';

// Validation schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  title: z.string().min(2, 'Title must be at least 2 characters').max(100, 'Title must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[+]?[\d\s-()]{10,}$/, 'Invalid phone number'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  birthday: z.string().min(1, 'Birthday is required'),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to say']),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional()
});

const ProfileEditModal = ({ isOpen, onClose, userData, onProfileUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(userData?.avatar || '');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userData?.name || '',
      title: userData?.title || '',
      email: userData?.email || '',
      phone: userData?.phone || '',
      location: userData?.location || '',
      website: userData?.website || '',
      birthday: userData?.birthday ? new Date(userData.birthday).toISOString().split('T')[0] : '',
      gender: userData?.gender || 'Prefer not to say',
      address: userData?.address || '',
      bio: userData?.bio || ''
    }
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Upload avatar first if changed
      if (avatarFile) {
        const avatarResponse = await userService.uploadAvatar(avatarFile);
        data.avatar = avatarResponse.avatarUrl;
      }

      // Update profile
      const updatedProfile = await userService.updateProfile(data);
      onProfileUpdate(updatedProfile);
      onClose();
      reset();
    } catch (error) {
      console.error('Error updating profile:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setAvatarFile(null);
    setAvatarPreview(userData?.avatar || '');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      ></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] m-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <span className="text-white font-bold">✏️</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">Edit Profile</h2>
                <p className="text-cyan-100 text-sm">Update your personal information</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 hover:bg-white/30 transition-all duration-200"
            >
              <span className="text-white text-lg">✕</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <img
                  src={avatarPreview || 'https://via.placeholder.com/150x150?text=Avatar'}
                  alt="Profile"
                  className="w-32 h-32 rounded-2xl object-cover border-4 border-cyan-200 shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                />
                <label className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                  <span className="text-white text-sm font-medium">Change Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500">Click on photo to change avatar</p>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">
                  Basic Information
                </h3>
                
                <FormInput
                  label="Full Name"
                  error={errors.name?.message}
                  {...register('name')}
                />
                
                <FormInput
                  label="Professional Title"
                  error={errors.title?.message}
                  {...register('title')}
                />
                
                <FormInput
                  label="Email"
                  type="email"
                  error={errors.email?.message}
                  {...register('email')}
                />
                
                <FormInput
                  label="Phone"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
                
                <FormInput
                  label="Location"
                  error={errors.location?.message}
                  {...register('location')}
                />
                
                <FormInput
                  label="Website"
                  placeholder="https://example.com"
                  error={errors.website?.message}
                  {...register('website')}
                />
              </div>

              {/* Personal Details */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">
                  Personal Details
                </h3>
                
                <FormInput
                  label="Birthday"
                  type="date"
                  error={errors.birthday?.message}
                  {...register('birthday')}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                    {...register('gender')}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 resize-none"
                    {...register('address')}
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Tell others about yourself..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 resize-none"
                    {...register('bio')}
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditModal;
