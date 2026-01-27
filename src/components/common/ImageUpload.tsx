// ============================================
// src/components/common/ImageUpload.tsx
// Image Upload Component - Image upload handler
// ============================================

'use client';

import { useState, useRef } from 'react';
import { getAuthHeaders } from '@/contexts/AuthContext';

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
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {preview ? (
        <div className="relative">
          <div 
            className="relative overflow-hidden rounded-lg border-2 border-gray-300"
            style={{ aspectRatio }}
          >
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Ganti Gambar
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
          style={{ aspectRatio }}
        >
          <div className="flex flex-col items-center justify-center h-full">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-gray-600">Uploading & compressing...</p>
              </>
            ) : (
              <>
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  Klik untuk upload gambar
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Max 5MB, akan di-compress otomatis
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
      />

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}