'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { Folder, Lock, Users, Settings, Trash2, MoreVertical } from 'lucide-react';

interface DroppableFolderProps {
  id: string;
  name: string;
  type: 'private' | 'team';
  documentsCount: number;
  isActive: boolean;
  onDrop: (documentId: string, fromFolderId: string, toFolderId: string) => void;
  onClick: () => void;
  onSettingsClick: () => void;
  onDeleteClick: () => void;
  onRenameClick?: () => void;
  onShareClick?: () => void;
  onMoveClick?: () => void;
}

export const DroppableFolder: React.FC<DroppableFolderProps> = ({
  id,
  name,
  type,
  documentsCount,
  isActive,
  onDrop,
  onClick,
  onSettingsClick,
  onDeleteClick,
  onRenameClick,
  onShareClick,
  onMoveClick
}) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'document',
    drop: (item: { id: string; currentFolderId: string; name: string }) => {
      if (item.currentFolderId !== id) {
        onDrop(item.id, item.currentFolderId, id);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });
  
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
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
  
  const handleMenuAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    setMenuOpen(false);
    action();
  };

  // Determine folder styles based on drag state
  const getFolderClasses = () => {
    let baseClasses = "p-3 rounded-lg border-2 cursor-pointer transition-colors duration-200";
    
    // Active state
    if (isActive) {
      baseClasses += " bg-blue-100 border-blue-300";
    } else {
      baseClasses += " bg-white border-gray-200 hover:border-gray-300";
    }
    
    // Drag over state with gentle highlight - no animation that would cause jumping
    if (isOver) {
      baseClasses += " border-purple-500 bg-purple-50";
    }
    
    return baseClasses;
  };

  return (
    <div
      ref={drop}
      className={getFolderClasses()}
      onClick={onClick}
      style={{ transform: 'translate3d(0, 0, 0)' }} // Prevent jumping during hover
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Folder
            className={`w-5 h-5 ${
              type === 'private' ? 'text-purple-500' : 'text-blue-500'
            }`}
          />
          {type === 'private' && (
            <Lock className="w-4 h-4 text-gray-400 ml-2" />
          )}
          {type === 'team' && (
            <Users className="w-4 h-4 text-gray-400 ml-2" />
          )}
          <span className={`ml-3 text-sm font-medium ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>{name}</span>
          <span className="ml-2 text-xs text-gray-500">({documentsCount})</span>
        </div>
        
        <div className="relative" ref={menuRef}>
          <button 
            onClick={handleMenuToggle}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <MoreVertical size={16} className="text-gray-500" />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 mt-1 z-10 bg-white rounded-md shadow-lg border border-gray-200 py-1 w-44">
              <button 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={(e) => onRenameClick ? handleMenuAction(e, onRenameClick) : null}
              >
                Rename
              </button>
              <button 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={(e) => onShareClick ? handleMenuAction(e, onShareClick) : null}
              >
                Share folder
              </button>
              <button 
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={(e) => onMoveClick ? handleMenuAction(e, onMoveClick) : null}
              >
                Move to folder
              </button>
              <button 
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                onClick={(e) => handleMenuAction(e, onDeleteClick)}
              >
                Delete folder
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
