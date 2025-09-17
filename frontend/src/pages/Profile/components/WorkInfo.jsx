import React from 'react';

const WorkInfo = ({ userData }) => {
  const skillColors = [
    'from-cyan-50 to-blue-50 border-cyan-200/50 text-cyan-700 hover:from-cyan-100 hover:to-blue-100',
    'from-teal-50 to-cyan-50 border-teal-200/50 text-teal-700 hover:from-teal-100 hover:to-cyan-100',
    'from-blue-50 to-indigo-50 border-blue-200/50 text-blue-700 hover:from-blue-100 hover:to-indigo-100',
    'from-indigo-50 to-purple-50 border-indigo-200/50 text-indigo-700 hover:from-indigo-100 hover:to-purple-100',
    'from-emerald-50 to-teal-50 border-emerald-200/50 text-emerald-700 hover:from-emerald-100 hover:to-teal-100'
  ];

  return (
    <div className="space-y-8">
      {/* Work Experience Section */}
      <div className="bg-gradient-to-b from-white/60 to-cyan-50/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">💼</span>
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-teal-700 to-cyan-700 bg-clip-text text-transparent">
              Work Experience
            </h3>
            <p className="text-sm text-gray-500">Professional background</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {userData.workExperience.map((work, index) => (
            <div key={index} className="group relative bg-gradient-to-r from-white/60 to-cyan-50/40 rounded-xl p-5 border border-cyan-200/30 hover:shadow-lg transition-all duration-300 hover:scale-105">
              {/* Left border accent */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${
                work.type === 'Primary' 
                  ? 'bg-gradient-to-b from-cyan-500 to-blue-500' 
                  : 'bg-gradient-to-b from-teal-400 to-cyan-400'
              }`}></div>
              
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                    work.type === 'Primary'
                      ? 'bg-gradient-to-r from-cyan-100 to-blue-100 border border-cyan-200/50'
                      : 'bg-gradient-to-r from-teal-100 to-cyan-100 border border-teal-200/50'
                  }`}>
                    <span className={`text-lg ${
                      work.type === 'Primary' ? 'text-cyan-600' : 'text-teal-600'
                    }`}>🏢</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800 group-hover:text-cyan-700 transition-colors duration-200">{work.title}</h4>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Company</p>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-xs font-bold border shadow-sm ${
                  work.type === 'Primary' 
                    ? 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 border-cyan-200/50' 
                    : 'bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 border-teal-200/50'
                }`}>
                  {work.type}
                </span>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-cyan-500 text-sm">📍</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  {work.address}
                </p>
              </div>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-gradient-to-b from-white/60 to-blue-50/30 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">🚀</span>
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              Skills & Expertise
            </h3>
            <p className="text-sm text-gray-500">Professional capabilities</p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {userData.skills.map((skill, index) => (
            <div
              key={index}
              className={`group relative bg-gradient-to-r ${skillColors[index % skillColors.length]} px-4 py-3 rounded-xl text-sm font-bold border transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer`}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-current rounded-full opacity-60"></div>
                <span>{skill}</span>
              </div>
              
              {/* Skill level indicator */}
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-current opacity-40 rounded-full"></div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>
        
        {/* Skills summary */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">💡</span>
              <span className="text-sm font-medium text-blue-800">Total Skills</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">{userData.skills.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkInfo;
