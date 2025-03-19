'use client';

import React, { useState } from 'react';
import { Link, Clock, Shield, Copy, ExternalLink, Plus, Search, Calendar, Mail, X, Check, Eye, Download, MessageSquare, MoreVertical, Trash2, Settings } from 'lucide-react';
import ShareModal from '@/components/ShareModal';

interface AccessLink {
  id: string;
  name: string;
  url: string;
  type: 'Data Room' | 'Document' | 'Section';
  expiry: string;
  views: number;
  status: 'active' | 'expired';
  permissions: {
    view: boolean;
    download: boolean;
    comment: boolean;
  };
  security: {
    password: boolean;
    watermark: boolean;
    domainRestriction: boolean;
    trackAnalytics: boolean;
  };
  recipients: string[];
}

const AccessLinks = () => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired'>('all');
  const [selectedLink, setSelectedLink] = useState<AccessLink | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const links: AccessLink[] = [
    {
      id: '1',
      name: 'Series A Data Room',
      url: 'https://datavault.com/share/series-a',
      type: 'Data Room',
      expiry: '30 days',
      views: 24,
      status: 'active',
      permissions: {
        view: true,
        download: true,
        comment: true
      },
      security: {
        password: true,
        watermark: true,
        domainRestriction: true,
        trackAnalytics: true
      },
      recipients: ['investor@vc.com', 'partner@fund.com']
    },
    {
      id: '2',
      name: 'Pitch Deck 2024',
      url: 'https://datavault.com/share/pitch-deck',
      type: 'Document',
      expiry: '7 days',
      views: 15,
      status: 'active',
      permissions: {
        view: true,
        download: false,
        comment: false
      },
      security: {
        password: true,
        watermark: true,
        domainRestriction: false,
        trackAnalytics: true
      },
      recipients: ['analyst@venture.com']
    },
    {
      id: '3',
      name: 'Financial Projections',
      url: 'https://datavault.com/share/financials',
      type: 'Document',
      expiry: 'Expired',
      views: 8,
      status: 'expired',
      permissions: {
        view: true,
        download: true,
        comment: false
      },
      security: {
        password: true,
        watermark: true,
        domainRestriction: false,
        trackAnalytics: true
      },
      recipients: ['partner@investment.com']
    }
  ];

  const filteredLinks = links.filter(link => {
    const matchesSearch = link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.recipients.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || link.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    // You could add a toast notification here
  };

  const handleEditLink = (link: AccessLink) => {
    setSelectedLink(link);
    setShowShareModal(true);
    setActiveDropdown(null);
  };

  const handleDeleteLink = (linkId: string) => {
    // Handle link deletion
    setActiveDropdown(null);
  };

  const toggleDropdown = (linkId: string) => {
    setActiveDropdown(activeDropdown === linkId ? null : linkId);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Access Links</h1>
          <p className="text-sm text-gray-500">Manage and track shared access to your content</p>
        </div>
        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Link
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search links or recipients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  filterStatus === 'all'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  filterStatus === 'active'
                    ? 'bg-green-100 text-green-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus('expired')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  filterStatus === 'expired'
                    ? 'bg-red-100 text-red-900'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Expired
              </button>
            </div>
          </div>
        </div>

        {/* Links Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 bg-gray-50">
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Recipients</th>
                <th className="px-6 py-3">Expiry</th>
                <th className="px-6 py-3">Views</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLinks.map((link) => (
                <tr key={link.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <ExternalLink className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{link.name}</p>
                        <p className="text-xs text-gray-500">{link.url}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{link.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {link.recipients.map((recipient, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700"
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          {recipient}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-2" />
                      {link.expiry}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{link.views}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      link.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {link.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopyLink(link.url)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        title="Copy link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => toggleDropdown(link.id)}
                          className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                          title="More options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {activeDropdown === link.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                            <button
                              onClick={() => handleEditLink(link)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                              <Settings className="w-4 h-4 mr-2" />
                              Edit Settings
                            </button>
                            <button
                              onClick={() => handleCopyLink(link.url)}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Link
                            </button>
                            <button
                              onClick={() => handleDeleteLink(link.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Link
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          link={selectedLink}
          onClose={() => {
            setShowShareModal(false);
            setSelectedLink(null);
          }}
        />
      )}
    </div>
  );
};

export default AccessLinks;