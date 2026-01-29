// ============================================
// src/components/common/ImageUpload.tsx
// Image Upload Component - Neobrutalist Design
// ============================================

'use client';

import { useState, useRef } from 'react';
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }

    setError('');
    setUploading(true);

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
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

      // Show compression info
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
      <label className="block text-sm font-bold text-gray-900 uppercase tracking-wider">
        {label}
      </label>

      {preview ? (
        <div className="space-y-3">
          <div 
            className="relative overflow-hidden border-2 border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 border-2 border-blue-600 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Ganti Gambar
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 border-2 border-red-600 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed border-gray-900 p-8 text-center transition-all ${
            uploading ? 'cursor-wait bg-gray-100' : 'cursor-pointer hover:border-blue-600 hover:bg-blue-50'
          }`}
          style={{ aspectRatio }}
        >
          <div className="flex flex-col items-center justify-center h-full">
            {uploading ? (
              <>
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-3" />
                <p className="text-sm font-bold text-gray-900">Uploading & Compressing...</p>
                <p className="text-xs text-gray-600 mt-1">Mohon tunggu sebentar</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-gray-100 border-2 border-gray-900 flex items-center justify-center mb-3">
                  <Upload className="w-8 h-8 text-gray-900" />
                </div>
                <p className="text-sm font-bold text-gray-900 mb-1">
                  Klik untuk upload gambar
                </p>
                <p className="text-xs text-gray-600">
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
        <div className="bg-red-50 border-2 border-red-500 px-3 py-2">
          <p className="text-red-700 text-sm font-bold">⚠️ {error}</p>
        </div>
      )}
    </div>
  );
}