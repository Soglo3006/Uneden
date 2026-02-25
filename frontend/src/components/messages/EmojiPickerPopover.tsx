"use client";

import { useState, useRef } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';
import { QuickReactions } from './QuickReactions';

interface EmojiPickerPopoverProps {
  onEmojiSelect: (emoji: string) => void;
  onOpenChange?: (open: boolean) => void;
}

export function EmojiPickerPopover({ onEmojiSelect, onOpenChange }: EmojiPickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const [showFullPicker, setShowFullPicker] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    setOpen(false);
    onOpenChange?.(false);
    setShowFullPicker(false);
  };

  const handleQuickEmojiSelect = (emoji: string) => {
    onEmojiSelect(emoji);
    setOpen(false);
    onOpenChange?.(false);
    setShowFullPicker(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) setShowFullPicker(false);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 bg-white border border-gray-200 hover:bg-gray-50 rounded-full shadow-sm cursor-pointer"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            const newOpen = !open;
            setOpen(newOpen);
            onOpenChange?.(newOpen);
          }}
        >
          <Smile className="h-3 w-3 text-gray-600" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        side="top"
        sideOffset={8}
        className="w-auto p-0 border-0 bg-transparent shadow-none rounded-none"
        onInteractOutside={(e) => {
          e.preventDefault(); // ← empêche la fermeture au clic extérieur
          setOpen(false);
          setShowFullPicker(false);
        }}
        onPointerDownOutside={(e) => {
          setOpen(false);
          setShowFullPicker(false);
        }}
      >
        {!showFullPicker ? (
          <QuickReactions
            onEmojiSelect={handleQuickEmojiSelect}
            onShowPicker={() => setShowFullPicker(true)}
          />
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width={340}
              height={420}
              searchPlaceHolder="Search"
              skinTonesDisabled
              previewConfig={{ showPreview: false }}
              lazyLoadEmojis
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}