import { Resend } from "resend";

let _resend = null;
const getResend = () => {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
};
const FROM = process.env.FROM_EMAIL || "Uneden <noreply@uneden.ca>";
const FRONTEND = process.env.FRONTEND_URL || "https://uneden.ca";

// Templates 

const base = (content) => `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
        <!-- Header -->
        <tr>
          <td style="background:#15803d;padding:24px 32px;">
            <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Uneden</span>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:32px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;background:#f3f4f6;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} Uneden · <a href="${FRONTEND}" style="color:#15803d;text-decoration:none;">uneden.ca</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const btn = (href, label, color = "#15803d") =>
  `<a href="${href}" style="display:inline-block;background:${color};color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;margin-top:16px;">${label}</a>`;

const emailTemplates = {
  bookingCreated: (workerName, clientName, serviceTitle, bookingId) => ({
    subject: "Nouvelle réservation reçue",
    html: base(`
      <h2 style="margin:0 0 8px;color:#111827;">Nouvelle réservation !</h2>
      <p style="color:#374151;">Bonjour <strong>${workerName}</strong>,</p>
      <p style="color:#374151;"><strong>${clientName}</strong> a fait une demande pour votre service :</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="margin:0;font-weight:600;color:#166534;">${serviceTitle}</p>
        <p style="margin:4px 0 0;font-size:12px;color:#6b7280;">Réservation #${bookingId.slice(0, 8)}</p>
      </div>
      <p style="color:#374151;">Connectez-vous pour accepter ou refuser cette demande.</p>
      ${btn(`${FRONTEND}/bookings`, "Voir la réservation")}
    `),
  }),

  bookingStatusUpdated: (clientName, serviceTitle, status, bookingId) => ({
    subject: `Votre réservation a été ${status === "accepted" ? "acceptée " : "refusée"}`,
    html: base(`
      <h2 style="margin:0 0 8px;color:${status === "accepted" ? "#15803d" : "#dc2626"};">
        Réservation ${status === "accepted" ? "acceptée " : "refusée"}
      </h2>
      <p style="color:#374151;">Bonjour <strong>${clientName}</strong>,</p>
      <p style="color:#374151;">Votre réservation pour <strong>"${serviceTitle}"</strong> a été
        ${status === "accepted" ? "<strong style='color:#15803d'>acceptée</strong>" : "<strong style='color:#dc2626'>refusée</strong>"}.
      </p>
      ${status === "accepted" ? `<p style="color:#374151;">Vous pouvez maintenant procéder au paiement pour confirmer la prestation.</p>
      ${btn(`${FRONTEND}/bookings`, "Payer maintenant")}` :
      `${btn(`${FRONTEND}/listings`, "Trouver un autre service", "#6b7280")}`}
    `),
  }),

  newMessage: (receiverName, senderName, messagePreview, conversationId) => ({
    subject: `Nouveau message de ${senderName}`,
    html: base(`
      <h2 style="margin:0 0 8px;color:#111827;">Nouveau message</h2>
      <p style="color:#374151;">Bonjour <strong>${receiverName}</strong>,</p>
      <p style="color:#374151;"><strong>${senderName}</strong> vous a envoyé un message :</p>
      <div style="background:#f9fafb;border-left:4px solid #15803d;padding:12px 16px;margin:20px 0;border-radius:0 8px 8px 0;">
        <p style="margin:0;color:#374151;font-style:italic;">"${messagePreview}"</p>
      </div>
      ${btn(`${FRONTEND}/messages`, "Répondre")}
    `),
  }),

  unreadReminder: (receiverName, senderName, unreadCount) => ({
    subject: `Vous avez ${unreadCount > 1 ? `${unreadCount} messages non lus` : "un message non lu"} sur Uneden`,
    html: base(`
      <h2 style="margin:0 0 8px;color:#111827;">Vous avez des messages en attente</h2>
      <p style="color:#374151;">Bonjour <strong>${receiverName}</strong>,</p>
      <p style="color:#374151;">
        <strong>${senderName}</strong> vous a envoyé
        ${unreadCount > 1 ? `<strong>${unreadCount} messages</strong>` : "un message"}
        il y a plus de 24h et attend votre réponse.
      </p>
      <p style="color:#6b7280;font-size:14px;">Ne laissez pas cette opportunité passer !</p>
      ${btn(`${FRONTEND}/messages`, "Voir mes messages")}
    `),
  }),

  newReview: (targetName, reviewerName, rating, comment) => ({
    subject: `Nouvelle évaluation reçue — ${rating}/5 ⭐`,
    html: base(`
      <h2 style="margin:0 0 8px;color:#111827;">Nouvelle évaluation !</h2>
      <p style="color:#374151;">Bonjour <strong>${targetName}</strong>,</p>
      <p style="color:#374151;"><strong>${reviewerName}</strong> vous a laissé une évaluation :</p>
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="margin:0;font-size:22px;">${"⭐".repeat(rating)}</p>
        ${comment ? `<p style="margin:10px 0 0;color:#374151;">"${comment}"</p>` : ""}
      </div>
      ${btn(`${FRONTEND}/profile/edit`, "Voir mon profil")}
    `),
  }),

  welcome: (userName) => ({
    subject: "Bienvenue sur Uneden !",
    html: base(`
      <h2 style="margin:0 0 8px;color:#111827;">Bienvenue sur Uneden, ${userName} !</h2>
      <p style="color:#374151;">Votre profil est prêt. Vous pouvez maintenant :</p>
      <ul style="color:#374151;padding-left:20px;line-height:1.8;">
        <li>Publier vos services ou chercher de l'aide</li>
        <li>Contacter d'autres membres directement</li>
        <li>Gérer vos réservations et paiements</li>
      </ul>
      ${btn(`${FRONTEND}/listings`, "Explorer les services")}
    `),
  }),

  passwordChanged: (userName) => ({
    subject: "Votre mot de passe a été modifié",
    html: base(`
      <h2 style="margin:0 0 8px;color:#111827;">Mot de passe modifié</h2>
      <p style="color:#374151;">Bonjour <strong>${userName}</strong>,</p>
      <p style="color:#374151;">Votre mot de passe Uneden a été modifié avec succès.</p>
      <p style="color:#374151;">Si vous n'êtes pas à l'origine de cette modification, contactez-nous immédiatement.</p>
      ${btn(`${FRONTEND}/profile/edit`, "Sécuriser mon compte", "#dc2626")}
    `),
  }),

  disputeCreated: (userName, bookingId, description) => ({
    subject: "Un litige a été ouvert",
    html: base(`
      <h2 style="margin:0 0 8px;color:#dc2626;">Litige ouvert</h2>
      <p style="color:#374151;">Bonjour <strong>${userName}</strong>,</p>
      <p style="color:#374151;">Un litige a été ouvert pour la réservation <strong>#${bookingId.slice(0, 8)}</strong> :</p>
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:20px 0;">
        <p style="margin:0;color:#374151;">${description}</p>
      </div>
      <p style="color:#374151;">Notre équipe va examiner la situation. Vous serez contacté sous peu.</p>
      ${btn(`${FRONTEND}/bookings`, "Voir mes réservations", "#dc2626")}
    `),
  }),
};

// ── Core sender ────────────────────────────────────────────────────────────────

export const sendEmail = async (to, templateName, templateData) => {
  try {
    if (!to) { console.error("sendEmail: no recipient"); return false; }
    if (!process.env.RESEND_API_KEY) { console.warn("RESEND_API_KEY not set — skipping email"); return false; }

    const template = emailTemplates[templateName](...templateData);
    const { error } = await getResend().emails.send({ from: FROM, to, subject: template.subject, html: template.html });

    if (error) { console.error("Resend error:", error); return false; }
    return true;
  } catch (err) {
    console.error("sendEmail error:", err.message);
    return false;
  }
};

// ── Named helpers (same API as before — no changes needed in controllers) ──────

export const notifyBookingCreated = (workerEmail, workerName, clientName, serviceTitle, bookingId) =>
  sendEmail(workerEmail, "bookingCreated", [workerName, clientName, serviceTitle, bookingId]);

export const notifyBookingStatusUpdated = (clientEmail, clientName, serviceTitle, status, bookingId) =>
  sendEmail(clientEmail, "bookingStatusUpdated", [clientName, serviceTitle, status, bookingId]);

export const notifyNewMessage = (receiverEmail, receiverName, senderName, messagePreview, conversationId) =>
  sendEmail(receiverEmail, "newMessage", [receiverName, senderName, messagePreview, conversationId]);

export const notifyUnreadReminder = (receiverEmail, receiverName, senderName, unreadCount) =>
  sendEmail(receiverEmail, "unreadReminder", [receiverName, senderName, unreadCount]);

export const notifyNewReview = (targetEmail, targetName, reviewerName, rating, comment) =>
  sendEmail(targetEmail, "newReview", [targetName, reviewerName, rating, comment]);

export const notifyDisputeCreated = (userEmail, userName, bookingId, description) =>
  sendEmail(userEmail, "disputeCreated", [userName, bookingId, description]);

export const notifyPasswordChanged = (userEmail, userName) =>
  sendEmail(userEmail, "passwordChanged", [userName]);

export const notifyWelcome = (userEmail, userName) =>
  sendEmail(userEmail, "welcome", [userName]);

export default {
  sendEmail,
  notifyBookingCreated,
  notifyBookingStatusUpdated,
  notifyNewMessage,
  notifyNewReview,
  notifyDisputeCreated,
  notifyPasswordChanged,
};
