import React, { useState, useRef } from 'react';
import { FiUploadCloud, FiTrash2, FiFile, FiCheckCircle } from 'react-icons/fi';

export const ImageUpload = ({ onImageSelected, error }) => {
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;

    // Check if it is an image
    if (!file.type.startsWith('image/')) {
      alert("Invalid file format. Please select an image file (PNG, JPG, JPEG).");
      return;
    }

    // Check size limit (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Image size should be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      // Pass base64 representation or URL back to form
      onImageSelected(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPreview(null);
    onImageSelected(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-slate-700 dark:text-slate-350 tracking-wide uppercase">
        Upload Issue Image
      </span>

      <div
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition duration-200 min-h-[220px]
          ${
            preview
              ? 'border-brand-500/40 bg-brand-50/10 dark:bg-brand-950/5'
              : dragActive
              ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10'
              : error
              ? 'border-red-500 bg-red-50/20 dark:bg-red-950/10'
              : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-brand-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {preview ? (
          <div className="relative flex flex-col items-center gap-4 w-full h-full max-w-sm">
            {/* Image Preview */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm aspect-video w-full">
              <img src={preview} alt="Upload Preview" className="w-full h-full object-cover" />
              <button
                onClick={handleClear}
                className="absolute top-2.5 right-2.5 rounded-lg bg-red-500/90 text-white p-1.5 hover:bg-red-600 transition shadow-md active:scale-90"
                title="Remove photo"
              >
                <FiTrash2 className="h-4 w-4" />
              </button>
            </div>
            {/* Success indicator */}
            <div className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 font-bold bg-brand-500/10 px-3 py-1 rounded-full">
              <FiCheckCircle className="h-3.5 w-3.5" />
              <span>Image Uploaded Successfully</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 dark:bg-brand-950/20 text-brand-500">
              <FiUploadCloud className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                Drag and drop your image here
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-550 mt-1">
                Supports JPG, JPEG, or PNG formats up to 5MB
              </p>
            </div>
            <button
              type="button"
              className="mt-1 text-xs font-bold text-brand-650 hover:text-brand-700 dark:text-brand-450 dark:hover:text-brand-400"
            >
              Browse Files
            </button>
          </div>
        )}
      </div>
      {error && (
        <span className="text-xs font-medium text-red-500 dark:text-red-400 mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
};
