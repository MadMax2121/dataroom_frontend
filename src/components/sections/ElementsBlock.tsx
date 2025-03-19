'use client';

import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Youtube from '@tiptap/extension-youtube';
import { 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Table as TableIcon, 
  Video,
  FileText,
  Bot,
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  X,
  Edit3,
  Save,
  ChevronDown,
  Upload
} from 'lucide-react';

type LayoutType = '1-col' | '2-col' | '3-col';

const ElementsBlock = () => {
  const [isEditing, setIsEditing] = useState(true);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [layout, setLayout] = useState<LayoutType>('1-col');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [sectionName, setSectionName] = useState('New Section');

  const editor1 = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({
        inline: false,
        allowFullscreen: true,
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none max-w-none min-h-[200px] p-4',
      },
    },
    content: '',
  });

  const editor2 = useEditor({
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none max-w-none min-h-[200px] p-4',
      },
    },
    content: '',
  });

  const editor3 = useEditor({
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none max-w-none min-h-[200px] p-4',
      },
    },
    content: '',
  });

  const handleImageUpload = (editor: any) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        editor.chain().focus().setImage({ src: url }).run();
      }
    };
    input.click();
  };

  const handleFileUpload = (editor: any) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        editor.chain().focus().setLink({ href: url }).run();
      }
    };
    input.click();
  };

  const handleYoutubeEmbed = (editor: any) => {
    const url = prompt('Enter YouTube URL');
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  const basicElements = [
    {
      id: 'image',
      icon: ImageIcon,
      label: 'Add image',
      action: (editor: any) => handleImageUpload(editor),
      options: [
        { label: 'Upload File', icon: Upload, action: (editor: any) => handleImageUpload(editor) },
        { label: 'Choose from DMS', icon: FileText }
      ]
    },
    {
      id: 'file',
      icon: FileText,
      label: 'Upload a file',
      action: (editor: any) => handleFileUpload(editor),
      options: [
        { label: 'Upload File', icon: Upload, action: (editor: any) => handleFileUpload(editor) },
        { label: 'Choose from DMS', icon: FileText }
      ]
    },
    {
      id: 'embed',
      icon: LinkIcon,
      label: 'Embed',
      options: [
        { 
          label: 'Web Link', 
          icon: LinkIcon,
          action: (editor: any) => {
            const url = prompt('Enter URL');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }
        },
        { label: 'Google Docs', icon: FileText },
        { label: 'Google Slides', icon: FileText },
        { label: 'Google Sheets', icon: FileText }
      ]
    },
    {
      id: 'video',
      icon: Video,
      label: 'Add a video',
      options: [
        { 
          label: 'YouTube Link', 
          icon: Video,
          action: (editor: any) => handleYoutubeEmbed(editor)
        },
        { label: 'Google Drive Link', icon: FileText }
      ]
    }
  ];

  const textFormatting = [
    { 
      icon: Heading1, 
      label: 'H1',
      action: (editor: any) => editor?.chain().focus().toggleHeading({ level: 1 }).run()
    },
    { 
      icon: Heading2, 
      label: 'H2',
      action: (editor: any) => editor?.chain().focus().toggleHeading({ level: 2 }).run()
    },
    { 
      icon: Heading3, 
      label: 'H3',
      action: (editor: any) => editor?.chain().focus().toggleHeading({ level: 3 }).run()
    },
    { 
      icon: Bold, 
      label: 'Bold',
      action: (editor: any) => editor?.chain().focus().toggleBold().run()
    },
    { 
      icon: Italic, 
      label: 'Italic',
      action: (editor: any) => editor?.chain().focus().toggleItalic().run()
    },
    { 
      icon: UnderlineIcon, 
      label: 'Underline',
      action: (editor: any) => editor?.chain().focus().toggleUnderline().run()
    },
    { 
      icon: AlignLeft, 
      label: 'Align left',
      action: (editor: any) => editor?.chain().focus().setTextAlign('left').run()
    },
    { 
      icon: AlignCenter, 
      label: 'Align center',
      action: (editor: any) => editor?.chain().focus().setTextAlign('center').run()
    },
    { 
      icon: AlignRight, 
      label: 'Align right',
      action: (editor: any) => editor?.chain().focus().setTextAlign('right').run()
    },
    { 
      icon: List, 
      label: 'Bullet list',
      action: (editor: any) => editor?.chain().focus().toggleBulletList().run()
    },
    { 
      icon: ListOrdered, 
      label: 'Numbered list',
      action: (editor: any) => editor?.chain().focus().toggleOrderedList().run()
    }
  ];

  const handleSave = () => {
    setIsEditing(false);
  };

  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const renderToolbar = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Section name
        </label>
        <input
          type="text"
          value={sectionName}
          onChange={(e) => setSectionName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter section name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add element
        </label>
        <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg">
          {basicElements.map((element) => (
            <div key={element.id} className="relative">
              <button
                onClick={() => toggleDropdown(element.id)}
                className="p-2 hover:bg-white rounded-lg transition-colors group"
              >
                <element.icon className="w-5 h-5 text-gray-600" />
              </button>
              {activeDropdown === element.id && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {element.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (option.action) {
                          option.action(editor1);
                        }
                        setActiveDropdown(null);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                    >
                      <option.icon className="w-4 h-4 mr-2" />
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Layout
        </label>
        <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg">
          <button 
            onClick={() => setLayout('1-col')}
            className={`p-2 rounded-lg transition-colors ${layout === '1-col' ? 'bg-white' : 'hover:bg-white'}`}
          >
            <div className="w-5 h-5 border-2 border-gray-600 rounded" />
          </button>
          <button 
            onClick={() => setLayout('2-col')}
            className={`p-2 rounded-lg transition-colors ${layout === '2-col' ? 'bg-white' : 'hover:bg-white'}`}
          >
            <div className="w-5 h-5 border-2 border-gray-600 rounded flex">
              <div className="flex-1 border-r border-gray-600" />
              <div className="flex-1" />
            </div>
          </button>
          <button 
            onClick={() => setLayout('3-col')}
            className={`p-2 rounded-lg transition-colors ${layout === '3-col' ? 'bg-white' : 'hover:bg-white'}`}
          >
            <div className="w-5 h-5 border-2 border-gray-600 rounded flex">
              <div className="flex-1 border-r border-gray-600" />
              <div className="flex-1 border-r border-gray-600" />
              <div className="flex-1" />
            </div>
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg">
        {textFormatting.map((format, index) => (
          <button
            key={index}
            onClick={() => format.action(editor1)}
            className="p-2 hover:bg-white rounded-lg transition-colors group relative"
          >
            <format.icon className="w-4 h-4 text-gray-600" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
              {format.label}
            </div>
          </button>
        ))}
        <button
          onClick={() => setShowAIAssistant(true)}
          className="p-2 hover:bg-white rounded-lg transition-colors ml-2"
        >
          <Bot className="w-4 h-4 text-purple-600" />
        </button>
      </div>
    </div>
  );

  if (!editor1) {
    return null;
  }

  if (!isEditing) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{sectionName}</h2>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        </div>
        <div className={`flex gap-4 ${layout === '1-col' ? '' : 'divide-x divide-gray-200'}`}>
          <div className={`flex-1 ${layout !== '1-col' ? 'pr-4' : ''}`}>
            <EditorContent editor={editor1} />
          </div>
          {layout !== '1-col' && editor2 && (
            <div className="flex-1 px-4">
              <EditorContent editor={editor2} />
            </div>
          )}
          {layout === '3-col' && editor3 && (
            <div className="flex-1 pl-4">
              <EditorContent editor={editor3} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Edit Section</h2>
          <p className="text-sm text-gray-500">Add and format content with rich text editing</p>
        </div>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </button>
      </div>

      {renderToolbar()}

      <div className={`flex gap-4 mt-6 ${layout === '1-col' ? '' : 'divide-x divide-gray-200'}`}>
        <div className={`flex-1 ${layout !== '1-col' ? 'pr-4' : ''}`}>
          <div className="min-h-[200px] bg-white border border-gray-200 rounded-lg">
            <EditorContent editor={editor1} />
          </div>
        </div>
        {layout !== '1-col' && editor2 && (
          <div className="flex-1 px-4">
            <div className="min-h-[200px] bg-white border border-gray-200 rounded-lg">
              <EditorContent editor={editor2} />
            </div>
          </div>
        )}
        {layout === '3-col' && editor3 && (
          <div className="flex-1 pl-4">
            <div className="min-h-[200px] bg-white border border-gray-200 rounded-lg">
              <EditorContent editor={editor3} />
            </div>
          </div>
        )}
      </div>

      {showAIAssistant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end p-4 z-50">
          <div className="bg-white rounded-lg w-96 h-[600px] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">AI Assistant</h3>
              <button
                onClick={() => setShowAIAssistant(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4">
              <p className="text-gray-500 text-center">
                AI Assistant is ready to help you with your content.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElementsBlock;