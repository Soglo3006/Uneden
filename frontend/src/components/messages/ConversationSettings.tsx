"use client";

import { useState } from 'react';
import { Search, BellOff, Bell, Trash2, Ban, Flag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';

interface ConversationSettingsProps {
  otherUser?: {
    id?: string;
    full_name?: string;
    company_name?: string;
    account_type?: string;
  } | null;
  messages?: any[];
  onClose: () => void;
  onDeleteConversation: () => Promise<void>;
  onBlockUser: () => Promise<void>;
  isMuted: boolean;
  onToggleMute: () => void;
  onReportUser: (reason: string, details: string) => Promise<void>;
  isBlocked?: boolean;
  onUnblockUser?: () => Promise<void>;
  onMessageClick?: (messageId: string) => void;
}

export function ConversationSettings({
  otherUser,
  messages = [],
  onClose,
  onDeleteConversation,
  onBlockUser,
  onReportUser,
  onUnblockUser,
  isMuted,
  onToggleMute,
  isBlocked,
  onMessageClick,
}: ConversationSettingsProps) {
  const [confirmAction, setConfirmAction] = useState<'delete' | 'block' | 'unblock' | 'report' | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const displayName = otherUser?.account_type === 'company'
    ? otherUser.company_name
    : otherUser?.full_name || 'Unknown';

  // Filtrer les messages selon la recherche
  const searchResults = searchQuery.trim().length >= 2
    ? messages.filter(m =>
        m.content &&
        !m.content.startsWith('[FILE:') &&
        !m.content.startsWith('[AUDIO:') &&
        m.content !== 'Message supprimé' &&
        m.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (confirmAction === 'delete') await onDeleteConversation();
      if (confirmAction === 'block') await onBlockUser();
      if (confirmAction === 'unblock') await onUnblockUser?.();
      setConfirmAction(null);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason || !reportDetails.trim()) return;
    setLoading(true);
    try {
      await onReportUser(reportReason, reportDetails);
      setShowReportModal(false);
      setReportReason('');
      setReportDetails('');
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const confirmTexts = {
    delete: {
      title: 'Supprimer la conversation',
      description: 'Cette action est irréversible. Tous les messages seront supprimés.',
      button: 'Supprimer',
      color: 'bg-red-500 hover:bg-red-600',
    },
    block: {
      title: `Bloquer ${displayName}`,
      description: `${displayName} ne pourra plus vous envoyer de messages.`,
      button: 'Bloquer',
      color: 'bg-red-500 hover:bg-red-600',
    },
    report: {
      title: `Signaler ${displayName}`,
      description: 'Voulez-vous signaler cet utilisateur à notre équipe ?',
      button: 'Signaler',
      color: 'bg-red-500 hover:bg-red-600',
    },
    unblock: {
      title: `Débloquer ${displayName}`,
      description: `${displayName} pourra à nouveau vous envoyer des messages.`,
      button: 'Débloquer',
      color: 'bg-green-700 hover:bg-green-800',
    },
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="shrink-0 p-4 bg-gray-50 border-b flex items-center justify-between h-[73px]">
        <h3 className="text-lg font-semibold">Paramètres</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className='cursor-pointer'>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {/* RECHERCHE */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
              Rechercher
            </p>
          </div>
          <div className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher dans la conversation..."
                className="pl-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Résultats */}
            {searchQuery.trim().length >= 2 && (
              <div className="mt-2">
                {searchResults.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-3">Aucun résultat</p>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    <p className="text-xs text-gray-400 mb-2">
                      {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
                    </p>
                    {searchResults.map((msg) => {
                      const senderName = msg.sender?.account_type === 'company'
                        ? msg.sender.company_name
                        : msg.sender?.full_name || 'Moi';
                      
                      // Highlight le mot recherché
                      const idx = msg.content.toLowerCase().indexOf(searchQuery.toLowerCase());
                      const before = msg.content.substring(0, idx);
                      const match = msg.content.substring(idx, idx + searchQuery.length);
                      const after = msg.content.substring(idx + searchQuery.length);
                      const preview = msg.content.length > 60
                        ? msg.content.substring(0, 60) + '...'
                        : msg.content;

                      return (
                        <button
                          key={msg.id}
                          onClick={() => {
                            onMessageClick?.(msg.id);
                            onClose();
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <p className="text-xs font-medium text-gray-700">{senderName}</p>
                          <p className="text-xs text-gray-500 truncate">
                            {before}
                            <span className="bg-yellow-200 text-yellow-900 rounded px-0.5">{match}</span>
                            {after.length > 30 ? after.substring(0, 30) + '...' : after}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(msg.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {searchQuery.trim().length === 1 && (
              <p className="text-xs text-gray-400 text-center py-2">Entrez au moins 2 caractères</p>
            )}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border divide-y overflow-hidden">
          <button
            onClick={onToggleMute}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left cursor-pointer"
          >
            {isMuted
              ? <Bell className="h-5 w-5 text-gray-500" />
              : <BellOff className="h-5 w-5 text-gray-500" />
            }
            <span className="text-sm text-gray-700 cursor-pointer">
              {isMuted ? 'Réactiver les notifications' : 'Désactiver les notifications'}
            </span>
          </button>
        </div>

        {/* Actions dangereuses */}
        <div className="bg-white rounded-xl border divide-y overflow-hidden">
          <button
            onClick={() => setConfirmAction('delete')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left cursor-pointer"
          >
            <Trash2 className="h-5 w-5 text-gray-700" />
            <span className="text-sm text-gray-700">Supprimer la conversation</span>
          </button>

          {isBlocked ? (
            <button
              onClick={() => setConfirmAction('unblock')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition-colors text-left cursor-pointer"
            >
              <Ban className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Débloquer {displayName}</span>
            </button>
          ) : (
            <button
              onClick={() => setConfirmAction('block')}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left cursor-pointer"
            >
              <Ban className="h-5 w-5 text-gray-700" />
              <span className="text-sm text-gray-700">Bloquer {displayName}</span>
            </button>
          )}

          <button
            onClick={() => setShowReportModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left cursor-pointer"
          >
            <Flag className="h-5 w-5 text-gray-700" />
            <span className="text-sm text-gray-700">Signaler {displayName}</span>
          </button>
        </div>
      </div>

      {/* Modal confirmation */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmAction && confirmTexts[confirmAction].title}</DialogTitle>
            <DialogDescription>
              {confirmAction && confirmTexts[confirmAction].description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button className='cursor-pointer' variant="outline" onClick={() => setConfirmAction(null)}>Annuler</Button>
            <Button
              className={`text-white cursor-pointer ${confirmAction && confirmTexts[confirmAction].color}`}
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'En cours...' : confirmAction && confirmTexts[confirmAction].button}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal signalement */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Signaler {displayName}</DialogTitle>
            <DialogDescription>Dites-nous pourquoi vous signalez cet utilisateur.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Raison</label>
              <Select value={reportReason} onValueChange={setReportReason} >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir une raison" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inappropriate">Comportement inapproprié</SelectItem>
                  <SelectItem value="fraud">Fraude / Arnaque</SelectItem>
                  <SelectItem value="harassment">Harcèlement</SelectItem>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="fake">Faux profil</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Détails</label>
              <Textarea
                placeholder="Décrivez le problème en détail..."
                className="min-h-[100px] resize-none"
                value={reportDetails}
                onChange={(e) => setReportDetails(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button className='cursor-pointer' variant="outline" onClick={() => setShowReportModal(false)}>Annuler</Button>
            <Button
              className="bg-red-500 hover:bg-red-600 text-white cursor-pointer"
              onClick={handleReport}
              disabled={loading || !reportReason || !reportDetails.trim()}
            >
              {loading ? 'Envoi...' : 'Envoyer le signalement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal succès */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="text-center">
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Flag className="h-8 w-8 text-green-700" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-center">Signalement envoyé</DialogTitle>
              <DialogDescription className="text-center">
                Merci de nous aider à garder FieldHearts sûr. Notre équipe va examiner votre signalement.
              </DialogDescription>
            </DialogHeader>
            <Button
              className="bg-green-700 hover:bg-green-800 text-white w-full cursor-pointer"
              onClick={() => { setShowSuccessModal(false); onClose(); }}
            >
              Fermer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}