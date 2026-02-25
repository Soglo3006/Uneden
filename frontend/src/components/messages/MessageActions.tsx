"use client";

import { Button } from '@/components/ui/button';
import { Smile, MessageCircle, MoreVertical, Star, Pencil } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { EmojiPickerPopover } from './EmojiPickerPopover';

interface MessageActionsProps {
  messageKey: string;
  openMenuKey: string | null;
  setOpenMenuKey: (key: string | null) => void;
  isPinned?: boolean;
  onReact?: (emoji: string) => void;
  onReply?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onEmojiOpenChange?: (open: boolean) => void;
}

export function MessageActions({
  messageKey,
  openMenuKey,
  setOpenMenuKey,
  isPinned,
  onReact,
  onReply,
  onPin,
  onDelete,
  onEdit,
  onEmojiOpenChange,
}: MessageActionsProps) {
  return (
    <div className="flex items-center gap-1 mt-1">
      {/* Bouton Réagir avec EmojiPicker + Tooltip */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <EmojiPickerPopover
              onEmojiSelect={(emoji) => onReact?.(emoji)}
              onOpenChange={(open) => {
                if (open) setOpenMenuKey(null);
                onEmojiOpenChange?.(open);
              }}
              onOpenChange={onEmojiOpenChange}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Réagir</p>
        </TooltipContent>
      </Tooltip>

      {/* Bouton Répondre */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-white border border-gray-200 hover:bg-gray-50 rounded-full shadow-sm cursor-pointer"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onReply?.();
            }}
          >
            <MessageCircle className="h-3 w-3 text-gray-600" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Répondre</p>
        </TooltipContent>
      </Tooltip>

      {/* Bouton Plus (Dropdown) */}
      <DropdownMenu
        open={openMenuKey === messageKey}
        onOpenChange={(open) => {
          if (open) onEmojiOpenChange?.(false);
          setOpenMenuKey(open ? messageKey : null);
        }}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 bg-white border border-gray-200 hover:bg-gray-50 rounded-full shadow-sm cursor-pointer"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3 w-3 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Plus</p>
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent
          align="end"
          className="z-[9999]"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => {
              setOpenMenuKey(null);
              onReply?.();
            }}
          >
            Répondre
          </DropdownMenuItem>

          {onEdit && (
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => {
                setOpenMenuKey(null);
                onEdit?.();
              }}
            >
              Modifier
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => {
              setOpenMenuKey(null);
              onPin?.();
            }}
          >
            {isPinned ? 'Désépingler' : 'Épingler'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 cursor-pointer"
            onSelect={() => {
              setOpenMenuKey(null);
              onDelete?.();
            }}
          >
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}