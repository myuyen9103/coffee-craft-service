// src/services/email.service.ts
import { Resend } from 'resend';
import * as React from 'react';
import 'dotenv/config'; // Or your method for loading env vars

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined in environment variables');
}
if (!process.env.EMAIL_SENDER_ADDRESS) {
  throw new Error('EMAIL_SENDER_ADDRESS is not defined in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);
const senderAddress = process.env.EMAIL_SENDER_ADDRESS;

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  // Add other options like cc, bcc if needed
}

export const sendEmail = async ({ to, subject, react }: SendEmailOptions): Promise<void> => {
  try {
    const { data, error } = await resend.emails.send({
      from: senderAddress,
      to: to,
      subject: subject,
      react: react, // Pass the React element directly
    });

    if (error) {
      console.error(`Error sending email to ${Array.isArray(to) ? to.join(', ') : to}:`, error);
      // Consider more robust error handling/logging (e.g., using a dedicated logger)
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log(`Email sent successfully to ${Array.isArray(to) ? to.join(', ') : to}. ID: ${data?.id}`);

  } catch (err) {
    console.error('Caught exception in sendEmail:', err);
    if (err instanceof Error) {
         throw new Error(`Email sending failed: ${err.message}`);
    } else {
         throw new Error('An unknown error occurred during email sending.');
    }
  }
};