import DOMPurify from 'dompurify';

/**
 * Nettoie le contenu HTML pour éviter les attaques XSS
 * Garde seulement les balises sûres
 */
export function sanitizeMessage(content: string): string {
  // Configuration DOMPurify : autorise seulement certaines balises
  const cleanContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
  
  return cleanContent;
}

/**
 * Nettoie et convertit les retours à la ligne en <br>
 */
export function sanitizeAndFormatMessage(content: string): string {
  // D'abord sanitize
  const clean = sanitizeMessage(content);
  
  // Puis convertir les \n en <br>
  return clean.replace(/\n/g, '<br>');
}