// ============================================
// src/components/article/BlockEditor.tsx
// Block Editor Component - Neobrutalist Design with Dark Mode
// ============================================

'use client';

import { useState } from 'react';
import { ContentBlock, BlockType } from '@/types';
import { generateUniqueId } from '@/lib/utils';
import {
  Type,
  Heading1,
  Image as ImageIcon,
  Code2,
  Quote,
  List,
  ChevronUp,
  ChevronDown,
  Trash2,
  Loader2,
  Plus
} from 'lucide-react';

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

  const blockTypes = [
    { type: BlockType.TEXT, label: 'Text', icon: Type },
    { type: BlockType.HEADING, label: 'Heading', icon: Heading1 },
    { type: BlockType.IMAGE, label: 'Gambar', icon: ImageIcon },
    { type: BlockType.CODE, label: 'Kode', icon: Code2 },
    { type: BlockType.QUOTE, label: 'Kutipan', icon: Quote },
    { type: BlockType.LIST, label: 'List', icon: List },
  ];

  const renderBlockEditor = (block: ContentBlock) => {
    switch (block.type) {
      case BlockType.TEXT:
        return (
          <textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            className="w-full px-3 py-2 border-2 border-sija-border bg-sija-background text-sija-text focus:outline-none focus:border-sija-primary min-h-24 font-medium transition-colors duration-300"
            placeholder="Masukkan teks..."
          />
        );

      case BlockType.HEADING:
        return (
          <div className="space-y-3">
            <select
              value={block.metadata?.level || 2}
              onChange={(e) =>
                updateBlock(block.id, {
                  metadata: { ...block.metadata, level: parseInt(e.target.value) },
                })
              }
              className="px-3 py-2 border-2 border-sija-border bg-sija-background text-sija-text focus:outline-none focus:border-sija-primary font-bold transition-colors duration-300"
            >
              <option value={1}>Heading 1 (Besar)</option>
              <option value={2}>Heading 2 (Sedang)</option>
              <option value={3}>Heading 3 (Kecil)</option>
            </select>
            <input
              type="text"
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              className="w-full px-3 py-2 border-2 border-sija-border bg-sija-background text-sija-text focus:outline-none focus:border-sija-primary font-bold text-lg transition-colors duration-300"
              placeholder="Masukkan heading..."
            />
          </div>
        );

      case BlockType.IMAGE:
        return (
          <div className="space-y-3">
            <div className="flex gap-2">
              <label className="flex-1 cursor-pointer">
                <div className="px-4 py-2 bg-sija-light dark:bg-sija-dark/30 border-2 border-sija-border font-bold hover:bg-sija-background transition-all text-center duration-300">
                  {uploadingBlockId === block.id ? (
                    <span className="flex items-center justify-center gap-2 text-sija-text">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2 text-sija-text">
                      <ImageIcon className="w-4 h-4" />
                      Pilih Gambar
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(block.id, file);
                    }
                  }}
                  className="hidden"
                  disabled={uploadingBlockId === block.id}
                />
              </label>
            </div>

            <input
              type="text"
              value={block.metadata?.alt || ''}
              onChange={(e) =>
                updateBlock(block.id, {
                  metadata: { ...block.metadata, alt: e.target.value },
                })
              }
              className="w-full px-3 py-2 border-2 border-sija-border bg-sija-background text-sija-text focus:outline-none focus:border-sija-primary transition-colors duration-300"
              placeholder="Alt text (deskripsi gambar)..."
            />

            {block.content && (
              <div className="mt-3 p-3 bg-sija-light dark:bg-sija-dark/30 border-2 border-sija-border transition-colors duration-300">
                <img
                  src={block.content}
                  alt="Preview"
                  className="max-w-full h-auto border-2 border-sija-border shadow-hard"
                />
                <p className="text-xs text-sija-text/60 dark:text-sija-text/50 mt-2 font-mono break-all transition-colors duration-300">
                  {block.content}
                </p>
              </div>
            )}
          </div>
        );

      case BlockType.CODE:
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={block.metadata?.language || ''}
              onChange={(e) =>
                updateBlock(block.id, {
                  metadata: { ...block.metadata, language: e.target.value },
                })
              }
              className="px-3 py-2 border-2 border-sija-border bg-sija-background text-sija-text focus:outline-none focus:border-sija-primary font-mono transition-colors duration-300"
              placeholder="Bahasa (javascript, python, dll)..."
            />
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              className="w-full px-3 py-2 border-2 border-sija-border font-mono min-h-32 bg-gray-900 dark:bg-black text-green-400 dark:text-green-300 focus:outline-none focus:border-sija-primary transition-colors duration-300"
              placeholder="Masukkan kode..."
            />
          </div>
        );

      case BlockType.QUOTE:
        return (
          <textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            className="w-full px-3 py-2 border-2 border-sija-border bg-sija-background text-sija-text border-l-4 border-l-sija-primary focus:outline-none focus:border-sija-primary min-h-20 italic font-medium transition-colors duration-300"
            placeholder="Masukkan kutipan..."
          />
        );

      case BlockType.LIST:
        return (
          <textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            className="w-full px-3 py-2 border-2 border-sija-border bg-sija-background text-sija-text focus:outline-none focus:border-sija-primary min-h-32 font-medium transition-colors duration-300"
            placeholder="Satu item per baris..."
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Block Buttons */}
      <div className="bg-sija-light dark:bg-sija-dark/30 p-4 border-2 border-sija-border transition-colors duration-300">
        <p className="text-xs font-bold text-sija-text/70 dark:text-sija-text/60 mb-3 uppercase tracking-wider transition-colors duration-300">
          Tambah Block Baru
        </p>
        <div className="flex flex-wrap gap-2">
          {blockTypes.map(({ type, label, icon: Icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => addBlock(type)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sija-surface border-2 border-sija-border font-bold text-sm hover:shadow-hard-sm hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all text-sija-text duration-300"
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Blocks List */}
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className="bg-sija-surface border-2 border-sija-border shadow-hard transition-colors duration-300"
          >
            {/* Block Header */}
            <div className="flex justify-between items-center px-4 py-3 bg-sija-light dark:bg-sija-dark/30 border-b-2 border-sija-border transition-colors duration-300">
              <div className="flex items-center gap-2">
                <div className="px-2 py-1 bg-sija-primary text-white text-xs font-bold uppercase">
                  {block.type}
                </div>
                <span className="text-xs text-sija-text/60 dark:text-sija-text/50 font-mono transition-colors duration-300">
                  Block #{index + 1}
                </span>
              </div>

              {/* Block Actions */}
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => moveBlock(block.id, 'up')}
                  disabled={index === 0}
                  className="p-1.5 border-2 border-sija-border bg-sija-surface hover:bg-sija-light dark:hover:bg-sija-dark/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sija-text duration-300"
                  title="Pindah ke atas"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(block.id, 'down')}
                  disabled={index === blocks.length - 1}
                  className="p-1.5 border-2 border-sija-border bg-sija-surface hover:bg-sija-light dark:hover:bg-sija-dark/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sija-text duration-300"
                  title="Pindah ke bawah"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteBlock(block.id)}
                  className="p-1.5 border-2 border-sija-border bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 transition-all duration-300"
                  title="Hapus block"
                >
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>

            {/* Block Content */}
            <div className="p-4">
              {renderBlockEditor(block)}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {blocks.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-sija-border bg-sija-light dark:bg-sija-dark/30 transition-colors duration-300">
          <Plus className="w-12 h-12 text-sija-text/40 dark:text-sija-text/30 mx-auto mb-3" />
          <p className="text-sija-text font-bold mb-1 transition-colors duration-300">Belum Ada Block</p>
          <p className="text-sm text-sija-text/60 dark:text-sija-text/50 transition-colors duration-300">
            Klik tombol di atas untuk menambahkan block konten
          </p>
        </div>
      )}
    </div>
  );
}