'use client'
import React, { useState } from 'react';
import {
  UserCircle,
  Building2,
  CreditCard,
  Shield,
  Bell,
  FileText,
  Lock,
  Edit3,
  UserPlus,
  Mail,
  Phone,
  Globe,
  Users,
  Key,
  Smartphone,
  AlertTriangle,
  Upload,
  Calendar,
  Languages,
  Clock,
  CreditCard as PaymentIcon,
  Receipt,
  Download,
  ArrowDownCircle,
  Settings as SettingsIcon,
  ChevronDown,
  Plus,
  Trash2,
  Check,
  X,
  LogOut
} from 'lucide-react';

type Section = 'account' | 'organization' | 'billing' | 'security' | 'team';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
  status: 'active' | 'pending';
  permissions: {
    dataRooms: 'all' | string[];
    sections: string[];
  };
}

const Settings = () => {
  const [activeSection, setActiveSection] = useState<Section>('account');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const sections = [
    { id: 'account', label: 'Account Settings', icon: UserCircle },
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'team', label: 'Team Management', icon: Users },
    { id: 'billing', label: 'Plans & Billing', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      role: 'admin',
      status: 'active',
      permissions: {
        dataRooms: 'all',
        sections: ['all']
      }
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'editor',
      status: 'active',
      permissions: {
        dataRooms: ['Series A', 'Investor Updates'],
        sections: ['documents', 'analytics']
      }
    },
    {
      id: '3',
      name: 'Mike Brown',
      email: 'mike@example.com',
      role: 'viewer',
      status: 'pending',
      permissions: {
        dataRooms: ['Series A'],
        sections: ['documents']
      }
    }
  ]);

  const renderAccountSettings = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
          <p className="text-sm text-gray-500">Manage your account information and preferences</p>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('authToken');
            window.location.href = '/login';
          }}
          className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 flex items-center"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>
      
      <div className="space-y-6">
        {/* Profile Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <UserCircle className="w-12 h-12 text-gray-400" />
              </div>
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-1 border border-gray-200">
                <Edit3 className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">John Doe</h4>
              <p className="text-sm text-gray-500">john.doe@example.com</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 flex items-center">
                <input
                  type="email"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  defaultValue="john.doe@example.com"
                />
                <button className="ml-2 p-2 text-gray-400 hover:text-gray-500">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <div className="mt-1 flex items-center">
                <input
                  type="tel"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  defaultValue="+1 (555) 123-4567"
                />
                <button className="ml-2 p-2 text-gray-400 hover:text-gray-500">
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive updates about your account</p>
              </div>
              <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-blue-600 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span className="sr-only">Use setting</span>
                <span className="translate-x-5 pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out">
                  <span className="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ease-in-out" aria-hidden="true">
                    <svg className="h-3 w-3 text-blue-600" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                    </svg>
                  </span>
                </span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">Receive push notifications on your device</p>
              </div>
              <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span className="sr-only">Use setting</span>
                <span className="translate-x-5 pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out">
                  <span className="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity duration-200 ease-in-out" aria-hidden="true">
                    <svg className="h-3 w-3 text-gray-400" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
                    </svg>
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrganizationInfo = () => (
    <div className="space-y-8">
      {/* Organization Profile */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Organization Profile</h2>
        <div className="flex items-start space-x-6 mb-6">
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                <Building2 className="w-12 h-12 text-gray-400" />
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full border border-gray-200 shadow-sm hover:bg-gray-50">
                <Upload className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="flex-grow grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter organization name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>Software & Technology</option>
                <option>Healthcare</option>
                <option>Financial Services</option>
                <option>E-commerce</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Size
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>1-10 employees</option>
                <option>11-50 employees</option>
                <option>51-200 employees</option>
                <option>201-500 employees</option>
                <option>500+ employees</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Brief description of your organization"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Location</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option>United States</option>
              <option>Canada</option>
              <option>United Kingdom</option>
              <option>Germany</option>
              <option>France</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter city"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter street address"
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Additional Information</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Founded Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-500">
                <Globe className="w-5 h-5" />
              </span>
              <input
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter website URL"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeamManagement = () => (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
          <p className="text-sm text-gray-500">Manage your team and their access rights</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Invite Member
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data Room Access
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teamMembers.map((member) => (
              <tr key={member.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {member.avatar ? (
                        <img
                          className="h-10 w-10 rounded-full"
                          src={member.avatar}
                          alt=""
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-xl font-medium text-gray-600">
                            {member.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {member.name}
                      </div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    className="text-sm text-gray-900 bg-transparent border-0 cursor-pointer focus:ring-0"
                    defaultValue={member.role}
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    member.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {member.permissions.dataRooms === 'all' ? (
                    'All Data Rooms'
                  ) : (
                    <span>{member.permissions.dataRooms.length} Data Rooms</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 mr-3">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-900">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Invite Team Member</h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Room Access
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="all">All Data Rooms</option>
                  <option value="specific">Specific Data Rooms</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Send Invitation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderBillingSettings = () => (
    <div className="space-y-8">
      {/* Current Plan */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Current Plan</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Pro Plan</h3>
              <p className="text-sm text-gray-500 mt-1">Perfect for growing businesses</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">$99</p>
              <p className="text-sm text-gray-500">per month</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center text-sm text-gray-600">
              <Check className="w-5 h-5 text-green-500 mr-2" />
              10 Data Rooms
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Check className="w-5 h-5 text-green-500 mr-2" />
              50GB Storage
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Check className="w-5 h-5 text-green-500 mr-2" />
              Advanced Analytics
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Next billing date: March 1, 2024
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>

      {/* Usage Overview */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Usage Continuing with the Settings.tsx file content exactly where we left off:

        Overview</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Storage Usage</h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    32.5 GB used
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-gray-600">
                    50 GB total
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                <div
                  style={{ width: "65%" }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                ></div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Data Rooms</h3>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    7 active
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-gray-600">
                    10 total
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100">
                <div
                  style={{ width: "70%" }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Method</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                <PaymentIcon className="w-6 h-6 text-gray-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">•••• •••• •••• 4242</p>
                <p className="text-sm text-gray-500">Expires 12/24</p>
              </div>
            </div>
            <button className="text-sm text-blue-600 hover:text-blue-700">
              Update
            </button>
          </div>
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Billing Address</p>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                Edit
              </button>
            </div>
            <p className="text-sm text-gray-900 mt-2">
              123 Business Street<br />
              Suite 100<br />
              San Francisco, CA 94107<br />
              United States
            </p>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Billing History</h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                {
                  date: 'Feb 1, 2024',
                  description: 'Pro Plan - Monthly',
                  amount: '$99.00'
                },
                {
                  date: 'Jan 1, 2024',
                  description: 'Pro Plan - Monthly',
                  amount: '$99.00'
                },
                {
                  date: 'Dec 1, 2023',
                  description: 'Pro Plan - Monthly',
                  amount: '$99.00'
                }
              ].map((invoice, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Subscription */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Cancel Subscription</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-4">
            Warning: Canceling your subscription will immediately revoke access to premium features.
            Your data will be retained for 30 days after cancellation.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
          >
            Cancel Subscription
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cancel Subscription
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to cancel your subscription? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Keep Subscription
                </button>
                <button
                  onClick={() => {
                    // Handle cancellation
                    setShowDeleteConfirm(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-8">
      {/* Password Change */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Confirm new password"
              />
            </div>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Update Password
            </button>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Two-Factor Authentication</h2>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Enable
            </button>
          </div>
          <div className="text-sm text-gray-500">
            <p>When enabled, you'll be required to enter a security code in addition to your password when logging in.</p>
          </div>
        </div>
      </div>

      {/* Login History */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Login History</h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                {
                  date: 'Feb 15, 2024 09:23 AM',
                  device: 'Chrome on MacOS',
                  location: 'San Francisco, US',
                  status: 'success'
                },
                {
                  date: 'Feb 14, 2024 03:15 PM',
                  device: 'Safari on iPhone',
                  location: 'San Francisco, US',
                  status: 'success'
                },
                {
                  date: 'Feb 13, 2024 11:45 AM',
                  device: 'Firefox on Windows',
                  location: 'New York, US',
                  status: 'failed'
                }
              ].map((login, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {login.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {login.device}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {login.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      login.status === 'success'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {login.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Log */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Log</h2>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">Recent Activity</h4>
              <button className="text-sm text-blue-600 hover:text-blue-700">View All</button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {[
              { action: 'Password changed', time: '2 hours ago', icon: Lock },
              { action: 'New device authorized', time: '1 day ago', icon: Smartphone },
              { action: 'Security settings updated', time: '3 days ago', icon: Shield }
            ].map((activity, index) => (
              <div key={index} className="p-4 flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                  <activity.icon className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
              </div>
              <nav className="p-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id as Section)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                      activeSection === section.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <section.icon className="w-5 h-5 mr-3" />
                    {section.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-12 md:col-span-9">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              {activeSection === 'account' && renderAccountSettings()}
              {activeSection === 'organization' && renderOrganizationInfo()}
              {activeSection === 'team' && renderTeamManagement()}
              {activeSection === 'billing' && renderBillingSettings()}
              {activeSection === 'security' && renderSecuritySettings()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;