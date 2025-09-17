import React from 'react';

const ProfileHeader = ({ userData, onEditClick }) => {
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating / 2);
    const hasHalfStar = rating % 2 >= 1;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400 text-lg">★</span>
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400 text-lg">☆</span>
      );
    }
    
    // Fill remaining with empty stars to make 5 total
    const remainingStars = 4 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300 text-lg">☆</span>
      );
    }
    
    return stars;
  };

  return (
    <div className="w-full lg:w-80 bg-gradient-to-b from-white/60 to-cyan-50/40 backdrop-blur-sm p-8">
      {/* Profile Image */}
      <div className="flex justify-center mb-8">
        <div className="relative group">
          {/* Animated background rings */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300 animate-pulse"></div>
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl"></div>
          
          <div className="relative">
            <img
              src={userData.avatar}
              alt={userData.name}
              className="w-48 h-48 rounded-2xl object-cover shadow-2xl border-4 border-white/50 backdrop-blur-sm group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/200x200?text=' + encodeURIComponent(userData.name.split(' ').map(n => n[0]).join(''));
              }}
            />
            {/* Status indicator */}
            <div className="absolute bottom-4 right-4 w-6 h-6 bg-green-400 rounded-full border-3 border-white shadow-lg animate-pulse"></div>
            
            {/* Floating action button */}
            <button className="absolute top-3 right-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl p-2 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 border border-white/20">
              <span className="text-white text-lg">📍</span>
            </button>
          </div>
        </div>
      </div>

      {/* Name and Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-cyan-700 bg-clip-text text-transparent mb-2">
          {userData.name}
        </h1>
        <div className="inline-block bg-gradient-to-r from-cyan-100 to-blue-100 px-4 py-2 rounded-full border border-cyan-200/50 mb-3">
          <p className="text-cyan-700 font-medium text-sm">{userData.title}</p>
        </div>
        <p className="text-gray-600 text-sm flex items-center justify-center space-x-1 mb-4">
          <span className="text-cyan-500">📍</span>
          <span>{userData.location}</span>
        </p>
        
        {/* Rating */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/30 shadow-lg">
          <div className="flex items-center justify-center space-x-3">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                {userData.rating}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Rating</div>
            </div>
            <div className="h-8 w-px bg-gradient-to-b from-transparent via-cyan-300 to-transparent"></div>
            <div className="flex flex-col items-center">
              <div className="flex space-x-1">
                {renderStars(userData.rating)}
              </div>
              <div className="text-xs text-gray-500 mt-1">Reviews</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <button 
          onClick={onEditClick}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 border border-white/20"
        >
          <span className="text-lg">✏️</span>
          <span className="font-medium">Edit Profile</span>
        </button>
        
        <button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-4 px-6 rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl transform hover:scale-105 border border-white/20">
          <span className="text-lg">👥</span>
          <span className="font-medium">Add to Contacts</span>
        </button>
        
        <button className="w-full bg-white/60 backdrop-blur-sm text-cyan-700 py-3 px-6 rounded-xl hover:bg-white/80 transition-all duration-300 border border-cyan-200/50 text-sm font-medium hover:border-cyan-300/50">
          <span className="flex items-center justify-center space-x-2">
            <span>⚠️</span>
            <span>Report User</span>
          </span>
        </button>
      </div>

      {/* Additional Info Cards */}
      <div className="mt-8 space-y-4">
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-200/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-cyan-600">🌟</span>
              <span className="text-sm font-medium text-cyan-800">Trust Score</span>
            </div>
            <div className="text-lg font-bold text-cyan-700">95%</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-200/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-teal-600">⚡</span>
              <span className="text-sm font-medium text-teal-800">Response Time</span>
            </div>
            <div className="text-sm font-bold text-teal-700">&lt; 1 hour</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
