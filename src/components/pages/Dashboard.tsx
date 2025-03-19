'use client';

import React from 'react';
import { Bell, Users, FileText, Eye } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { label: 'Active Data Rooms', value: '3', icon: FileText, color: 'bg-blue-500' },
    { label: 'Total Views', value: '247', icon: Eye, color: 'bg-green-500' },
    { label: 'Active Users', value: '12', icon: Users, color: 'bg-purple-500' },
  ];

  const notifications = [
    { message: 'Investor ABC viewed your pitch deck', time: '2 hours ago' },
    { message: 'New comment on financial projections', time: '5 hours ago' },
    { message: 'Data room "Series A" was accessed', time: '1 day ago' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button className="relative p-2 text-gray-600 hover:text-gray-900">
          <Bell className="w-6 h-6" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <div key={index} className="flex items-start border-b border-gray-100 pb-4 last:border-0">
              <div className="bg-blue-50 p-2 rounded-lg">
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-900">{notification.message}</p>
                <p className="text-xs text-gray-500">{notification.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;