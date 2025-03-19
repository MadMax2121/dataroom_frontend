'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderKanban, 
  FileText, 
  BarChart3, 
  Link2, 
  Settings,
  Sparkles
} from 'lucide-react';
import PricingModal from './PricingModal';

const Sidebar = () => {
  const [showPricingModal, setShowPricingModal] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/datarooms', icon: FolderKanban, label: 'Data Rooms' },
    { path: '/documents', icon: FileText, label: 'Documents' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/access-links', icon: Link2, label: 'Access Links' },
  ];

  return (
    <>
      <div className="w-64 bg-white border-r border-gray-200 px-3 py-4 flex flex-col h-screen">
        <div className="mb-8 px-4">
          <h1 className="text-xl font-bold text-gray-800">DataVault</h1>
          <p className="text-sm text-gray-500">Virtual Data Room</p>
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                pathname === item.path
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </Link>
          ))}

          {/* Upgrade Button */}
          <button
            onClick={() => setShowPricingModal(true)}
            className="w-full mt-4 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center font-medium transition-colors"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Upgrade Now
          </button>
        </nav>

        {/* Settings Link */}
        <div className="mt-auto px-4 py-3 border-t border-gray-200">
          <Link
            href="/settings"
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg w-full ${
              pathname === '/settings'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </Link>
        </div>
      </div>

      {/* Pricing Modal */}
      {showPricingModal && (
        <PricingModal onClose={() => setShowPricingModal(false)} />
      )}
    </>
  );
}

export default Sidebar;