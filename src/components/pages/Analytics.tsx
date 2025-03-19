'use client';

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, LineChart, Line } from 'recharts';
import { Clock, Users, Eye, FileText, Link as LinkIcon, Calendar, ChevronDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface DocumentMetric {
  id: string;
  name: string;
  views: number;
  avgTimeSpent: string;
  lastViewed: string;
  trend: 'up' | 'down';
  trendValue: string;
}

interface LinkMetric {
  id: string;
  name: string;
  views: number;
  uniqueVisitors: number;
  avgTimeSpent: string;
  status: 'active' | 'expired';
  recipients: string[];
}

interface ActivityEvent {
  id: string;
  type: 'view' | 'download' | 'share';
  documentName: string;
  investor: string;
  timestamp: string;
  timeSpent?: string;
}

const Analytics = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [selectedMetric, setSelectedMetric] = useState<'views' | 'time' | 'visitors'>('views');

  // Sample data for document metrics
  const documentMetrics: DocumentMetric[] = [
    {
      id: '1',
      name: 'Pitch Deck 2024.pdf',
      views: 45,
      avgTimeSpent: '8m 32s',
      lastViewed: '2 hours ago',
      trend: 'up',
      trendValue: '+12.5%'
    },
    {
      id: '2',
      name: 'Financial Projections.xlsx',
      views: 32,
      avgTimeSpent: '15m 47s',
      lastViewed: '4 hours ago',
      trend: 'up',
      trendValue: '+8.3%'
    },
    {
      id: '3',
      name: 'Team Overview.docx',
      views: 28,
      avgTimeSpent: '3m 15s',
      lastViewed: '1 day ago',
      trend: 'down',
      trendValue: '-5.2%'
    }
  ];

  // Sample data for link metrics
  const linkMetrics: LinkMetric[] = [
    {
      id: '1',
      name: 'Series A Data Room',
      views: 124,
      uniqueVisitors: 45,
      avgTimeSpent: '12m 18s',
      status: 'active',
      recipients: ['john@vc.com', 'sarah@investor.com', 'mike@fund.com']
    },
    {
      id: '2',
      name: 'Pitch Deck Link',
      views: 89,
      uniqueVisitors: 32,
      avgTimeSpent: '5m 45s',
      status: 'active',
      recipients: ['alex@capital.com', 'lisa@ventures.com']
    }
  ];

  // Sample data for activity feed
  const activityFeed: ActivityEvent[] = [
    {
      id: '1',
      type: 'view',
      documentName: 'Pitch Deck 2024.pdf',
      investor: 'John Smith (Acme VC)',
      timestamp: '10 minutes ago',
      timeSpent: '5m 23s'
    },
    {
      id: '2',
      type: 'download',
      documentName: 'Financial Projections.xlsx',
      investor: 'Sarah Johnson (Beta Investments)',
      timestamp: '1 hour ago'
    },
    {
      id: '3',
      type: 'share',
      documentName: 'Team Overview.docx',
      investor: 'Mike Brown (Delta Fund)',
      timestamp: '2 hours ago'
    }
  ];

  // Sample chart data
  const viewsData = [
    { date: 'Mon', views: 24, timeSpent: 450, visitors: 12 },
    { date: 'Tue', views: 13, timeSpent: 380, visitors: 8 },
    { date: 'Wed', views: 38, timeSpent: 520, visitors: 15 },
    { date: 'Thu', views: 42, timeSpent: 610, visitors: 18 },
    { date: 'Fri', views: 29, timeSpent: 405, visitors: 14 },
    { date: 'Sat', views: 15, timeSpent: 250, visitors: 7 },
    { date: 'Sun', views: 12, timeSpent: 200, visitors: 5 }
  ];

  const metrics = [
    { 
      label: 'Total Views', 
      value: '1,247', 
      change: '+12.5%', 
      trend: 'up',
      icon: Eye,
      color: 'blue'
    },
    { 
      label: 'Avg. Time Spent', 
      value: '8m 32s', 
      change: '+5.3%', 
      trend: 'up',
      icon: Clock,
      color: 'green'
    },
    { 
      label: 'Unique Visitors', 
      value: '342', 
      change: '-2.1%', 
      trend: 'down',
      icon: Users,
      color: 'purple'
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <div className="flex items-center space-x-4">
          <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
            <Calendar className="w-4 h-4 mr-2" />
            Last {timeRange === '7d' ? '7' : timeRange === '30d' ? '30' : '90'} days
            <ChevronDown className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{metric.label}</p>
                <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${metric.color}-500`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {metric.trend === 'up' ? (
                <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
              )}
              <p className={`text-sm ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change} from last period
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Engagement Overview</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedMetric('views')}
              className={`px-3 py-1 rounded-lg text-sm ${
                selectedMetric === 'views'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Views
            </button>
            <button
              onClick={() => setSelectedMetric('time')}
              className={`px-3 py-1 rounded-lg text-sm ${
                selectedMetric === 'time'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Time Spent
            </button>
            <button
              onClick={() => setSelectedMetric('visitors')}
              className={`px-3 py-1 rounded-lg text-sm ${
                selectedMetric === 'visitors'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Visitors
            </button>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {selectedMetric === 'views' ? (
              <BarChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#3B82F6" />
              </BarChart>
            ) : selectedMetric === 'time' ? (
              <AreaChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="timeSpent" fill="#10B981" fillOpacity={0.2} stroke="#10B981" />
              </AreaChart>
            ) : (
              <LineChart data={viewsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="visitors" stroke="#8B5CF6" />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Document Metrics */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Interaction Metrics</h2>
          <div className="space-y-4">
            {documentMetrics.map((doc) => (
              <div key={doc.id} className="p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900">{doc.name}</span>
                  </div>
                  <div className={`flex items-center ${
                    doc.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {doc.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                    )}
                    {doc.trendValue}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Views</p>
                    <p className="font-medium text-gray-900">{doc.views}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Avg. Time</p>
                    <p className="font-medium text-gray-900">{doc.avgTimeSpent}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Last Viewed</p>
                    <p className="font-medium text-gray-900">{doc.lastViewed}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Link Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Link Activity Insights</h2>
          <div className="space-y-4">
            {linkMetrics.map((link) => (
              <div key={link.id} className="p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <LinkIcon className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900">{link.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    link.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {link.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-500">Views</p>
                    <p className="font-medium text-gray-900">{link.views}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Unique Visitors</p>
                    <p className="font-medium text-gray-900">{link.uniqueVisitors}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Avg. Time</p>
                    <p className="font-medium text-gray-900">{link.avgTimeSpent}</p>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="text-gray-500 mb-1">Recipients</p>
                  <div className="flex flex-wrap gap-2">
                    {link.recipients.map((recipient, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                        {recipient}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Investor Activity Feed</h2>
        <div className="space-y-4">
          {activityFeed.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-4 border border-gray-100 rounded-lg">
              <div className={`p-2 rounded-lg ${
                activity.type === 'view' 
                  ? 'bg-blue-100 text-blue-600'
                  : activity.type === 'download'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-purple-100 text-purple-600'
              }`}>
                {activity.type === 'view' ? (
                  <Eye className="w-5 h-5" />
                ) : activity.type === 'download' ? (
                  <FileText className="w-5 h-5" />
                ) : (
                  <LinkIcon className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {activity.investor} {activity.type === 'view' ? 'viewed' : activity.type === 'download' ? 'downloaded' : 'shared'} {activity.documentName}
                </p>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1" />
                  {activity.timestamp}
                  {activity.timeSpent && (
                    <span className="ml-4">Spent {activity.timeSpent}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;