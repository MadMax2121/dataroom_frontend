import React, { useState } from 'react';
import { X, Plus, Edit3, ChevronUp, ChevronDown, Trash2, Move } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ElementsBlock from './ElementsBlock';

interface Page {
  id: string;
  title: string;
  icon?: string;
}

interface Column {
  id: string;
  title: string;
  pages: Page[];
}

interface ContentHubProps {
  onClose?: () => void;
}

const ContentHub: React.FC<ContentHubProps> = ({ onClose }) => {
  const [isEditing, setIsEditing] = useState(true);
  const [columns, setColumns] = useState<Column[]>([
    {
      id: '1',
      title: 'Investment Round',
      pages: [
        { id: '1-1', title: 'Pitch Deck Investor Long', icon: '📊' },
        { id: '1-2', title: 'Business Plan', icon: '📝' },
        { id: '1-3', title: 'Vision and Mission', icon: '🎯' }
      ]
    },
    {
      id: '2',
      title: 'Commercial',
      pages: [
        { id: '2-1', title: 'Customer Contracts', icon: '📄' },
        { id: '2-2', title: 'Partnerships Agreements', icon: '🤝' },
        { id: '2-3', title: 'LOIs, LOSs, MOUs', icon: '✍️' },
        { id: '2-4', title: 'GTM Strategy', icon: '🎯' }
      ]
    },
    {
      id: '3',
      title: 'Legal',
      pages: [
        { id: '3-1', title: 'Business Registration', icon: '⚖️' },
        { id: '3-2', title: "Founders' Agreements", icon: '📜' },
        { id: '3-3', title: 'Articles of Association', icon: '📋' }
      ]
    }
  ]);

  const [activePages, setActivePages] = useState<string[]>([]);
  const [numColumns, setNumColumns] = useState(3);
  const [selectedPage, setSelectedPage] = useState<string | null>(null);

  const handleAddColumn = () => {
    const newColumn: Column = {
      id: `${columns.length + 1}`,
      title: 'New Column',
      pages: []
    };
    setColumns([...columns, newColumn]);
    setNumColumns(numColumns + 1);
  };

  const handleAddPage = (columnId: string) => {
    setColumns(columns.map(col => {
      if (col.id === columnId) {
        return {
          ...col,
          pages: [...col.pages, { id: `${col.id}-${col.pages.length + 1}`, title: 'New Page' }]
        };
      }
      return col;
    }));
  };

  const handleUpdateColumnTitle = (columnId: string, newTitle: string) => {
    setColumns(columns.map(col => 
      col.id === columnId ? { ...col, title: newTitle } : col
    ));
  };

  const handleUpdatePageTitle = (columnId: string, pageId: string, newTitle: string) => {
    setColumns(columns.map(col => {
      if (col.id === columnId) {
        return {
          ...col,
          pages: col.pages.map(page => 
            page.id === pageId ? { ...page, title: newTitle } : page
          )
        };
      }
      return col;
    }));
  };

  const handleDeleteColumn = (columnId: string) => {
    setColumns(columns.filter(col => col.id !== columnId));
    setNumColumns(numColumns - 1);
  };

  const handleDeletePage = (columnId: string, pageId: string) => {
    setColumns(columns.map(col => {
      if (col.id === columnId) {
        return {
          ...col,
          pages: col.pages.filter(page => page.id !== pageId)
        };
      }
      return col;
    }));
  };

  const togglePage = (pageId: string) => {
    if (selectedPage === pageId) {
      setSelectedPage(null);
    } else {
      setSelectedPage(pageId);
    }
  };

  if (!isEditing) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Content Hub</h2>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {columns.map(column => (
            <div key={column.id} className="space-y-2">
              <h3 className="font-medium text-gray-900">{column.title}</h3>
              {column.pages.map(page => (
                <button
                  key={page.id}
                  onClick={() => togglePage(page.id)}
                  className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    selectedPage === page.id
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {page.icon && <span>{page.icon}</span>}
                  <span>{page.title}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {selectedPage && (
          <div className="mt-8 border-t pt-6">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {columns.map(col => 
                col.pages.find(p => p.id === selectedPage)
              ).filter(Boolean).map(page => (
                <button
                  key={page!.id}
                  onClick={() => togglePage(page!.id)}
                  className="px-4 py-2 bg-white border rounded-lg flex items-center space-x-2 hover:bg-gray-50"
                >
                  {page!.icon && <span>{page!.icon}</span>}
                  <span>{page!.title}</span>
                  <X className="w-4 h-4" />
                </button>
              ))}
            </div>
            <div className="mt-4">
              <ElementsBlock />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Edit Content Hub</h2>
          <p className="text-sm text-gray-500">Organize your content into columns and pages</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Columns
        </label>
        <input
          type="number"
          min="1"
          max="4"
          value={numColumns}
          onChange={(e) => setNumColumns(parseInt(e.target.value))}
          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {columns.slice(0, numColumns).map(column => (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={column.title}
                onChange={(e) => handleUpdateColumnTitle(column.id, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={() => handleDeleteColumn(column.id)}
                className="ml-2 p-2 text-gray-400 hover:text-gray-600"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {column.pages.map(page => (
                <div
                  key={page.id}
                  className="flex items-center space-x-2 p-2 bg-white border border-gray-200 rounded-lg"
                >
                  <Move className="w-4 h-4 text-gray-400 cursor-move" />
                  <input
                    type="text"
                    value={page.title}
                    onChange={(e) => handleUpdatePageTitle(column.id, page.id, e.target.value)}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    onClick={() => handleDeletePage(column.id, page.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleAddPage(column.id)}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-indigo-500 hover:text-indigo-600 flex items-center justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Page
            </button>
          </div>
        ))}

        {numColumns < 4 && (
          <button
            onClick={handleAddColumn}
            className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:border-indigo-500 hover:text-indigo-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Column
          </button>
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => setIsEditing(false)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ContentHub;