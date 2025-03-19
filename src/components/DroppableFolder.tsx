'use client';

import React from 'react';
import { useDrop } from 'react-dnd';
import { Folder, Lock, Users, Settings, Trash2 } from 'lucide-react';

interface DroppableFolderProps {
  id: string;
  name: string;
  type: 'private' | 'team';
  documentsCount: number;
  isActive: boolean;
  onDrop: (documentId: string, fromFolderId: string, toFolderId: string) => void;
  onClick: () => void;
  onSettingsClick: () => void;
  onDeleteClick?: () => void;
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
  onDeleteClick
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'document',
    drop: (item: { id: string; fromFolderId: string }) => {
      if (item.fromFolderId !== id) {
        onDrop(item.id, item.fromFolderId, id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }));

  return (
    <div
      ref={drop}
      className={`relative p-4 rounded-xl border transition-colors ${
        isActive
          ? 'border-blue-500 bg-blue-50'
          : isOver
          ? 'border-blue-300 bg-blue-50/50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <button onClick={onClick} className="w-full text-left">
        <div className="flex items-center mb-2">
          <Folder
            className={`w-6 h-6 ${
              type === 'private' ? 'text-purple-500' : 'text-blue-500'
            }`}
          />
          {type === 'private' && (
            <Lock className="w-4 h-4 text-gray-400 ml-2" />
          )}
          {type === 'team' && (
            <Users className="w-4 h-4 text-gray-400 ml-2" />
          )}
        </div>
        <h3 className="font-medium text-gray-900">{name}</h3>
        <p className="text-sm text-gray-500">{documentsCount} items</p>
      </button>

      <div className="absolute top-2 right-2 flex space-x-1">
        <button
          onClick={onSettingsClick}
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
        >
          <Settings className="w-4 h-4" />
        </button>
        {onDeleteClick && (
          <button
            onClick={onDeleteClick}
            className="p-1 text-gray-400 hover:text-red-600 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};