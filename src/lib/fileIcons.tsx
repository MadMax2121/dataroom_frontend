import React from 'react';
import { FileText, FileIcon, FileImage, FileSpreadsheet } from 'lucide-react';

/**
 * Gets the appropriate icon component for a given file type
 * @param type File type/extension
 * @param className Optional CSS classes to apply to the icon
 * @returns React component for the file icon
 */
export const getFileIcon = (type: string, className: string = '') => {
  // Standardize the type - handle null/undefined and ensure uppercase for comparison
  const fileType = type?.toUpperCase?.() || '';
  
  // Excel files - explicitly check both for "EXCEL" and .xls/.xlsx extensions
  if (
    fileType === 'EXCEL' || 
    fileType === 'XLS' || 
    fileType === 'XLSX' || 
    fileType.includes('XLS') ||
    fileType.includes('EXCEL')
  ) {
    return <FileSpreadsheet className={`${className} text-green-600`} />;
  }
  
  // PDF files
  else if (fileType === 'PDF' || fileType.includes('PDF')) {
    return <FileText className={`${className} text-red-500`} />;
  } 
  
  // Image files
  else if (['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'].some(ext => fileType.includes(ext))) {
    return <FileImage className={`${className} text-blue-500`} />;
  } 
  
  // CSV and other data files
  else if (['CSV', 'ODS', 'TSV'].some(ext => fileType.includes(ext))) {
    return <FileSpreadsheet className={`${className} text-teal-500`} />;
  }
  
  // Word documents
  else if (['DOC', 'DOCX', 'RTF', 'WORD'].some(ext => fileType.includes(ext))) {
    return <FileText className={`${className} text-blue-700`} />;
  }
  
  // PowerPoint files
  else if (['PPT', 'PPTX', 'POWERPOINT'].some(ext => fileType.includes(ext))) {
    return <FileText className={`${className} text-orange-500`} />;
  }
  
  // Text files
  else if (['TXT', 'MD', 'TEXT'].some(ext => fileType.includes(ext))) {
    return <FileText className={`${className} text-gray-600`} />;
  }
  
  // Archives
  else if (['ZIP', 'RAR', 'TAR', 'GZ', '7Z'].some(ext => fileType.includes(ext))) {
    return <FileIcon className={`${className} text-purple-500`} />;
  }
  
  // Default fallback
  return <FileIcon className={`${className} text-gray-500`} />;
};

/**
 * Gets the file extension from a filename
 * @param filename The filename to extract extension from
 * @returns The uppercase extension or null if no extension
 */
export const getFileExtension = (filename: string | undefined): string | null => {
  if (!filename || !filename.includes('.')) return null;
  return filename.split('.').pop()?.toUpperCase() || null;
}; 