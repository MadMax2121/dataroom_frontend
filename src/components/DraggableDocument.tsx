'use client';

import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { FileText } from 'lucide-react';
import { moveDocument } from '@/lib/api';

interface DraggableDocumentProps {
  id: string;
  name: string;
  type: string;
  currentFolderId: string;
}

interface Document {
  id: string | number;
  name: string;
  size: string;
  type: string;
  lastModified: string;
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

  const [isMoving, setIsMoving] = useState(false);
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('documentId', id);
  };
  
  const handleMoveDocument = async (documentId: number, folderId: number) => {
    try {
      setIsMoving(true);
      await moveDocument(documentId, folderId);
    } catch (error) {
      console.error('Error moving document:', error);
    } finally {
      setIsMoving(false);
    }
  };

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