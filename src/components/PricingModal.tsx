'use client';

import React, { useState } from 'react';
import { X, Check, Sparkles, Shield, Users, FileText, Link2, BarChart3, Lock } from 'lucide-react';

interface PricingModalProps {
  onClose: () => void;
}

interface PricingFeature {
  name: string;
  regular: boolean | string;
  pro: boolean | string;
  advanced: boolean | string;
}

const PricingModal: React.FC<PricingModalProps> = ({ onClose }) => {
  const features: PricingFeature[] = [
    { name: 'Data Rooms', regular: '3', pro: '10', advanced: 'Unlimited' },
    { name: 'Storage Space', regular: '5 GB', pro: '50 GB', advanced: '500 GB' },
    { name: 'Team Members', regular: '3', pro: '10', advanced: 'Unlimited' },
    { name: 'Access Links', regular: '10/month', pro: '50/month', advanced: 'Unlimited' },
    { name: 'Password Protection', regular: true, pro: true, advanced: true },
    { name: 'Watermarking', regular: false, pro: true, advanced: true },
    { name: 'Analytics', regular: 'Basic', pro: 'Advanced', advanced: 'Enterprise' },
    { name: 'Custom Branding', regular: false, pro: true, advanced: true },
    { name: 'API Access', regular: false, pro: false, advanced: true },
    { name: 'Priority Support', regular: false, pro: true, advanced: true },
    { name: 'SSO Integration', regular: false, pro: false, advanced: true },
    { name: 'Audit Logs', regular: '30 days', pro: '90 days', advanced: '1 year' },
    { name: 'Document Expiry', regular: true, pro: true, advanced: true },
    { name: 'Domain Restrictions', regular: false, pro: true, advanced: true },
    { name: 'Custom Security Policies', regular: false, pro: false, advanced: true }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
            <p className="text-sm text-gray-500 mt-1">Select the perfect plan for your needs</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Pricing Tables */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Regular Plan */}
            <div className="border border-gray-200 rounded-xl p-6 hover:border-blue-500 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Regular</h3>
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
              <div className="mb-6">
                <p className="text-3xl font-bold text-gray-900">$49<span className="text-lg text-gray-500">/mo</span></p>
                <p className="text-sm text-gray-500 mt-2">Perfect for individuals and small teams</p>
              </div>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-6">
                Get Started
              </button>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    {typeof feature.regular === 'boolean' ? (
                      feature.regular ? (
                        <Check className="w-5 h-5 text-green-500 mr-3" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mr-3" />
                      )
                    ) : (
                      <span className="w-5 h-5 flex items-center justify-center mr-3">•</span>
                    )}
                    <span className="text-sm text-gray-600">
                      {feature.name}
                      {typeof feature.regular !== 'boolean' && (
                        <span className="font-medium text-gray-900"> {feature.regular}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Plan */}
            <div className="border-2 border-purple-500 rounded-xl p-6 relative bg-white shadow-lg">
              <div className="absolute top-0 right-6 transform -translate-y-1/2">
                <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Popular
                </span>
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Pro</h3>
                <Sparkles className="w-6 h-6 text-purple-500" />
              </div>
              <div className="mb-6">
                <p className="text-3xl font-bold text-gray-900">$99<span className="text-lg text-gray-500">/mo</span></p>
                <p className="text-sm text-gray-500 mt-2">For growing businesses and teams</p>
              </div>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 mb-6">
                Get Started
              </button>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    {typeof feature.pro === 'boolean' ? (
                      feature.pro ? (
                        <Check className="w-5 h-5 text-green-500 mr-3" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mr-3" />
                      )
                    ) : (
                      <span className="w-5 h-5 flex items-center justify-center mr-3">•</span>
                    )}
                    <span className="text-sm text-gray-600">
                      {feature.name}
                      {typeof feature.pro !== 'boolean' && (
                        <span className="font-medium text-gray-900"> {feature.pro}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Plan */}
            <div className="border border-gray-200 rounded-xl p-6 hover:border-blue-500 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Advanced</h3>
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <div className="mb-6">
                <p className="text-3xl font-bold text-gray-900">$199<span className="text-lg text-gray-500">/mo</span></p>
                <p className="text-sm text-gray-500 mt-2">For enterprises and large organizations</p>
              </div>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-6">
                Contact Sales
              </button>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    {typeof feature.advanced === 'boolean' ? (
                      feature.advanced ? (
                        <Check className="w-5 h-5 text-green-500 mr-3" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mr-3" />
                      )
                    ) : (
                      <span className="w-5 h-5 flex items-center justify-center mr-3">•</span>
                    )}
                    <span className="text-sm text-gray-600">
                      {feature.name}
                      {typeof feature.advanced !== 'boolean' && (
                        <span className="font-medium text-gray-900"> {feature.advanced}</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <Lock className="w-4 h-4 mr-2" />
              Secure payment powered by Stripe
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingModal;