import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface FileUploadProps {
  label: string;
  labelCn: string;
  accept?: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  icon?: React.ReactNode;
  required?: boolean;
  hint?: string;
  hintCn?: string;
  error?: string;
}

export function FileUpload({
  label, labelCn, accept = '.pdf', file, onFileChange, icon,
  required = false, hint, hintCn, error,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) onFileChange(droppedFile);
  }, [onFileChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) onFileChange(selectedFile);
  }, [onFileChange]);

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-foreground">
        {label} <span className="text-muted-foreground text-xs">({labelCn})</span>
        {required ? (
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Required</Badge>
        ) : (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Optional</Badge>
        )}
      </label>
      {hint && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {hint}
          {hintCn && <span className="block mt-0.5">{hintCn}</span>}
        </p>
      )}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer",
          error && "border-destructive/50 bg-destructive/5",
          isDragging
            ? "border-accent bg-accent/5"
            : file
              ? "border-success/50 bg-success/5"
              : "border-border hover:border-accent/50 hover:bg-muted/50"
        )}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center justify-center gap-3"
            >
              <FileText className="h-6 w-6 text-success" />
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileChange(null);
                }}
                className="ml-2 p-1 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-1"
            >
              {icon || <Upload className="h-8 w-8 mx-auto text-muted-foreground" />}
              <p className="text-xs text-muted-foreground">
                Drag & drop or click · 拖拽或点击上传
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}
