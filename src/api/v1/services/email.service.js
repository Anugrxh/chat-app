const nodemailer = require('nodemailer');
const env = require('../../../config/env');

// Create reusable transporter
let transporter = null;

/**
 * Initialize the email transporter
 */
const initTransporter = () => {
    if (transporter) return transporter;

    // In development without SMTP configured, use console logging
    // Check for placeholder or missing credentials
    const isSmtpConfigured = env.SMTP_USER &&
        env.SMTP_PASS &&
        !env.SMTP_USER.includes('your-email') &&
        !env.SMTP_PASS.includes('your-app-password');

    if (env.isDev && !isSmtpConfigured) {
        console.log('📧 Email service running in development mode (OTP will be logged to console)');
        return null;
    }


    transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465, // Use TLS for port 465
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS
        },
        pool: true, // Use connection pooling
        maxConnections: 5,
        maxMessages: 100
    });

    return transporter;
};

/**
 * Generate HTML email template for OTP
 * @param {string} otp - The OTP code
 * @param {string} purpose - Purpose of OTP (verification, login, password_reset)
 * @returns {string} HTML email content
 */
const getOtpEmailTemplate = (otp, purpose = 'verification') => {
    const purposeText = {
        verification: 'verify your email address',
        login: 'log in to your account',
        password_reset: 'reset your password'
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verification Code</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td align="center" style="padding: 40px 0;">
                    <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Chat App</h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px;">
                                <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 22px; font-weight: 600;">Verification Code</h2>
                                <p style="margin: 0 0 30px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                                    Use the following code to ${purposeText[purpose] || 'complete your verification'}:
                                </p>
                                
                                <!-- OTP Code -->
                                <div style="background-color: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px;">
                                    <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #667eea;">${otp}</span>
                                </div>
                                
                                <p style="margin: 0 0 10px 0; color: #999999; font-size: 14px;">
                                    This code will expire in ${env.OTP_EXPIRES_IN_MINUTES} minutes.
                                </p>
                                <p style="margin: 0; color: #999999; font-size: 14px;">
                                    If you didn't request this code, please ignore this email.
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 20px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                                <p style="margin: 0; color: #999999; font-size: 12px;">
                                    © ${new Date().getFullYear()} Chat App. All rights reserved.
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
};

/**
 * Send OTP email
 * @param {string} email - Recipient email address
 * @param {string} otp - The OTP code
 * @param {string} purpose - Purpose of OTP
 * @returns {Promise<boolean>} Success status
 */
const sendOTPEmail = async (email, otp, purpose = 'verification') => {
    const transport = initTransporter();

    // Development mode: log OTP to console
    if (!transport) {
        console.log('═══════════════════════════════════════');
        console.log(`📧 OTP for ${email}: ${otp}`);
        console.log(`   Purpose: ${purpose}`);
        console.log(`   Expires in: ${env.OTP_EXPIRES_IN_MINUTES} minutes`);
        console.log('═══════════════════════════════════════');
        return true;
    }

    const mailOptions = {
        from: `"Chat App" <${env.SMTP_FROM}>`,
        to: email,
        subject: 'Your Verification Code - Chat App',
        html: getOtpEmailTemplate(otp, purpose)
    };

    try {
        await transport.sendMail(mailOptions);
        console.log(`📧 OTP email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Failed to send OTP email:', error.message);
        throw new Error('Failed to send verification email');
    }
};

module.exports = {
    sendOTPEmail
};
