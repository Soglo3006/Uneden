"use client";

import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, X } from 'lucide-react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  placeholder?: string;
  attachedFile: File | null;
  attachmentPreview: string | null;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export function MessageInput({
  value,
  onChange,
  onSend,
  onKeyPress,
  disabled,
  placeholder,
  attachedFile,
  attachmentPreview,
  onFileSelect,
  onRemoveAttachment,
  fileInputRef,
}: MessageInputProps) {
  return (
    <div className="sticky bottom-0 p-4 border-t bg-white">
      {/* Aperçu du fichier attaché */}
      {attachedFile && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            {attachmentPreview ? (
              <img 
                src={attachmentPreview} 
                alt="Preview" 
                className="h-16 w-16 object-cover rounded"
              />
            ) : (
              <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs text-gray-500">PDF</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {attachedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(attachedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemoveAttachment}
              className="text-gray-400 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-3 items-center">
        {/* Bouton d'attachment */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={onFileSelect}
          className="hidden"
        />
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <span className="text-xl">+</span>
        </Button>

        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1"
        />

        <Button
          onClick={onSend}
          disabled={(!value.trim() && !attachedFile) || disabled}
          size="icon"
          className="bg-green-700 hover:bg-green-800 shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}