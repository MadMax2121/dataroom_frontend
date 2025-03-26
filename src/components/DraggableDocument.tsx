'use client';

import React from 'react';
import { useDrag } from 'react-dnd';
import { FileText } from 'lucide-react';

interface DraggableDocumentProps {
  id: string;
  name: string;
  type: string;
  currentFolderId: string;
}

export const DraggableDocument: React.FC<DraggableDocumentProps> = ({
  id,
  name,
  type,
  currentFolderId
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'document',
    item: { id, name, type, fromFolderId: currentFolderId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  return (
    <div
      ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
      className={`flex items-center ${isDragging ? 'opacity-50' : ''}`}
    >
      <FileText className="w-5 h-5 text-gray-400 mr-3" />
      <span className="text-sm font-medium text-gray-900">{name}</span>
    </div>
  );
};