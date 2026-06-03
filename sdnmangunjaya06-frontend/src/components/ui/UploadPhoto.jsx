import React, { useState, useEffect } from 'react';
import Avatar from './Avatar.jsx';

export default function UploadPhoto({ onChange, initialPreview = null, name = '', size = 'md', className = '' }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initialPreview);
  const [error, setError] = useState('');

  // Sync initialPreview changes
  useEffect(() => {
    if (!file) {
      setPreview(initialPreview);
    }
  }, [initialPreview, file]);

  const handleFileChange = (e) => {
    setError('');
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      setPreview(initialPreview);
      onChange?.(null);
      return;
    }

    // Validate size (500 KB)
    if (selectedFile.size > 500 * 1024) {
      setError('Ukuran foto maksimal 500 KB.');
      e.target.value = '';
      setFile(null);
      setPreview(initialPreview);
      onChange?.(null);
      return;
    }

    // Validate format (jpg, jpeg, png, webp)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];

    if (!allowedTypes.includes(selectedFile.type) && !allowedExts.includes(ext)) {
      setError('Format foto harus JPG, JPEG, PNG, atau WEBP.');
      e.target.value = '';
      setFile(null);
      setPreview(initialPreview);
      onChange?.(null);
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    onChange?.(selectedFile);
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="relative group cursor-pointer">
        <Avatar photoUrl={preview} name={name} size={size} className="ring-4 ring-slate-100/50 group-hover:brightness-95 transition-all" />
      </div>
      
      <div className="w-full text-center">
        <input
          type="file"
          id="photo-upload-input"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[11px] file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer w-full text-center max-w-[240px]"
        />
        {error && (
          <p className="mt-1.5 text-xs font-semibold text-rose-600 animate-fade-in">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
