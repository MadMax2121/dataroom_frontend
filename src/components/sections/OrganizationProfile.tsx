import React, { useState } from 'react';
import { X, Upload, Trash2, Globe, Linkedin, Instagram, Building2, Edit3 } from 'lucide-react';

interface OrganizationProfileProps {
  onClose?: () => void;
}

interface SocialLink {
  platform: string;
  url: string;
}

interface OrganizationData {
  logo: string | null;
  backgroundPhoto: string | null;
  companyName: string;
  launchDate: string;
  stage: string;
  location: string;
  teamSize: string;
  raising: string;
  committed: string;
  tagline: string;
  industryTags: string[];
  secondaryTags: string[];
  socialLinks: SocialLink[];
}

const OrganizationProfile: React.FC<OrganizationProfileProps> = ({ onClose }) => {
  const [isEditing, setIsEditing] = useState(true);
  const [data, setData] = useState<OrganizationData>({
    logo: null,
    backgroundPhoto: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
    companyName: '',
    launchDate: '',
    stage: 'Seed',
    location: '',
    teamSize: '1 - 10 people',
    raising: '',
    committed: '',
    tagline: '',
    industryTags: [],
    secondaryTags: [],
    socialLinks: [
      { platform: 'Website', url: '' },
      { platform: 'LinkedIn', url: '' },
      { platform: 'Instagram', url: '' },
      { platform: 'Crunchbase', url: '' },
      { platform: 'AngelList', url: '' }
    ]
  });

  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState<'industry' | 'secondary' | null>(null);

  const handleInputChange = (field: keyof OrganizationData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform: string, url: string) => {
    setData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map(link => 
        link.platform === platform ? { ...link, url } : link
      )
    }));
  };

  const addNewSocialLink = () => {
    setData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: '', url: '' }]
    }));
  };

  const removeTag = (tag: string, type: 'industry' | 'secondary') => {
    setData(prev => ({
      ...prev,
      [type === 'industry' ? 'industryTags' : 'secondaryTags']: 
        prev[type === 'industry' ? 'industryTags' : 'secondaryTags'].filter(t => t !== tag)
    }));
  };

  const addTag = (type: 'industry' | 'secondary') => {
    if (newTag.trim()) {
      setData(prev => ({
        ...prev,
        [type === 'industry' ? 'industryTags' : 'secondaryTags']: [
          ...prev[type === 'industry' ? 'industryTags' : 'secondaryTags'],
          newTag.trim()
        ]
      }));
      setNewTag('');
      setShowTagInput(null);
    }
  };

  const handleFileUpload = (type: 'logo' | 'backgroundPhoto') => {
    // In a real implementation, this would handle file uploads
    console.log(`Uploading ${type}`);
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="relative">
        {/* Background Image */}
        <div className="h-48 w-full rounded-t-xl overflow-hidden">
          {data.backgroundPhoto ? (
            <img 
              src={data.backgroundPhoto} 
              alt="Company background" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100" />
          )}
        </div>

        {/* Edit Button */}
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-4 right-4 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
        >
          <Edit3 className="w-5 h-5 text-gray-600" />
        </button>

        {/* Logo and Company Info */}
        <div className="px-8 pb-8">
          <div className="flex items-start -mt-12">
            <div className="w-24 h-24 rounded-xl bg-white shadow-lg flex items-center justify-center overflow-hidden">
              {data.logo ? (
                <img src={data.logo} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-300">
                    {data.companyName.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            <div className="ml-6 pt-12">
              <h1 className="text-2xl font-bold text-gray-900">{data.companyName}</h1>
              <p className="text-gray-600 mt-1">{data.tagline}</p>
            </div>
          </div>

          {/* Company Details */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Launch date</p>
              <p className="font-medium">{data.launchDate || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Stage</p>
              <p className="font-medium">{data.stage}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-medium">{data.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Team size</p>
              <p className="font-medium">{data.teamSize}</p>
            </div>
            {data.raising && (
              <div>
                <p className="text-sm text-gray-500">Raising</p>
                <p className="font-medium">{data.raising}</p>
              </div>
            )}
            {data.committed && (
              <div>
                <p className="text-sm text-gray-500">Committed</p>
                <p className="font-medium">{data.committed}</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {(data.industryTags.length > 0 || data.secondaryTags.length > 0) && (
            <div className="mt-6">
              <div className="flex flex-wrap gap-2">
                {data.industryTags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
                {data.secondaryTags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {data.socialLinks.some(link => link.url) && (
            <div className="mt-6">
              <div className="flex space-x-4">
                {data.socialLinks.map((link, index) => 
                  link.url && (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {link.platform === 'Website' && <Globe className="w-5 h-5" />}
                      {link.platform === 'LinkedIn' && <Linkedin className="w-5 h-5" />}
                      {link.platform === 'Instagram' && <Instagram className="w-5 h-5" />}
                      {link.platform === 'Crunchbase' && <Building2 className="w-5 h-5" />}
                      {link.platform === 'AngelList' && <Building2 className="w-5 h-5" />}
                    </a>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Your Organization Profile</h2>
          <p className="text-sm text-gray-500">Here you can edit the information about your company to be displayed in the header section.</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Logo</h3>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              {data.logo ? (
                <img src={data.logo} alt="Logo" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="text-3xl font-bold text-gray-400">T</div>
              )}
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => handleFileUpload('logo')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload new
              </button>
              <button className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center">
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Background photo</h3>
          <div className="flex items-center space-x-4">
            <div className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden">
              {data.backgroundPhoto ? (
                <img src={data.backgroundPhoto} alt="Background" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => handleFileUpload('backgroundPhoto')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload new
              </button>
              <button className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center">
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company name*
            </label>
            <input
              type="text"
              value={data.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter company name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Launch date
            </label>
            <input
              type="month"
              value={data.launchDate}
              onChange={(e) => handleInputChange('launchDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stage
            </label>
            <select
              value={data.stage}
              onChange={(e) => handleInputChange('stage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option>Pre-seed</option>
              <option>Seed</option>
              <option>Series A</option>
              <option>Series B</option>
              <option>Series C+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location*
            </label>
            <input
              type="text"
              value={data.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="City, Country"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team size*
            </label>
            <select
              value={data.teamSize}
              onChange={(e) => handleInputChange('teamSize', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option>1 - 10 people</option>
              <option>11 - 50 people</option>
              <option>51 - 200 people</option>
              <option>201 - 500 people</option>
              <option>500+ people</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raising
            </label>
            <input
              type="text"
              value={data.raising}
              onChange={(e) => handleInputChange('raising', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="$ Amount"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Committed
            </label>
            <input
              type="text"
              value={data.committed}
              onChange={(e) => handleInputChange('committed', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="$ Amount"
            />
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tagline*</h3>
        <input
          type="text"
          value={data.tagline}
          onChange={(e) => handleInputChange('tagline', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Brief description of your company"
        />
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
        
        <h4 className="text-sm font-medium text-gray-700 mb-2">Industry Tags</h4>
        <div className="flex flex-wrap gap-2 mb-4">
          {data.industryTags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full flex items-center"
            >
              {tag}
              <button
                onClick={() => removeTag(tag, 'industry')}
                className="ml-2 text-indigo-600 hover:text-indigo-800"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
          {showTagInput === 'industry' ? (
            <div className="flex items-center">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag('industry')}
                className="px-3 py-1 border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter tag"
                autoFocus
              />
              <button
                onClick={() => addTag('industry')}
                className="px-3 py-1 bg-indigo-600 text-white rounded-r-full hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowTagInput('industry')}
              className="px-3 py-1 border border-dashed border-gray-300 rounded-full text-gray-600 hover:border-indigo-500 hover:text-indigo-600"
            >
              + Add more
            </button>
          )}
        </div>

        <h4 className="text-sm font-medium text-gray-700 mb-2">Secondary Tags</h4>
        <div className="flex flex-wrap gap-2">
          {data.secondaryTags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full flex items-center"
            >
              {tag}
              <button
                onClick={() => removeTag(tag, 'secondary')}
                className="ml-2 text-gray-600 hover:text-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
          {showTagInput === 'secondary' ? (
            <div className="flex items-center">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag('secondary')}
                className="px-3 py-1 border border-gray-300 rounded-l-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter tag"
                autoFocus
              />
              <button
                onClick={() => addTag('secondary')}
                className="px-3 py-1 bg-gray-600 text-white rounded-r-full hover:bg-gray-700"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowTagInput('secondary')}
              className="px-3 py-1 border border-dashed border-gray-300 rounded-full text-gray-600 hover:border-gray-500 hover:text-gray-700"
            >
              + Add more
            </button>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media Links</h3>
        <div className="space-y-4">
          {data.socialLinks.map((link, index) => (
            <div key={index} className="flex items-center space-x-4">
              <span className="w-24 text-sm text-gray-600">{link.platform}</span>
              <input
                type="url"
                value={link.url}
                onChange={(e) => handleSocialLinkChange(link.platform, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={`Enter ${link.platform.toLowerCase()} URL`}
              />
            </div>
          ))}
          <button
            onClick={addNewSocialLink}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            + Add new
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default OrganizationProfile;