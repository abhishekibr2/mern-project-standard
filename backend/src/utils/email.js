/**
 * Email utility functions
 * Email sending and template utilities following FANG standards
 */

const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('./logger');

/**
 * Create email transporter
 */
const createTransporter = () => {
  // In development, use a test account or local SMTP
  if (config.env === 'development') {
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }

  // Production configuration
  if (config.email.service === 'gmail') {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: config.email.username,
        pass: config.email.password
      }
    });
  }

  // Generic SMTP configuration
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

/**
 * Send email
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@mernapp.com',
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html
    };

    if (config.env === 'development') {
      logger.info('Email would be sent in production:', mailOptions);
      return { messageId: 'dev-message-id' };
    }

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (user, verificationToken) => {
  const verificationUrl = `${config.frontendUrl}/verify-email/${verificationToken}`;
  
  const message = `
    Welcome to our MERN application, ${user.firstName}!
    
    Please verify your email address by clicking the link below:
    ${verificationUrl}
    
    This link will expire in 24 hours.
    
    If you didn't create an account, please ignore this email.
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to MERN App!</h2>
      <p>Hi ${user.firstName},</p>
      <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">
        This email was sent by MERN Backend. If you have any questions, please contact our support team.
      </p>
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Welcome! Please verify your email address',
    message,
    html
  });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${config.frontendUrl}/reset-password/${resetToken}`;
  
  const message = `
    Password Reset Request
    
    Hi ${user.firstName},
    
    You requested a password reset. Click the link below to reset your password:
    ${resetUrl}
    
    This link will expire in 10 minutes.
    
    If you didn't request a password reset, please ignore this email.
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset Request</h2>
      <p>Hi ${user.firstName},</p>
      <p>You requested a password reset for your MERN App account.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>This link will expire in 10 minutes.</p>
      <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">
        This email was sent by MERN Backend. If you have any questions, please contact our support team.
      </p>
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Password Reset Request (expires in 10 minutes)',
    message,
    html
  });
};

/**
 * Send password change notification
 */
const sendPasswordChangeNotification = async (user) => {
  const message = `
    Password Changed Successfully
    
    Hi ${user.firstName},
    
    Your password has been successfully changed.
    
    If you didn't change your password, please contact our support team immediately.
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Changed Successfully</h2>
      <p>Hi ${user.firstName},</p>
      <p>This is a confirmation that your password has been successfully changed.</p>
      <p>If you didn't change your password, please contact our support team immediately.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="color: #666; font-size: 12px;">
        This email was sent by MERN Backend. If you have any questions, please contact our support team.
      </p>
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Password Changed Successfully',
    message,
    html
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangeNotification
};
