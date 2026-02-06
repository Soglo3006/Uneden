"use client";

import { Button } from '@/components/ui/button';
import { Smile, MessageCircle, MoreVertical, Star } from 'lucide-react';
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

interface MessageActionsProps {
  messageKey: string;
  openMenuKey: string | null;
  setOpenMenuKey: (key: string | null) => void;
  onReact?: () => void;
  onReply?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
}

export function MessageActions({
  messageKey,
  openMenuKey,
  setOpenMenuKey,
  onReact,
  onReply,
  onPin,
  onDelete,
}: MessageActionsProps) {
  return (
    <div className="flex items-center gap-1 mt-1">
      {/* Bouton Réagir */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-white border border-gray-200 hover:bg-gray-50 rounded-full shadow-sm"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onReact?.();
            }}
          >
            <Smile className="h-3 w-3 text-gray-600" />
          </Button>
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
            className="h-7 w-7 bg-white border border-gray-200 hover:bg-gray-50 rounded-full shadow-sm"
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
        onOpenChange={(open) => setOpenMenuKey(open ? messageKey : null)}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 bg-white border border-gray-200 hover:bg-gray-50 rounded-full shadow-sm"
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
            onSelect={() => {
              setOpenMenuKey(null);
              onReply?.();
            }}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Répondre
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              setOpenMenuKey(null);
              onPin?.();
            }}
          >
            <Star className="mr-2 h-4 w-4" />
            Épingler
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
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