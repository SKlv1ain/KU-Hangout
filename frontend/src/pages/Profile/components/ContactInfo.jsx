import React from 'react';

const ContactInfo = ({ userData }) => {
  const contactItems = [
    {
      label: 'Phone',
      value: userData.phone,
      icon: '📱',
      link: `tel:${userData.phone}`,
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200/50',
      iconColor: 'text-green-600',
      textColor: 'text-green-700'
    },
    {
      label: 'Address',
      value: userData.address,
      icon: '📍',
      multiline: true,
      bgColor: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200/50',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-700'
    },
    {
      label: 'Email',
      value: userData.email,
      icon: '✉️',
      link: `mailto:${userData.email}`,
      bgColor: 'from-cyan-50 to-blue-50',
      borderColor: 'border-cyan-200/50',
      iconColor: 'text-cyan-600',
      textColor: 'text-cyan-700'
    },
    {
      label: 'Website',
      value: userData.website,
      icon: '🌐',
      link: `https://${userData.website}`,
      bgColor: 'from-orange-50 to-yellow-50',
      borderColor: 'border-orange-200/50',
      iconColor: 'text-orange-600',
      textColor: 'text-orange-700'
    }
  ];

  return (
    <div className="bg-gradient-to-b from-white/60 to-cyan-50/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white text-xl">📞</span>
        </div>
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent">
            Contact Information
          </h3>
          <p className="text-sm text-gray-500">Ways to reach out</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {contactItems.map((item, index) => (
          <div key={index} className={`group relative bg-gradient-to-r ${item.bgColor} rounded-xl p-4 border ${item.borderColor} hover:shadow-lg transition-all duration-300 hover:scale-105`}>
            <div className="flex items-start space-x-4">
              <div className={`flex-shrink-0 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300 border border-white/50`}>
                <span className={`text-xl ${item.iconColor}`}>{item.icon}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-bold ${item.textColor} mb-1 uppercase tracking-wider`}>
                  {item.label}
                </div>
                
                {item.link ? (
                  <a
                    href={item.link}
                    className={`${item.textColor} hover:underline text-sm font-medium break-all transition-colors duration-200 hover:opacity-80`}
                    target={item.label === 'Website' ? '_blank' : undefined}
                    rel={item.label === 'Website' ? 'noopener noreferrer' : undefined}
                  >
                    {item.value}
                  </a>
                ) : (
                  <div className={`text-gray-700 text-sm font-medium ${item.multiline ? 'leading-relaxed' : ''}`}>
                    {item.value}
                  </div>
                )}
              </div>
              
              {/* Action indicator */}
              {item.link && (
                <div className={`flex-shrink-0 w-8 h-8 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${item.textColor}`}>
                  <span className="text-xs">→</span>
                </div>
              )}
            </div>
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        ))}
      </div>
      
      {/* Quick actions */}
      <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-cyan-600">⚡</span>
            <span className="text-sm font-medium text-cyan-800">Quick Actions</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 bg-white/60 backdrop-blur-sm rounded-lg text-xs font-medium text-cyan-700 hover:bg-white/80 transition-all duration-200 border border-cyan-200/50">
              Save Contact
            </button>
            <button className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-xs font-medium text-white hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 shadow-sm">
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
