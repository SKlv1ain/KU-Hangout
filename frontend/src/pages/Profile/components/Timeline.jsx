import React, { useEffect, useState } from 'react';
import userService from '@/services/userService.js';

const Timeline = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const data = await userService.getTimeline(1, 10);
        setItems(data.items || []);
      } catch (err) {
        setError('Failed to load timeline');
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">{error}</div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-gradient-to-b from-white/60 to-cyan-50/30 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg text-center">
        <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-white text-3xl">📭</span>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-700 to-blue-700 bg-clip-text text-transparent mb-2">
          No activity yet
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          When you create plans, join events, or connect with friends, your activity will show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-200 via-blue-200 to-transparent rounded-full" />
      <div className="space-y-8">
        {items.map((item, idx) => (
          <div key={idx} className="relative">
            <div className="flex md:items-center md:justify-center">
              <div className="hidden md:block md:w-1/2 md:pr-8 md:text-right">
                <div className="inline-block bg-gradient-to-r from-white/60 to-cyan-50/40 backdrop-blur-sm rounded-xl p-4 border border-cyan-200/50 shadow">
                  <div className="text-sm font-semibold text-gray-800">{item.title || 'Activity'}</div>
                  <div className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleString()}</div>
                </div>
              </div>

              <div className="relative z-10 w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full border-4 border-white shadow-md"></div>

              <div className="md:w-1/2 md:pl-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow">
                  <div className="text-gray-700 text-sm">{item.description || 'You have a new update'}</div>
                  {item.meta && (
                    <div className="mt-2 text-xs text-gray-500">{item.meta}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;

