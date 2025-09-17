import React from 'react';

const ProfileTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'timeline', label: 'Timeline', icon: '📅', description: 'Activity feed' },
    { id: 'about', label: 'About', icon: '👤', description: 'Personal info' },
    { id: 'contacts', label: 'Contacts', icon: '📞', description: 'Contact details' },
    { id: 'settings', label: 'Settings', icon: '⚙️', description: 'Account settings' }
  ];

  return (
    <div className="relative bg-gradient-to-r from-white/60 to-cyan-50/30 backdrop-blur-sm border-b border-cyan-200/30">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5"></div>
      
      <div className="relative flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab, index) => (
          <div key={tab.id} className="relative flex-shrink-0">
            <button
              onClick={() => setActiveTab(tab.id)}
              className={`group relative flex items-center space-x-3 px-8 py-6 font-medium text-sm transition-all duration-300 min-w-fit ${
                activeTab === tab.id
                  ? 'text-cyan-700 bg-gradient-to-b from-white/80 to-cyan-50/60'
                  : 'text-gray-600 hover:text-cyan-600 hover:bg-gradient-to-b hover:from-white/40 hover:to-cyan-50/20'
              }`}
            >
              {/* Active tab background */}
              {activeTab === tab.id && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-t-2xl border border-cyan-200/50 border-b-0"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
                  {/* Connecting curve to content */}
                  <div className="absolute -bottom-px left-0 right-0 h-px bg-gradient-to-r from-cyan-50 to-blue-50"></div>
                </>
              )}
              
              {/* Tab content */}
              <div className="relative flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg transform scale-110'
                    : 'bg-gray-100 text-gray-500 group-hover:bg-gradient-to-r group-hover:from-cyan-100 group-hover:to-blue-100 group-hover:text-cyan-600'
                }`}>
                  <span className="text-lg">{tab.icon}</span>
                </div>
                
                <div className="text-left">
                  <div className={`font-semibold transition-colors duration-300 ${
                    activeTab === tab.id ? 'text-cyan-700' : 'text-gray-600 group-hover:text-cyan-600'
                  }`}>
                    {tab.label}
                  </div>
                  <div className={`text-xs transition-colors duration-300 ${
                    activeTab === tab.id ? 'text-cyan-600' : 'text-gray-400 group-hover:text-cyan-500'
                  }`}>
                    {tab.description}
                  </div>
                </div>
              </div>
              
              {/* Hover indicator */}
              {activeTab !== tab.id && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full group-hover:w-16 transition-all duration-300"></div>
              )}
            </button>
            
            {/* Separator */}
            {index < tabs.length - 1 && (
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-8 bg-gradient-to-b from-transparent via-cyan-200/50 to-transparent"></div>
            )}
          </div>
        ))}
        
        {/* Additional space for scrolling */}
        <div className="flex-shrink-0 w-4"></div>
      </div>
      
      {/* Bottom border gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent"></div>
    </div>
  );
};

export default ProfileTabs;
