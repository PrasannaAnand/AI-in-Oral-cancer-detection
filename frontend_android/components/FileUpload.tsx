import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  label?: string;
  helperText?: string;
  accept?: string;
  required?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  file, 
  onFileChange, 
  label = "Upload Image", 
  helperText, 
  accept = ".jpg,.jpeg,.png",
  required = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileChange(e.target.files[0]);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {!file ? (
        <div 
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors group"
        >
          <div className="bg-slate-100 p-3 rounded-full mb-3 group-hover:bg-blue-50 transition-colors">
            <Upload className="w-6 h-6 text-slate-500 group-hover:text-blue-500" />
          </div>
          <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
          <p className="text-xs text-slate-500 mt-1">Supported formats: JPG, PNG</p>
          <input 
            type="file" 
            ref={inputRef}
            className="hidden" 
            onChange={handleChange} 
            accept={accept}
          />
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg p-3 flex items-center justify-between bg-white shadow-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center flex-shrink-0">
              {file.type.startsWith('image/') ? (
                <img 
                  src={URL.createObjectURL(file)} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded" 
                  onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                />
              ) : (
                <ImageIcon className="w-5 h-5 text-slate-500" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
              <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFileChange(null);
            }}
            className="p-1 hover:bg-red-50 rounded-full text-slate-400 hover:text-red-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      {helperText && <p className="mt-2 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};
