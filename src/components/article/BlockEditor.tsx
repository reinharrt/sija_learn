// ============================================
// src/components/article/BlockEditor.tsx
// Block Editor Component - Neobrutalist Design with Dark Mode
// ============================================

'use client';

import { useState } from 'react';
import { ContentBlock, BlockType } from '@/types';
import { generateUniqueId } from '@/lib/utils';
import { parseMarkdownToBlocks, readFileAsText, validateMarkdownFile } from '@/lib/markdownParser';
import { useNotification } from '@/contexts/NotificationContext';
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
  Plus,
  FileUp,
  X,
  AlertCircle
} from 'lucide-react';

interface BlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

// Auto-resize textarea component
const AutoResizeTextarea = ({
  value,
  onChange,
  placeholder,
  className,
  minHeight = "min-h-24"
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}) => {
  return (
    <textarea
      value={value}
      onChange={(e) => {
        onChange(e);
        // Auto-resize
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
      }}
      // Auto-resize on focus and mount (via ref callback)
      ref={(el) => {
        if (el) {
          el.style.height = 'auto';
          el.style.height = `${el.scrollHeight}px`;
        }
      }}
      className={`${className} ${minHeight} resize-none overflow-hidden`}
      placeholder={placeholder}
    />
  );
};

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const { showToast } = useNotification();
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');

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
      showToast('error', error.message || 'Gagal upload gambar');
    } finally {
      setUploadingBlockId(null);
    }
  };

  const handleMarkdownImport = async (file: File) => {
    setImporting(true);
    setImportError('');

    try {
      // Validate file
      const validation = validateMarkdownFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Read file content
      const content = await readFileAsText(file);

      // Parse markdown to blocks
      const newBlocks = parseMarkdownToBlocks(content);

      if (newBlocks.length === 0) {
        throw new Error('File markdown kosong atau tidak valid');
      }

      // Apply import mode
      if (importMode === 'replace') {
        onChange(newBlocks);
      } else {
        // Append: update order for new blocks
        const updatedNewBlocks = newBlocks.map((block, index) => ({
          ...block,
          order: blocks.length + index,
        }));
        onChange([...blocks, ...updatedNewBlocks]);
      }

      // Close modal and reset
      setShowImportModal(false);
      setImportMode('append');
    } catch (error: any) {
      setImportError(error.message || 'Gagal mengimport file');
    } finally {
      setImporting(false);
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
          <AutoResizeTextarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            className="w-full px-3 py-2 border-2 border-sija-border bg-sija-background text-sija-text focus:outline-none focus:border-sija-primary font-medium transition-colors duration-300"
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
            <AutoResizeTextarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              className="w-full px-3 py-2 border-2 border-sija-border font-mono bg-gray-900 dark:bg-black text-green-400 dark:text-green-300 focus:outline-none focus:border-sija-primary transition-colors duration-300"
              placeholder="Masukkan kode..."
              minHeight="min-h-32"
            />
          </div>
        );

      case BlockType.QUOTE:
        return (
          <AutoResizeTextarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            className="w-full px-3 py-2 border-2 border-sija-border bg-sija-background text-sija-text border-l-4 border-l-sija-primary focus:outline-none focus:border-sija-primary italic font-medium transition-colors duration-300"
            placeholder="Masukkan kutipan..."
            minHeight="min-h-20"
          />
        );

      case BlockType.LIST:
        return (
          <AutoResizeTextarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            className="w-full px-3 py-2 border-2 border-sija-border bg-sija-background text-sija-text focus:outline-none focus:border-sija-primary font-medium transition-colors duration-300"
            placeholder="Satu item per baris..."
            minHeight="min-h-32"
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

          {/* Import from Markdown Button */}
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 border-2 border-green-600 font-bold text-sm text-white hover:shadow-hard-sm hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
          >
            <FileUp className="w-4 h-4" />
            Import Markdown
          </button>
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
      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-sija-surface border-2 border-sija-border shadow-hard w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-sija-text uppercase flex items-center gap-2">
                <FileUp className="w-6 h-6" />
                Import Markdown
              </h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1 hover:bg-sija-light dark:hover:bg-sija-dark/30 transition-colors"
                disabled={importing}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {importError && (
              <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-600 dark:border-red-500 px-4 py-3 mb-6 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <p className="font-bold text-sm text-red-700 dark:text-red-300">{importError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-sija-text mb-2">
                  Metode Import
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="w-4 h-4 text-sija-primary focus:ring-sija-primary border-gray-300"
                    />
                    <span className="text-sm font-medium">Tambahkan di bawah</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="w-4 h-4 text-sija-primary focus:ring-sija-primary border-gray-300"
                    />
                    <span className="text-sm font-medium">Ganti semua blocks</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-sija-text mb-2">
                  Upload File (.md)
                </label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-sija-border border-dashed bg-sija-light dark:bg-sija-dark/30 hover:bg-sija-background transition-colors cursor-pointer">
                  {importing ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-sija-primary" />
                      <span className="text-sm font-bold text-sija-text/60">Processing...</span>
                    </div>
                  ) : (
                    <>
                      <FileUp className="w-8 h-8 text-sija-text/40 mb-2" />
                      <span className="text-sm font-bold text-sija-text/60">Klik untuk upload</span>
                      <span className="text-xs text-sija-text/40 mt-1">Max 5MB</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".md"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleMarkdownImport(file);
                    }}
                    disabled={importing}
                  />
                </label>
              </div>

              <div className="pt-2 text-xs text-sija-text/60">
                <p className="font-bold mb-1">Catatan:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Support Heading 1-3, Text, List, Quote, Code Block, Image.</li>
                  <li>Gambar harus berupa URL public atau path yang valid.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}