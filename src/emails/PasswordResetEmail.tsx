import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from "react";


interface PasswordResetEmailProps {
  userName?: string | null;
  resetUrl: string; // The URL containing the reset token
  storeName?: string;
  storeUrl?: string;
}

const baseUrl = process.env.STORE_URL ? process.env.STORE_URL : 'http://localhost:3000'; // Fallback URL
const defaultStoreName = 'Coffee Craft';

export const PasswordResetEmail = ({
  userName,
  resetUrl,
  storeName = defaultStoreName,
  storeUrl = baseUrl,
}: PasswordResetEmailProps) => {
  const previewText = `Reset your password for ${storeName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Reset Your Password</Heading>
          <Section style={bodySection}>
            <Text style={paragraph}>
              Hi {userName || 'there'},
            </Text>
            <Text style={paragraph}>
              Someone requested a password reset for your {storeName} account.
              If this was you, click the button below to set a new password.
              This link is valid for a limited time (e.g., 1 hour).
            </Text>
            <Button style={button} href={resetUrl}>
              Reset Password
            </Button>
            <Text style={paragraph}>
              If you didn't request this, please ignore this email. Your password
              will remain unchanged.
            </Text>
            <Text style={paragraph}>
              Button not working? You can also copy and paste this link into your browser:
            </Text>
            <Link href={resetUrl} style={link}>
              {resetUrl}
            </Link>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
             <Text style={footerText}>
              If you have any questions, reply to this email or contact us at{' '}
              <Link href={`mailto:support@${storeUrl.replace(/https?:\/\//, '')}`} style={link}>
                support@yourstore.com {/* Replace with actual support email */}
              </Link>.
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} {storeName}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordResetEmail;

// Basic Styles (reuse or adapt from OrderConfirmationEmail styles)
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  border: '1px solid #f0f0f0',
  borderRadius: '4px',
};

const heading = {
  fontSize: '28px',
  fontWeight: 'bold',
  marginTop: '20px',
  textAlign: 'center' as const,
  color: '#484848',
};

const bodySection = {
    padding: '0 40px',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#525f7f',
};

const button = {
  backgroundColor: '#5e6ad2', // Example button color
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px',
  margin: '24px 0',
};

const link = {
  color: '#5e6ad2',
  wordBreak: 'break-all' as const,
};

const hr = {
  borderColor: '#dfe1e4',
  margin: '40px 0',
};

const footer = {
  padding: '0 20px',
  marginTop: '20px',
};

const footerText = {
  fontSize: '12px',
  color: '#8898aa', // gray-500
  lineHeight: '15px',
  textAlign: 'center' as const,
  marginBottom: '10px',
};