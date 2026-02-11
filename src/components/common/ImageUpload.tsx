// ============================================
// src/components/common/ImageUpload.tsx
// Image Upload Component - Neobrutalist Design with Dark Mode
// ============================================

'use client';

import { useState, useRef, useEffect } from 'react';
import { getAuthHeaders } from '@/contexts/AuthContext';
import { Upload, Image as ImageIcon, Trash2, RefreshCw, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  currentImage?: string;
  type?: 'banner' | 'content';
  label?: string;
  aspectRatio?: string;
}

export default function ImageUpload({
  onUploadSuccess,
  currentImage,
  type = 'content',
  label = 'Upload Gambar',
  aspectRatio = '16/9'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || '');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync preview with currentImage prop
  useEffect(() => {
    if (currentImage !== preview) {
      setPreview(currentImage || '');
    }
  }, [currentImage]);


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }

    setError('');
    setUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

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

      setPreview(data.url);
      onUploadSuccess(data.url);

      if (data.originalSize && data.size) {
        const reduction = ((data.originalSize - data.size) / data.originalSize * 100).toFixed(1);
        console.log(`Image compressed: ${reduction}% smaller`);
      }

    } catch (err: any) {
      setError(err.message);
      setPreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onUploadSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-bold text-sija-text uppercase tracking-wider transition-colors duration-300">
        {label}
      </label>

      {preview ? (
        <div className="space-y-3">
          <div
            className="relative overflow-hidden border-2 border-sija-border shadow-hard transition-colors duration-300"
            style={{ aspectRatio }}
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 bg-sija-primary text-white px-4 py-2 border-2 border-sija-primary font-bold text-sm shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Ganti Gambar
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-2 bg-red-600 dark:bg-red-700 text-white px-4 py-2 border-2 border-red-600 dark:border-red-700 font-bold text-sm shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-300"
            >
              <Trash2 className="w-4 h-4" />
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-sija-border p-8 text-center transition-all duration-300 ${uploading ? 'cursor-wait bg-sija-light dark:bg-sija-dark/30' : 'cursor-pointer hover:border-sija-primary hover:bg-blue-50 dark:hover:bg-blue-950/30'
            }`}
          style={{ aspectRatio }}
        >
          <div className="flex flex-col items-center justify-center h-full">
            {uploading ? (
              <>
                <Loader2 className="w-12 h-12 text-sija-primary animate-spin mb-3" />
                <p className="text-sm font-bold text-sija-text transition-colors duration-300">Uploading & Compressing...</p>
                <p className="text-xs text-sija-text/60 dark:text-sija-text/50 mt-1 transition-colors duration-300">Mohon tunggu sebentar</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-sija-light dark:bg-sija-dark/50 border-2 border-sija-border flex items-center justify-center mb-3 transition-colors duration-300">
                  <Upload className="w-8 h-8 text-sija-text" />
                </div>
                <p className="text-sm font-bold text-sija-text mb-1 transition-colors duration-300">
                  Klik untuk upload gambar
                </p>
                <p className="text-xs text-sija-text/60 dark:text-sija-text/50 transition-colors duration-300">
                  Max 5MB • Auto-compress • JPG, PNG, WebP
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-500 dark:border-red-400 px-3 py-2 transition-colors duration-300">
          <p className="text-red-700 dark:text-red-300 text-sm font-bold transition-colors duration-300">⚠️ {error}</p>
        </div>
      )}
    </div>
  );
}