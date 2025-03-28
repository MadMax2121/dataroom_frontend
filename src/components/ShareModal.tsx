'use client';

import React, { useState } from 'react';
import { X, Calendar, Lock, Eye, Download, MessageSquare, Shield, Mail, Plus, Check, AlertTriangle, Copy, Link as LinkIcon } from 'lucide-react';
import { getAllUsers } from '@/lib/api';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

interface ShareModalProps {
  link?: {
    id: string;
    name: string;
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
  } | null;
  onClose: () => void;
}

interface SuccessPopupProps {
  url: string;
  onClose: () => void;
}

const SuccessPopup: React.FC<SuccessPopupProps> = ({ url, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Link Created Successfully!</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Your secure link has been created. Copy it to share with others.
        </p>

        <div className="flex items-center space-x-2 mb-6">
          <div className="flex-1 bg-gray-50 px-4 py-2 rounded-lg break-all">
            <div className="flex items-center">
              <LinkIcon className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-600">{url}</span>
            </div>
          </div>
          <button
            onClick={handleCopy}
            className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
              copied
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </>
            )}
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

const ShareModal: React.FC<ShareModalProps> = ({ link, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedContent, setSelectedContent] = useState(link?.name || '');
  const [permissions, setPermissions] = useState(link?.permissions || {
    view: true,
    download: false,
    comment: false
  });
  const [security, setSecurity] = useState(link?.security || {
    password: false,
    watermark: true,
    domainRestriction: false,
    trackAnalytics: true
  });
  const [recipients, setRecipients] = useState<string[]>(link?.recipients || []);
  const [newRecipient, setNewRecipient] = useState('');
  const [expiryDays, setExpiryDays] = useState('7');
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (step === 2) {
      fetchUsers();
    }
  }, [step]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(response?.items || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipient = () => {
    if (newRecipient && newRecipient.includes('@')) {
      setRecipients([...recipients, newRecipient]);
      setNewRecipient('');
    }
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients(recipients.filter(r => r !== email));
  };

  const handleCreate = () => {
    // Simulate link creation with a generated URL
    const newUrl = `https://datavault.com/share/${Math.random().toString(36).substr(2, 9)}`;
    setGeneratedUrl(newUrl);
    setShowSuccess(true);
  };

  if (showSuccess) {
    return (
      <SuccessPopup
        url={generatedUrl}
        onClose={() => {
          setShowSuccess(false);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {link ? 'Edit Share Settings' : 'Share Content'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Content to Share
                </label>
                <input
                  type="text"
                  value={selectedContent}
                  onChange={(e) => setSelectedContent(e.target.value)}
                  placeholder="Search for content..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Permissions</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={permissions.view}
                      onChange={(e) => setPermissions({ ...permissions, view: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Eye className="w-5 h-5 ml-3 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-700">View content</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={permissions.download}
                      onChange={(e) => setPermissions({ ...permissions, download: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Download className="w-5 h-5 ml-3 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-700">Download files</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={permissions.comment}
                      onChange={(e) => setPermissions({ ...permissions, comment: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <MessageSquare className="w-5 h-5 ml-3 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-700">Add comments</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Security Settings</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={security.password}
                      onChange={(e) => setSecurity({ ...security, password: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Lock className="w-5 h-5 ml-3 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-700">Password protection</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={security.watermark}
                      onChange={(e) => setSecurity({ ...security, watermark: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Shield className="w-5 h-5 ml-3 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-700">Add watermark</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={security.domainRestriction}
                      onChange={(e) => setSecurity({ ...security, domainRestriction: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <AlertTriangle className="w-5 h-5 ml-3 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-700">Restrict to specific domains</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Expiry
                </label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <select
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Recipients
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      value={newRecipient}
                      onChange={(e) => setNewRecipient(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                      placeholder="Enter email address"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleAddRecipient}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Recipients</h3>
                <div className="space-y-2">
                  {recipients.map((email, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">{email}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveRecipient(email)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add a Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter a message for the recipients..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50 rounded-b-xl">
          {step === 1 ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                Next
                <Check className="w-5 h-5 ml-2" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                {link ? 'Update Link' : 'Create Link'}
                <Check className="w-5 h-5 ml-2" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;