'use client';

import React, { useState } from 'react';
import { Plus, FolderOpen, Users, Clock, Building2, FileText, LayoutGrid, Blocks } from 'lucide-react';
import DataRoomBuilder from '@/components/DataRoomBuilder';

const DataRooms = () => {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  
  const dataRooms = [
    {
      name: 'Series A Data Room',
      description: 'Complete fundraising package for Series A round',
      viewers: 8,
      lastAccessed: '2 hours ago',
      status: 'active'
    },
    {
      name: 'Investor Update Q1 2024',
      description: 'Quarterly update for current investors',
      viewers: 15,
      lastAccessed: '1 day ago',
      status: 'active'
    },
    {
      name: 'Due Diligence',
      description: 'Technical and financial due diligence documents',
      viewers: 4,
      lastAccessed: '3 days ago',
      status: 'draft'
    }
  ];

  if (isBuilderOpen) {
    return <DataRoomBuilder onClose={() => setIsBuilderOpen(false)} />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Data Rooms</h1>
        <button 
          onClick={() => setIsBuilderOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Data Room
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dataRooms.map((room, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center mb-4">
              <FolderOpen className="w-6 h-6 text-blue-500" />
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900">{room.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  room.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {room.status}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{room.description}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {room.viewers} viewers
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {room.lastAccessed}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DataRooms;