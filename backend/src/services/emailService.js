import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});


transporter.verify((error, success) => {
  if (error) {
    console.error("Email configuration error:", error);
  } else {
    console.log("Email server ready");
  }
});

const emailTemplates = {
  bookingCreated: (workerName, clientName, serviceTitle, bookingId) => ({
    subject: "Nouvelle réservation reçue",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Nouvelle réservation !</h2>
        <p>Bonjour <strong>${workerName}</strong>,</p>
        <p>Vous avez reçu une nouvelle réservation de <strong>${clientName}</strong> pour votre service :</p>
        <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0; color: #1F2937;">${serviceTitle}</h3>
          <p style="color: #6B7280; margin: 5px 0;">Réservation ID: ${bookingId}</p>
        </div>
        <p>Connectez-vous pour accepter ou refuser cette réservation.</p>
        <a href="${process.env.FRONTEND_URL}/bookings/${bookingId}" 
           style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin-top: 10px;">
          Voir la réservation
        </a>
      </div>
    `,
  }),

  bookingStatusUpdated: (clientName, serviceTitle, status, bookingId) => ({
    subject: `Votre réservation a été ${status === "accepted" ? "acceptée" : "refusée"}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${status === "accepted" ? "#10B981" : "#EF4444"};">
          Réservation ${status === "accepted" ? "acceptée " : "refusée "}
        </h2>
        <p>Bonjour <strong>${clientName}</strong>,</p>
        <p>Votre réservation pour "<strong>${serviceTitle}</strong>" a été 
           ${status === "accepted" ? "acceptée" : "refusée"}.</p>
        <a href="${process.env.FRONTEND_URL}/bookings/${bookingId}" 
           style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin-top: 10px;">
          Voir les détails
        </a>
      </div>
    `,
  }),

  newMessage: (receiverName, senderName, messagePreview, conversationId) => ({
    subject: "Nouveau message reçu",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Nouveau message de ${senderName}</h2>
        <p>Bonjour <strong>${receiverName}</strong>,</p>
        <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #1F2937;">"${messagePreview}"</p>
        </div>
        <a href="${process.env.FRONTEND_URL}/messages/${conversationId}" 
           style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin-top: 10px;">
          Répondre au message
        </a>
      </div>
    `,
  }),

  newReview: (targetName, reviewerName, rating, comment) => ({
    subject: `Nouvelle évaluation reçue (${rating}/5)`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Nouvelle évaluation !</h2>
        <p>Bonjour <strong>${targetName}</strong>,</p>
        <p><strong>${reviewerName}</strong> vous a laissé une évaluation :</p>
        <div style="background: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #F59E0B; font-size: 24px; margin: 0;">
            ${"⭐".repeat(rating)}
          </p>
          <p style="margin: 10px 0 0 0; color: #1F2937;">"${comment}"</p>
        </div>
        <a href="${process.env.FRONTEND_URL}/profile" 
           style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin-top: 10px;">
          Voir mon profil
        </a>
      </div>
    `,
  }),

  disputeCreated: (userName, bookingId, description) => ({
    subject: " Un litige a été ouvert",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #EF4444;">Litige ouvert</h2>
        <p>Bonjour <strong>${userName}</strong>,</p>
        <p>Un litige a été ouvert concernant votre réservation :</p>
        <div style="background: #FEF2F2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
          <p style="margin: 0; color: #1F2937;"><strong>Description :</strong></p>
          <p style="margin: 5px 0 0 0; color: #6B7280;">${description}</p>
        </div>
        <a href="${process.env.FRONTEND_URL}/disputes/${bookingId}" 
           style="display: inline-block; background: #EF4444; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 6px; margin-top: 10px;">
          Voir le litige
        </a>
      </div>
    `,
  }),
};


export const sendEmail = async (to, templateName, templateData) => {
  try {
    if (!to) {
      console.error(" No recipient email provided");
      return false;
    }

    const template = emailTemplates[templateName](...templateData);

    const mailOptions = {
      from: `"${process.env.APP_NAME || "Service App"}" <${process.env.EMAIL_USER}>`,
      to,
      subject: template.subject,
      html: template.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error(" Error sending email:", error);
    return false;
  }
};

export const notifyBookingCreated = async (workerEmail, workerName, clientName, serviceTitle, bookingId) => {
  return sendEmail(workerEmail, "bookingCreated", [workerName, clientName, serviceTitle, bookingId]);
};

export const notifyBookingStatusUpdated = async (clientEmail, clientName, serviceTitle, status, bookingId) => {
  return sendEmail(clientEmail, "bookingStatusUpdated", [clientName, serviceTitle, status, bookingId]);
};

export const notifyNewMessage = async (receiverEmail, receiverName, senderName, messagePreview, conversationId) => {
  return sendEmail(receiverEmail, "newMessage", [receiverName, senderName, messagePreview, conversationId]);
};

export const notifyNewReview = async (targetEmail, targetName, reviewerName, rating, comment) => {
  return sendEmail(targetEmail, "newReview", [targetName, reviewerName, rating, comment]);
};

export const notifyDisputeCreated = async (userEmail, userName, bookingId, description) => {
  return sendEmail(userEmail, "disputeCreated", [userName, bookingId, description]);
};

export default {
  sendEmail,
  notifyBookingCreated,
  notifyBookingStatusUpdated,
  notifyNewMessage,
  notifyNewReview,
  notifyDisputeCreated,
};