'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { useDrag } from 'react-dnd';
import { MoreVertical } from 'lucide-react';
import { moveDocument } from '@/lib/api';
import { getFileIcon } from '@/lib/fileIcons';

interface DraggableDocumentProps {
  id: string;
  name: string;
  type: string;
  currentFolderId: string;
  children?: ReactNode;
  onRenameClick?: (e: React.MouseEvent) => void;
  onShareClick?: (e: React.MouseEvent) => void;
  onMoveClick?: (e: React.MouseEvent) => void;
  onDeleteClick?: (e: React.MouseEvent) => void;
}

export const DraggableDocument: React.FC<DraggableDocumentProps> = ({
  id,
  name,
  type,
  currentFolderId,
  children,
  onRenameClick,
  onShareClick,
  onMoveClick,
  onDeleteClick
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Standardize file type for consistent display
  const standardizeFileType = (fileType: string): string => {
    const upperType = fileType?.toUpperCase?.() || '';
    
    // Handle Excel files
    if (['XLS', 'XLSX', 'EXCEL'].some(ext => upperType.includes(ext))) {
      return 'EXCEL';
    }
    // Handle PowerPoint files
    else if (['PPT', 'PPTX', 'POWERPOINT'].some(ext => upperType.includes(ext))) {
      return 'POWERPOINT';
    }
    // Handle Word files
    else if (['DOC', 'DOCX', 'WORD'].some(ext => upperType.includes(ext))) {
      return 'WORD';
    }
    
    return upperType;
  };
  
  const standardizedType = standardizeFileType(type);
  
  const [{ isDragging }, dragRef, previewRef] = useDrag(() => ({
    type: 'document',
    item: { id, currentFolderId, name, type: standardizedType },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  
  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };
  
  const handleMenuAction = (e: React.MouseEvent, action: (e: React.MouseEvent) => void) => {
    e.stopPropagation();
    setMenuOpen(false);
    action(e);
  };

  // Create ref containers manually
  const dragNode = useRef<HTMLDivElement>(null);
  const previewNode = useRef<HTMLDivElement>(null);
  
  // Connect DnD refs using useEffect
  useEffect(() => {
    dragRef(dragNode.current);
    previewRef(previewNode.current);
  }, [dragRef, previewRef]);

  return (
    <div 
      ref={dragNode}
      style={{
        cursor: 'pointer',
        opacity: isDragging ? 0.5 : 1,
      }}
      className="relative flex items-center"
    >
      <div ref={previewNode} className="flex items-center">
        {getFileIcon(standardizedType, "w-6 h-6 mr-3")}
        <span className="text-sm text-gray-900 truncate">{name}</span>
      </div>
      
      {menuOpen && (
        <div className="absolute right-0 top-0 z-10 bg-white rounded-md shadow-lg border border-gray-200 py-1 w-44" ref={menuRef}>
          {onRenameClick && (
            <button 
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={(e) => handleMenuAction(e, onRenameClick)}
            >
              Rename
            </button>
          )}
          {onShareClick && (
            <button 
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={(e) => handleMenuAction(e, onShareClick)}
            >
              Share file
            </button>
          )}
          {onMoveClick && (
            <button 
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={(e) => handleMenuAction(e, onMoveClick)}
            >
              Move to folder
            </button>
          )}
          {onDeleteClick && (
            <button 
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              onClick={(e) => handleMenuAction(e, onDeleteClick)}
            >
              Delete file
            </button>
          )}
        </div>
      )}
    </div>
  );
};