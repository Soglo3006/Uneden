import { supabase } from '@/lib/supabaseClient';

interface Reaction {
  emoji: string;
  user_ids: string[];
}

export function useMessageReactions() {
  const toggleReaction = async (
    messageId: string,
    emoji: string,
    userId: string,
    currentReactions: Reaction[]
  ) => {
    try {

      let updatedReactions = [...currentReactions];

      // RETIRER l'utilisateur de TOUTES les réactions existantes
      updatedReactions = updatedReactions.map(reaction => ({
        ...reaction,
        user_ids: reaction.user_ids.filter(id => id !== userId)
      }));

      // Supprimer les réactions vides
      updatedReactions = updatedReactions.filter(r => r.user_ids.length > 0);

      // Trouver si l'emoji cliqué existe déjà
      const reactionIndex = updatedReactions.findIndex(r => r.emoji === emoji);

      if (reactionIndex !== -1) {
        // L'emoji existe déjà → ajouter l'utilisateur
        updatedReactions[reactionIndex].user_ids.push(userId);
      } else {
        // Nouvelle réaction → créer
        updatedReactions.push({
          emoji,
          user_ids: [userId],
        });
      }

      // Mettre à jour dans la DB
      const { error, data } = await supabase
        .from('messages')
        .update({ reactions: updatedReactions })
        .eq('id', messageId)
        .select();

      if (error) {
        throw error;
      }

      return updatedReactions;
    } catch (error) {
      throw error;
    }
  };

  return { toggleReaction };
}