import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    // Validate required environment variables for Brevo
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('Email configuration missing:', {
        SMTP_HOST: process.env.SMTP_HOST ? 'set' : 'missing',
        SMTP_USER: process.env.SMTP_USER ? 'set' : 'missing',
        SMTP_PASS: process.env.SMTP_PASS ? 'set' : 'missing',
        FROM_EMAIL: process.env.FROM_EMAIL ? 'set' : 'missing',
      });
      throw new Error('Email configuration is incomplete. Please check SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.');
    }

    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log('Email transporter created successfully with host:', process.env.SMTP_HOST);
  }
  return transporter;
}

export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  try {
    const mailTransporter = getTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: email,
      subject: 'Verification Code',
      text: `Your verification code is: ${code}`,
      html: `<p>Your verification code is: <strong>${code}</strong></p>`,
    };

    console.log('Attempting to send verification email to:', email);
    
    const info = await mailTransporter.sendMail(mailOptions);
    
    console.log('Verification email sent successfully:', {
      messageId: info.messageId,
      to: email,
      response: info.response
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}