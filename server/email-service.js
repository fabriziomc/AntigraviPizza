import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Email Service for sending guest invitations
 * Uses Gmail SMTP with Nodemailer
 */

// Configure SMTP transport
const createTransporter = () => {
    const config = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    };

    // Validate configuration
    if (!config.auth.user || !config.auth.pass) {
        console.warn('⚠️  Email service not configured. Set SMTP_USER and SMTP_PASS in .env');
        return null;
    }

    return nodemailer.createTransport(config);
};

/**
 * Generate HTML email template for guest invitation
 */
function generateEmailHTML(guestName, pizzaNightName, guestPageUrl, themeData) {
    const primaryColor = themeData?.config?.colors?.primary || '#7c2d12';
    const emoji = themeData?.config?.emoji || '🍕';

    return `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invito - ${pizzaNightName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); overflow: hidden;">
                    
                    <!-- Header with gradient -->
                    <tr>
                        <td style="background: linear-gradient(135deg, ${primaryColor} 0%, #1e3a8a 100%); padding: 40px 30px; text-align: center;">
                            <div style="font-size: 64px; margin-bottom: 15px;">${emoji}</div>
                            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">
                                ${pizzaNightName}
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #1e3a8a; font-size: 24px; margin: 0 0 20px 0;">
                                Ciao ${guestName}! 👋
                            </h2>
                            
                            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                Sei invitato a una fantastica <strong>Serata Pizza</strong>! 
                                Abbiamo preparato per te una pagina personalizzata con tutti i dettagli dell'evento.
                            </p>
                            
                            <!-- CTA Button -->
                            <div style="text-align: center; margin: 35px 0;">
                                <a href="${guestPageUrl}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-size: 18px; font-weight: 700; box-shadow: 0 8px 20px rgba(245,158,11,0.4); text-transform: uppercase; letter-spacing: 1px;">
                                    🍕 Vedi la Tua Pagina
                                </a>
                            </div>
                            
                            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 25px 0 0 0; padding: 20px; background: #f9fafb; border-radius: 10px; border-left: 4px solid #f59e0b;">
                                💡 <strong>Suggerimento:</strong> Salva questo link tra i preferiti per accedere rapidamente alla tua pagina personalizzata!
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 2px solid #e5e7eb;">
                            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                                Con affetto,<br>
                                <strong>Il Team AntigraviPizza</strong> 🍕❤️
                            </p>
                            <p style="color: #9ca3af; font-size: 12px; margin: 15px 0 0 0;">
                                Questa è un'email automatica. Se hai difficoltà con il link, copia e incolla questo URL nel browser:<br>
                                <a href="${guestPageUrl}" style="color: #3b82f6; text-decoration: none; word-break: break-all;">${guestPageUrl}</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}

/**
 * Generate plain text version of email (fallback)
 */
function generateEmailText(guestName, pizzaNightName, guestPageUrl) {
    return `
Ciao ${guestName}! 👋

Sei invitato alla Serata Pizza: ${pizzaNightName}

Abbiamo creato per te una pagina personalizzata con tutti i dettagli dell'evento.

Accedi alla tua pagina qui:
${guestPageUrl}

💡 Suggerimento: Salva questo link tra i preferiti per accedere rapidamente!

Con affetto,
Il Team AntigraviPizza 🍕❤️
    `.trim();
}

/**
 * Send guest invitation email
 * @param {string} guestEmail - Guest email address
 * @param {string} guestName - Guest name
 * @param {string} pizzaNightName - Pizza night event name
 * @param {string} guestPageUrl - URL to personalized guest page
 * @param {object} themeData - Optional theme data for styling
 * @returns {Promise<object>} - Email send result
 */
export async function sendGuestInvite(guestEmail, guestName, pizzaNightName, guestPageUrl, themeData = null) {
    const transporter = createTransporter();

    if (!transporter) {
        throw new Error('Email service not configured. Please set SMTP credentials in .env');
    }

    const mailOptions = {
        from: process.env.SMTP_FROM || `"AntigraviPizza" <${process.env.SMTP_USER}>`,
        to: guestEmail,
        subject: `🍕 Invito: ${pizzaNightName}`,
        text: generateEmailText(guestName, pizzaNightName, guestPageUrl),
        html: generateEmailHTML(guestName, pizzaNightName, guestPageUrl, themeData)
    };

    try {
        console.log(`📧 Sending email to ${guestEmail}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully: ${info.messageId}`);
        return {
            success: true,
            messageId: info.messageId,
            recipient: guestEmail
        };
    } catch (error) {
        console.error(`❌ Failed to send email to ${guestEmail}:`, error.message);
        throw error;
    }
}

/**
 * Verify email configuration
 * @returns {Promise<boolean>}
 */
export async function verifyEmailConfig() {
    const transporter = createTransporter();

    if (!transporter) {
        return false;
    }

    try {
        await transporter.verify();
        console.log('✅ Email service configured correctly');
        return true;
    } catch (error) {
        console.error('❌ Email service configuration error:', error.message);
        return false;
    }
}

export default {
    sendGuestInvite,
    verifyEmailConfig
};
