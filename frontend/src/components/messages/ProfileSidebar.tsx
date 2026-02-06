"use client";

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star } from 'lucide-react';

interface ProfileSidebarProps {
  otherUser?: {
    id?: string;
    full_name?: string;
    company_name?: string;
    account_type?: string;
    avatar_url?: string;
    bio?: string;
  } | null;
}

export function ProfileSidebar({ otherUser }: ProfileSidebarProps) {
  if (!otherUser) {
    return (
      <div className="w-80 border-l bg-gray-50 flex flex-col">
        <div className="flex items-center justify-center h-full text-gray-500">
          <p className="text-sm text-center px-4">
            Select a conversation to view profile details
          </p>
        </div>
      </div>
    );
  }

  const isPerson = otherUser.account_type === 'person';
  const isCompany = otherUser.account_type === 'company';
  const displayName = isPerson
    ? otherUser.full_name
    : isCompany
    ? otherUser.company_name
    : 'Unknown';

  return (
    <div className="w-80 border-l bg-gray-50 flex flex-col">
      {/* Header sticky */}
      <div className="sticky top-0 z-10 p-6 bg-gray-50 border-b">
        <h3 className="text-lg font-semibold text-center">About</h3>
      </div>

      {/* Contenu scrollable */}
      <ScrollArea className="flex-1 px-6" style={{ height: 'calc(100vh - 400px)' }}>
        <div className="py-4">
          <div className="text-center mb-6">
            <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-white shadow-lg">
              {otherUser.avatar_url ? (
                <AvatarImage src={otherUser.avatar_url} alt={displayName || 'User'} />
              ) : null}
              <AvatarFallback className="text-2xl">
                {(displayName || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <h4 className="text-lg font-semibold mb-2">{displayName}</h4>
            
            <div className="flex items-center justify-center gap-1 mt-2">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium">N/A</span>
              <span className="text-sm text-gray-500">(0 reviews)</span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Member since</span>
              <span className="font-medium">January 2026</span>
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Bio</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              {otherUser.bio || 'No bio available'}
            </p>
          </div>
        </div>
      </ScrollArea>

      {/* Bouton fixe en bas */}
      <div className="sticky bottom-0 p-6 bg-gray-50 border-t">
        <Link href={`/profile/${otherUser.id}`}>
          <Button className="w-full bg-green-700 hover:bg-green-800 text-white">
            View Full Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}