import React from 'react';

const BasicInfo = ({ userData }) => {
  const basicInfoItems = [
    {
      label: 'Birthday',
      value: userData.birthday,
      icon: '🎂',
      bgColor: 'from-pink-50 to-rose-50',
      borderColor: 'border-pink-200/50',
      iconColor: 'text-pink-600',
      textColor: 'text-pink-700'
    },
    {
      label: 'Gender',
      value: userData.gender,
      icon: '👤',
      bgColor: 'from-indigo-50 to-blue-50',
      borderColor: 'border-indigo-200/50',
      iconColor: 'text-indigo-600',
      textColor: 'text-indigo-700'
    }
  ];

  // Calculate age from birthday
  const calculateAge = (birthday) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="bg-gradient-to-b from-white/60 to-indigo-50/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
          <span className="text-white text-xl">ℹ️</span>
        </div>
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
            Basic Information
          </h3>
          <p className="text-sm text-gray-500">Personal details</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {basicInfoItems.map((item, index) => (
          <div key={index} className={`group relative bg-gradient-to-r ${item.bgColor} rounded-xl p-4 border ${item.borderColor} hover:shadow-lg transition-all duration-300 hover:scale-105`}>
            <div className="flex items-center space-x-4">
              <div className={`flex-shrink-0 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300 border border-white/50`}>
                <span className={`text-xl ${item.iconColor}`}>{item.icon}</span>
              </div>
              
              <div className="flex-1">
                <div className={`text-sm font-bold ${item.textColor} mb-1 uppercase tracking-wider`}>
                  {item.label}
                </div>
                <div className="text-gray-700 text-lg font-semibold">
                  {item.value}
                  {item.label === 'Birthday' && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      (Age {calculateAge(item.value)})
                    </span>
                  )}
                </div>
              </div>
              
              {/* Decorative element */}
              <div className={`flex-shrink-0 w-8 h-8 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity duration-300 ${item.textColor}`}>
                <div className="w-2 h-2 bg-current rounded-full"></div>
              </div>
            </div>
            
            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        ))}
      </div>
      
      {/* Additional stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-200/30">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-700">
              {calculateAge(userData.birthday)}
            </div>
            <div className="text-xs text-cyan-600 uppercase tracking-wider font-medium">Years Old</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-200/30">
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-700">
              ✨
            </div>
            <div className="text-xs text-teal-600 uppercase tracking-wider font-medium">Verified</div>
          </div>
        </div>
      </div>
      
      {/* Profile completion indicator */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-green-600">✅</span>
            <span className="text-sm font-medium text-green-800">Profile Complete</span>
          </div>
          <div className="text-lg font-bold text-green-700">100%</div>
        </div>
        <div className="mt-2 w-full bg-green-200/50 rounded-full h-2">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full w-full"></div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfo;
