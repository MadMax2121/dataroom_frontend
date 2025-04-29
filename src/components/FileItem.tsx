'use client';

import React from 'react';
import { getFileIcon, getFileExtension } from '@/lib/fileIcons';

interface FileItemProps {
  name: string;
  type?: string;
  className?: string;
  iconClassName?: string;
  showName?: boolean;
}

/**
 * A consistent file representation component with proper file type icon
 */
export const FileItem: React.FC<FileItemProps> = ({
  name,
  type,
  className = '',
  iconClassName = 'w-6 h-6',
  showName = true
}) => {
  // Determine file type from extension if not provided directly
  const fileType = type || getFileExtension(name) || '';
  
  return (
    <div className={`flex items-center ${className}`}>
      {getFileIcon(fileType, iconClassName)}
      {showName && <span className="text-sm text-gray-900 truncate ml-2">{name}</span>}
    </div>
  );
};

export default FileItem; 