import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    // Validate required environment variables
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email configuration missing:', {
        EMAIL_HOST: process.env.EMAIL_HOST ? 'set' : 'missing',
        EMAIL_USER: process.env.EMAIL_USER ? 'set' : 'missing',
        EMAIL_PASS: process.env.EMAIL_PASS ? 'set' : 'missing',
        EMAIL_FROM: process.env.EMAIL_FROM ? 'set' : 'missing',
      });
      throw new Error('Email configuration is incomplete. Please check EMAIL_HOST, EMAIL_USER, and EMAIL_PASS environment variables.');
    }

    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log('Email transporter created successfully with host:', process.env.EMAIL_HOST);
  }
  return transporter;
}

export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  try {
    const mailTransporter = getTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
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