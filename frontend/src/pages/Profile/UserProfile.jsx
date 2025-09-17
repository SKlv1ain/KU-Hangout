import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext.jsx';
import ProfileHeader from './components/ProfileHeader';
import ProfileTabs from './components/ProfileTabs';
import ContactInfo from './components/ContactInfo';
import WorkInfo from './components/WorkInfo';
import BasicInfo from './components/BasicInfo';
import Timeline from './components/Timeline';
import Settings from './components/Settings';
import ProfileEditModal from './components/ProfileEditModal';
import userService from '@/services/userService.js';
import '@/styles/utilities.css'; // Utility classes for profile components

const UserProfile = () => {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('about');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // First try to get full profile data from API
        const profileData = await userService.getProfile();
        setUserData(profileData);
      } catch (error) {
        console.log('Using auth user data as fallback');
        // Fallback to auth user data with sample extended data
        setUserData({
          ...authUser,
          name: authUser?.username || "User",
          title: "KU Student",
          location: "Bangkok, Thailand",
          rating: 8.5,
          avatar: authUser?.avatar || "/api/placeholder/200/200",
          phone: authUser?.contact || "+66 XX XXX XXXX",
          address: "Kasetsart University, Bangkok, Thailand",
          email: authUser?.email || "user@ku.th",
          website: "ku.ac.th",
          birthday: "January 1, 2000",
          gender: "Prefer not to say",
          bio: "KU-Hangout user looking to connect with others.",
          workExperience: [
            {
              title: "Kasetsart University",
              type: "Primary",
              address: "Bangkok, Thailand"
            }
          ],
          skills: [
            "Communication",
            "Teamwork",
            "Problem Solving",
            "Leadership",
            "Creativity"
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    if (authUser) {
      fetchUserProfile();
    }
  }, [authUser]);

  const handleProfileUpdate = (updatedProfile) => {
    setUserData(updatedProfile);
  };

  if (loading || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch(activeTab) {
      case 'timeline':
        return <Timeline />;
      case 'about':
        return (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/2">
              <ContactInfo userData={userData} />
            </div>
            <div className="lg:w-1/2 space-y-8">
              <WorkInfo userData={userData} />
              <BasicInfo userData={userData} />
            </div>
          </div>
        );
      case 'contacts':
        return (
          <div className="bg-gradient-to-b from-white/60 to-teal-50/30 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white text-3xl">👥</span>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent mb-4">
              Contact Network
            </h3>
            <p className="text-gray-600 max-w-md mx-auto leading-relaxed mb-6">
              Manage your professional network, view mutual connections, and discover new opportunities to connect.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto">
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-200/30">
                <div className="text-2xl font-bold text-cyan-700">247</div>
                <div className="text-xs text-cyan-600 uppercase tracking-wider font-medium">Connections</div>
              </div>
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-200/30">
                <div className="text-2xl font-bold text-teal-700">42</div>
                <div className="text-xs text-teal-600 uppercase tracking-wider font-medium">Mutual</div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200/30">
                <div className="text-2xl font-bold text-blue-700">15</div>
                <div className="text-xs text-blue-600 uppercase tracking-wider font-medium">Pending</div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return <Settings />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
      {/* Floating geometric shapes for visual interest */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-cyan-200/30 to-blue-200/30 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 left-10 w-48 h-48 bg-gradient-to-r from-teal-200/20 to-cyan-200/20 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/3 w-20 h-20 bg-gradient-to-r from-blue-300/40 to-cyan-300/40 rounded-full blur-lg"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto p-4">
        {/* Modern Header */}
        <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 rounded-2xl shadow-2xl mb-6 overflow-hidden">
          <div className="relative px-8 py-6">
            {/* Header background pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-white/5 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
            
            <div className="relative flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <span className="text-white font-bold text-lg">KC</span>
                </div>
                <div>
                  <h1 className="font-bold text-xl">KU-Hangout</h1>
                  <p className="text-cyan-100 text-sm">Connect & Explore</p>
                </div>
              </div>
              <div className="flex items-center space-x-8">
                <div className="hidden md:flex items-center space-x-6">
                  <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <span>🔍</span>
                    <span className="text-sm">Find people</span>
                  </button>
                  <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer">
                    <span>💬</span>
                    <span className="text-sm">Messages</span>
                    <span className="bg-orange-400 text-xs px-2 py-1 rounded-full font-medium">4</span>
                  </div>
                  <button 
                    onClick={() => setEditModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    <span>✏️</span>
                    <span className="text-sm">Edit Profile</span>
                  </button>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full shadow-lg border-2 border-white/30"></div>
              </div>
            </div>
          </div>
        </div>

            {/* Profile Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Profile Header Section */}
            <div className="lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-200/50">
              <ProfileHeader 
                userData={userData} 
                onEditClick={() => setEditModalOpen(true)}
              />
            </div>
            
            {/* Main Content */}
            <div className="flex-1">
              <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
              <div className="p-8 bg-gradient-to-b from-white/50 to-cyan-50/30">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Edit Modal */}
      <ProfileEditModal 
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        userData={userData}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default UserProfile;
