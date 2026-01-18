import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Email Service for sending guest invitations
 * Uses Resend API (HTTP-based, works on Render without SMTP restrictions)
 */

// Initialize Resend lazily to avoid crashing if key is missing
let resend;
function getResend() {
    if (resend) return resend;
    const key = process.env.RESEND_API_KEY;
    if (!key) {
        throw new Error('RESEND_API_KEY not configured. Password recovery and invitations will not work.');
    }
    resend = new Resend(key);
    return resend;
}

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
    console.log('🔵 [sendGuestInvite] Starting email send process (Resend API)');
    console.log('🔵 [sendGuestInvite] Recipient:', guestEmail);

    if (!process.env.RESEND_API_KEY) {
        console.error('🔴 [sendGuestInvite] RESEND_API_KEY not configured');
        throw new Error('Email service not configured. Please set RESEND_API_KEY in environment variables');
    }

    const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    console.log('🔵 [sendGuestInvite] Sending from:', emailFrom);

    try {
        console.log(`📧 Sending email to ${guestEmail}...`);
        console.log('🔵 [sendGuestInvite] Calling resend.emails.send()...');

        const { data, error } = await getResend().emails.send({
            from: emailFrom,
            to: [guestEmail],
            subject: `🍕 Invito: ${pizzaNightName}`,
            text: generateEmailText(guestName, pizzaNightName, guestPageUrl),
            html: generateEmailHTML(guestName, pizzaNightName, guestPageUrl, themeData)
        });

        if (error) {
            console.error('🔴 [sendGuestInvite] Resend API error:', error);
            throw new Error(error.message || 'Failed to send email via Resend');
        }

        console.log('🔵 [sendGuestInvite] Email sent successfully');
        console.log(`✅ Email sent: ID ${data.id}`);

        return {
            success: true,
            messageId: data.id,
            recipient: guestEmail
        };
    } catch (error) {
        console.error(`❌ Failed to send email to ${guestEmail}`);
        console.error('🔴 [sendGuestInvite] Error type:', error.constructor.name);
        console.error('🔴 [sendGuestInvite] Error message:', error.message);
        console.error('🔴 [sendGuestInvite] Full error:', error);
        throw error;
    }
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} resetUrl - URL with token for password reset
 */
export async function sendPasswordResetEmail(email, name, resetUrl) {
    console.log(`🔵 [sendPasswordResetEmail] Sending reset link to ${email}`);

    if (!process.env.RESEND_API_KEY) {
        throw new Error('Email service not configured. Please set RESEND_API_KEY');
    }

    const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';

    const html = `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recupero Password - AntigraviPizza</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden;">
                    <tr>
                        <td style="background: #1e3a8a; padding: 30px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">AntigraviPizza 🍕</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #1e3a8a; font-size: 22px; margin: 0 0 20px 0;">Recupero Password</h2>
                            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                Ciao ${name}, hai richiesto di reimpostare la tua password. Clicca il pulsante qui sotto per procedere.
                            </p>
                            <div style="text-align: center; margin: 35px 0;">
                                <a href="${resetUrl}" style="display: inline-block; background: #f59e0b; color: white; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-size: 16px; font-weight: 700;">
                                    Reimposta Password
                                </a>
                            </div>
                            <p style="color: #6b7280; font-size: 14px; margin: 25px 0 0 0;">
                                Se non hai richiesto tu il reset, puoi ignorare questa email. Il link scadrà tra 1 ora.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px;">
                            <p>AntigraviPizza App</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    const text = `Ciao ${name}, reimposta la tua password cliccando qui: ${resetUrl}. Il link scadrà tra 1 ora.`;

    try {
        const { data, error } = await getResend().emails.send({
            from: emailFrom,
            to: [email],
            subject: '🍕 Recupero Password - AntigraviPizza',
            text,
            html
        });

        if (error) {
            console.error('🔴 [sendPasswordResetEmail] Resend API error:', error);
            throw new Error(error.message || 'Failed to send password reset email');
        }

        console.log(`✅ Reset email sent successfully to ${email}. ID: ${data?.id}`);
        return { success: true, id: data?.id };
    } catch (error) {
        console.error(`❌ Failed to send reset email to ${email}:`, error);
        throw error;
    }
}

/**
 * Send welcome email to new user
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} baseUrl - Base URL of the application
 */
export async function sendWelcomeEmail(email, name, baseUrl = null) {
    console.log(`🔵 [sendWelcomeEmail] Sending welcome email to ${email}`);

    if (!process.env.RESEND_API_KEY) {
        throw new Error('Email service not configured. Please set RESEND_API_KEY');
    }

    const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';

    const html = `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Benvenuto su AntigraviPizza! 🍕</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: white; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden;">
                    <tr>
                        <td style="background: #1e3a8a; padding: 30px; text-align: center;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">AntigraviPizza 🍕</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="color: #1e3a8a; font-size: 22px; margin: 0 0 20px 0;">Benvenuto a bordo, ${name}!</h2>
                            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                Siamo felici di averti con noi. AntigraviPizza è lo strumento definitivo per gestire le tue serate pizza, creare ricette incredibili e stupire i tuoi ospiti.
                            </p>
                            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                                Ecco cosa puoi fare ora:
                            </p>
                            <ul style="color: #374151; font-size: 16px; line-height: 1.6;">
                                <li>✨ Creare la tua prima ricetta</li>
                                <li>🗓️ Pianificare una serata pizza</li>
                                <li>🎨 Scegliere un tema per i tuoi ospiti</li>
                            </ul>
                            <div style="text-align: center; margin: 35px 0;">
                                <a href="${baseUrl || process.env.APP_URL || 'http://localhost:3000'}" style="display: inline-block; background: #f59e0b; color: white; text-decoration: none; padding: 14px 30px; border-radius: 8px; font-size: 16px; font-weight: 700;">
                                    Inizia Ora
                                </a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px;">
                            <p>AntigraviPizza App</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    const text = `Benvenuto su AntigraviPizza, ${name}! Siamo felici di averti con noi. Inizia subito a creare le tue ricette!`;

    try {
        const { data, error } = await getResend().emails.send({
            from: emailFrom,
            to: [email],
            subject: '🍕 Benvenuto su AntigraviPizza!',
            text,
            html
        });

        if (error) {
            console.error('🔴 [sendWelcomeEmail] Resend API error:', error);
            return { success: false, error: error.message };
        }

        console.log(`✅ Welcome email sent successfully to ${email}. ID: ${data?.id}`);
        return { success: true, id: data?.id };
    } catch (error) {
        console.error(`❌ Failed to send welcome email to ${email}:`, error);
        // We don't throw here to avoid failing registration if welcome email fails
        return { success: false, error: error.message };
    }
}

/**
 * Verify email configuration
 * @returns {Promise<boolean>}
 */
export async function verifyEmailConfig() {
    if (!process.env.RESEND_API_KEY) {
        console.error('❌ RESEND_API_KEY is not set');
        return false;
    }

    console.log('✅ Email service configured with Resend');
    console.log('   From:', process.env.EMAIL_FROM || 'onboarding@resend.dev');
    return true;
}

export default {
    sendGuestInvite,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    verifyEmailConfig
};
