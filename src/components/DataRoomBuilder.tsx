'use client';

import React, { useState } from 'react';
import { X, Building2, FileText, LayoutGrid, Blocks, Eye, Share2 } from 'lucide-react';
import OrganizationProfile from '@/components/sections/OrganizationProfile';
import FeaturedDocuments from '@/components/sections/FeaturedDocuments';
import ContentHub from '@/components/sections/ContentHub';
import ElementsBlock from '@/components/sections/ElementsBlock';

interface DataRoomBuilderProps {
  onClose: () => void;
}

const DataRoomBuilder: React.FC<DataRoomBuilderProps> = ({ onClose }) => {
  const [sections, setSections] = useState<string[]>([]);
  const [showSectionPicker, setShowSectionPicker] = useState(false);

  const sectionTypes = [
    {
      id: 'organization-profile',
      name: 'Organization Profile',
      icon: Building2,
      description: 'Company overview, team, and key information'
    },
    {
      id: 'featured-documents',
      name: 'Featured Documents',
      icon: FileText,
      description: 'Highlight important documents and files'
    },
    {
      id: 'content-hub',
      name: 'Content Hub',
      icon: LayoutGrid,
      description: 'Organized collection of content and resources'
    },
    {
      id: 'elements-block',
      name: 'Elements Block',
      icon: Blocks,
      description: 'Rich text editor with advanced formatting options'
    }
  ];

  const addSection = (sectionId: string) => {
    setSections([...sections, sectionId]);
    setShowSectionPicker(false);
  };

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'organization-profile':
        return <OrganizationProfile />;
      case 'featured-documents':
        return <FeaturedDocuments />;
      case 'content-hub':
        return <ContentHub />;
      case 'elements-block':
        return <ElementsBlock />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-gray-50 overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">New Data Room</h1>
                <p className="text-sm text-gray-500">Build your custom data room</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </button>
              <button className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Builder Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {sections.length === 0 && (
          <button
            onClick={() => setShowSectionPicker(true)}
            className="w-full h-24 bg-indigo-100 rounded-xl border-2 border-dashed border-indigo-300 hover:bg-indigo-50 transition-colors mb-8"
          >
            <p className="text-indigo-700 font-medium">Add a Section</p>
          </button>
        )}

        {/* Section Picker Modal */}
        {showSectionPicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Layout Sections</h2>
                <button
                  onClick={() => setShowSectionPicker(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {sectionTypes.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => addSection(section.id)}
                    className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                  >
                    <div className="bg-indigo-100 p-2 rounded-lg">
                      <section.icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="ml-3 text-left">
                      <h3 className="font-medium text-gray-900">{section.name}</h3>
                      <p className="text-sm text-gray-500">{section.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Added Sections */}
        {sections.map((sectionId, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm mb-4"
          >
            {renderSection(sectionId)}
          </div>
        ))}

        {/* Add More Sections Button */}
        {sections.length > 0 && (
          <button
            onClick={() => setShowSectionPicker(true)}
            className="w-full h-16 bg-indigo-50 rounded-xl border-2 border-dashed border-indigo-200 hover:bg-indigo-100 transition-colors"
          >
            <p className="text-indigo-600 font-medium">+ Add Another Section</p>
          </button>
        )}
      </div>
    </div>
  );
};

export default DataRoomBuilder;