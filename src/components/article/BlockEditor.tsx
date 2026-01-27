// ============================================
// src/components/article/BlockEditor.tsx
// Block Editor Component - Rich text editor for articles
// ============================================

'use client';

import { useState } from 'react';
import { ContentBlock, BlockType } from '@/types';
import { generateUniqueId } from '@/lib/utils';
import Button from '@/components/common/Button';

interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);

  const addBlock = (type: BlockType) => {
    const newBlock: ContentBlock = {
      id: generateUniqueId(),
      type,
      content: '',
      order: blocks.length,
      metadata: type === BlockType.HEADING ? { level: 2 } : {},
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    onChange(
      blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      )
    );
  };

  const deleteBlock = (id: string) => {
    onChange(blocks.filter((block) => block.id !== id).map((block, index) => ({
      ...block,
      order: index,
    })));
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex((b) => b.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === blocks.length - 1)
    ) {
      return;
    }

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    
    onChange(
      newBlocks.map((block, i) => ({
        ...block,
        order: i,
      }))
    );
  };

  const handleImageUpload = async (blockId: string, file: File) => {
    setUploadingBlockId(blockId);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'content');

      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload gagal');
      }

      updateBlock(blockId, { content: data.url });
    } catch (error: any) {
      alert(error.message || 'Gagal upload gambar');
    } finally {
      setUploadingBlockId(null);
    }
  };

  const renderBlockEditor = (block: ContentBlock) => {
    switch (block.type) {
      case BlockType.TEXT:
        return (
          <textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            className="w-full p-2 border rounded min-h-24"
            placeholder="Masukkan teks..."
          />
        );

      case BlockType.HEADING:
        return (
          <div className="space-y-2">
            <select
              value={block.metadata?.level || 2}
              onChange={(e) =>
                updateBlock(block.id, {
                  metadata: { ...block.metadata, level: parseInt(e.target.value) },
                })
              }
              className="p-2 border rounded"
            >
              <option value={1}>Heading 1</option>
              <option value={2}>Heading 2</option>
              <option value={3}>Heading 3</option>
            </select>
            <input
              type="text"
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              className="w-full p-2 border rounded"
              placeholder="Masukkan heading..."
            />
          </div>
        );

      case BlockType.IMAGE:
        return (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(block.id, file);
                  }
                }}
                className="flex-1 p-2 border rounded text-sm"
                disabled={uploadingBlockId === block.id}
              />
              {uploadingBlockId === block.id && (
                <span className="text-sm text-blue-600 py-2">Uploading...</span>
              )}
            </div>
            
            <input
              type="text"
              value={block.metadata?.alt || ''}
              onChange={(e) =>
                updateBlock(block.id, {
                  metadata: { ...block.metadata, alt: e.target.value },
                })
              }
              className="w-full p-2 border rounded"
              placeholder="Alt text (deskripsi gambar)..."
            />
            
            {block.content && (
              <div className="mt-2">
                <img src={block.content} alt="Preview" className="max-w-md rounded border" />
                <p className="text-xs text-gray-500 mt-1">URL: {block.content}</p>
              </div>
            )}
          </div>
        );

      case BlockType.CODE:
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={block.metadata?.language || ''}
              onChange={(e) =>
                updateBlock(block.id, {
                  metadata: { ...block.metadata, language: e.target.value },
                })
              }
              className="p-2 border rounded"
              placeholder="Bahasa pemrograman (javascript, python, dll)..."
            />
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              className="w-full p-2 border rounded font-mono min-h-32 bg-gray-900 text-gray-100"
              placeholder="Masukkan kode..."
            />
          </div>
        );

      case BlockType.QUOTE:
        return (
          <textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            className="w-full p-2 border rounded min-h-20 border-l-4 border-blue-500"
            placeholder="Masukkan kutipan..."
          />
        );

      case BlockType.LIST:
        return (
          <textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            className="w-full p-2 border rounded min-h-32"
            placeholder="Satu item per baris..."
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => addBlock(BlockType.TEXT)} variant="secondary">
          + Text
        </Button>
        <Button onClick={() => addBlock(BlockType.HEADING)} variant="secondary">
          + Heading
        </Button>
        <Button onClick={() => addBlock(BlockType.IMAGE)} variant="secondary">
          + Gambar
        </Button>
        <Button onClick={() => addBlock(BlockType.CODE)} variant="secondary">
          + Kode
        </Button>
        <Button onClick={() => addBlock(BlockType.QUOTE)} variant="secondary">
          + Kutipan
        </Button>
        <Button onClick={() => addBlock(BlockType.LIST)} variant="secondary">
          + List
        </Button>
      </div>

      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div key={block.id} className="border rounded p-4 bg-white">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                {block.type.toUpperCase()}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => moveBlock(block.id, 'up')}
                  disabled={index === 0}
                  className="text-sm text-blue-600 disabled:text-gray-400"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveBlock(block.id, 'down')}
                  disabled={index === blocks.length - 1}
                  className="text-sm text-blue-600 disabled:text-gray-400"
                >
                  ↓
                </button>
                <button
                  onClick={() => deleteBlock(block.id)}
                  className="text-sm text-red-600"
                >
                  Hapus
                </button>
              </div>
            </div>
            {renderBlockEditor(block)}
          </div>
        ))}
      </div>

      {blocks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Klik tombol di atas untuk menambahkan block
        </div>
      )}
    </div>
  );
}