'use client';

import React from 'react';
import { getFileExtension } from '@/lib/fileIcons';

interface FileListIconProps {
  fileName: string;
  fileType?: string;
  className?: string;
}

export const FileListIcon: React.FC<FileListIconProps> = ({
  fileName,
  fileType,
  className = "w-6 h-6"
}) => {
  const type = fileType || getFileExtension(fileName) || '';
  
  let color = '#94a3b8'; // Default gray
  let backgroundColor = '#f1f5f9'; // Light gray background
  let extension = '';

  if (type) {
    extension = type.toLowerCase();
    
    if (type.match(/pdf/i)) {
      color = '#ef4444'; // red
      backgroundColor = '#fee2e2';
    } 
    else if (type.match(/xls|xlsx|excel/i)) {
      color = '#16a34a'; // green
      backgroundColor = '#dcfce7';
    }
    else if (type.match(/csv|ods|tsv/i)) {
      color = '#0d9488'; // teal
      backgroundColor = '#ccfbf1';
    }
    else if (type.match(/doc|docx|rtf|word/i)) {
      color = '#2563eb'; // blue
      backgroundColor = '#dbeafe';
    }
    else if (type.match(/ppt|pptx|powerpoint/i)) {
      color = '#ea580c'; // orange
      backgroundColor = '#ffedd5';
    }
    else if (type.match(/txt|md|text/i)) {
      color = '#475569'; // slate gray
      backgroundColor = '#f1f5f9';
    }
    else if (type.match(/zip|rar|tar|gz|7z/i)) {
      color = '#7c3aed'; // purple
      backgroundColor = '#ede9fe';
    }
    else if (type.match(/jpg|jpeg|png|gif|webp|bmp|svg/i)) {
      color = '#0ea5e9'; // sky blue
      backgroundColor = '#e0f2fe';
    }
  }

  // Extract extension
  const extensionDisplay = extension.slice(0, 3).toUpperCase();

  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* File background */}
        <path 
          d="M4 4C4 2.89543 4.89543 2 6 2H14.1716C14.702 2 15.2107 2.21071 15.5858 2.58579L19.4142 6.41421C19.7893 6.78929 20 7.29799 20 7.82843V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z" 
          fill={backgroundColor} 
        />
        {/* Folded corner */}
        <path 
          d="M14 2V6C14 7.10457 14.8954 8 16 8H20L14 2Z" 
          fill={color} 
          fillOpacity="0.2" 
        />
        {/* Border */}
        <path 
          d="M4 4C4 2.89543 4.89543 2 6 2H14.1716C14.702 2 15.2107 2.21071 15.5858 2.58579L19.4142 6.41421C19.7893 6.78929 20 7.29799 20 7.82843V20C20 21.1046 19.1046 22 18 22H6C4.89543 22 4 21.1046 4 20V4Z" 
          stroke={color} 
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Folded corner outline */}
        <path 
          d="M14 2V6C14 7.10457 14.8954 8 16 8H20" 
          stroke={color} 
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      
      {/* Extension text overlay */}
      {extensionDisplay && (
        <div 
          className="absolute inset-0 flex items-center justify-center text-[8px] font-semibold" 
          style={{ color, top: '50%', paddingTop: '4px' }}
        >
          {extensionDisplay}
        </div>
      )}
    </div>
  );
};

export default FileListIcon; 