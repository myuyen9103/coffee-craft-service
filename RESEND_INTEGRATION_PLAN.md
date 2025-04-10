# Plan: Integrating Resend for Email Sending

This document outlines the steps to integrate the Resend email service into the Coffee Craft e-commerce project for sending transactional and marketing emails.

**Chosen Service:** Resend ([resend.com](https://resend.com))
**Templating Method:** React Email ([react.email](https://react.email/))

## Phase 1: Setup and Configuration

1.  **Resend Account &amp; Domain Setup:**
    *   [ ] Sign up for a free account at [resend.com](https://resend.com).
    *   [ ] Generate an API key from the Resend dashboard.
    *   [ ] Add your domain name (the one you'll send emails *from*, e.g., `yourshop.com`) in the Resend dashboard.
    *   [ ] Follow the instructions to verify the domain by adding the required DNS records (usually DKIM, SPF/DMARC related) through your domain registrar or DNS provider. **This is critical for deliverability.**
    *   [ ] Note the verified "From" email address you will use (e.g., `noreply@yourshop.com`).
2.  **Environment Configuration:**
    *   [ ] Add the Resend API key and sender address to your project's `.env` file:
        ```dotenv
        RESEND_API_KEY=re_xxxxxxxxxxxxxxx
        EMAIL_SENDER_ADDRESS=noreply@yourshop.com # Or your chosen verified sender
        ```
    *   [ ] Ensure `.env` is listed in your `.gitignore` file.
    *   [ ] Ensure your application loads environment variables correctly (e.g., using `dotenv`).
3.  **Install Dependencies:**
    *   [ ] Run the following command in your project terminal:
        ```bash
        pnpm add resend react-email @react-email/components react react-dom
        pnpm add -D @types/react @types/react-dom # If not already present for backend use
        ```

## Phase 2: Core Email Service Implementation

4.  **Create Email Service Module:**
    *   [ ] Create a new file: `src/services/email.service.ts`.
    *   [ ] Implement the basic service structure to initialize Resend and provide a `sendEmail` function:
        ```typescript
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
        ```
5.  **Create Email Templates Directory:**
    *   [ ] Create a new directory: `src/emails/`. This will hold your React Email template components.

## Phase 3: Transactional Email Implementation

6.  **Order Confirmation Email:**
    *   [ ] Create template file: `src/emails/OrderConfirmationEmail.tsx`.
    *   [ ] Design the template using React Email components (`@react-email/components`) to display order details (order ID, items, total, shipping address, etc.). Accept order data as props.
    *   [ ] Integrate into `OrderController`/`OrderService`:
        *   Locate the function handling successful order creation (likely in `src/controllers/order.controller.ts` or its service).
        *   Import `sendEmail` from `src/services/email.service.ts` and `OrderConfirmationEmail` from `src/emails/OrderConfirmationEmail.tsx`.
        *   After successfully saving the order, asynchronously call `sendEmail` within a try/catch block:
            ```typescript
            try {
              await sendEmail({
                to: customerEmail, // Get customer email
                subject: `Your Order Confirmation #${order.id}`,
                react: <OrderConfirmationEmail order={orderData} />
              });
            } catch (emailError) {
              console.error(`Failed to send order confirmation for order ${order.id}:`, emailError);
              // Log the error, but don't fail the main order process
            }
            ```
7.  **Password Reset Email:**
    *   [ ] Create template file: `src/emails/PasswordResetEmail.tsx`.
    *   [ ] Design the template with a message and a button/link containing the password reset token/URL. Accept user name and reset URL as props.
    *   [ ] Integrate into `AuthController`/`AuthService`:
        *   Locate the function handling password reset requests.
        *   Generate the reset token/URL.
        *   Import `sendEmail` and `PasswordResetEmail`.
        *   Call `sendEmail` with the user's email, subject, and the `<PasswordResetEmail name={userName} resetUrl={resetUrl} />` component. Handle potential errors.

## Phase 4: Marketing Email Implementation (Basic)

8.  **Newsletter Template:**
    *   [ ] Create template file: `src/emails/NewsletterEmail.tsx`.
    *   [ ] Design a generic newsletter template using React Email components. Accept content (subject, body, maybe images) as props.
9.  **Admin Sending Endpoint (Example):**
    *   [ ] Define a new route (e.g., `POST /admin/send-newsletter`) protected for Admin/Staff roles (using `authenticate` and `isStaffOrAdmin` middleware).
    *   [ ] Create a corresponding controller function in a relevant admin controller.
    *   [ ] The controller function should:
        *   Validate the incoming request body (subject, content).
        *   Fetch the list of subscribed users (requires a user schema field like `isSubscribedToNewsletter` or a separate subscription model).
        *   Loop through the subscribed users.
        *   For each user, call `sendEmail` with the `<NewsletterEmail ... />` component.
        *   Implement logic to handle potential errors for individual sends.
        *   Consider batching or delays if sending to many users to avoid hitting rate limits quickly. Return a summary response (e.g., number sent, number failed).

## Phase 5: Testing and Refinement

10. **Local Preview (Optional but Recommended):**
    *   [ ] Explore setting up the React Email development server (`email dev`) for easier template previewing during development. See [react.email](https://react.email/) documentation.
11. **End-to-End Testing:**
    *   [ ] Trigger all actions that should send emails (register - if verification email added, reset password, place order, use admin newsletter endpoint).
    *   [ ] Use test email addresses and check the Resend dashboard logs.
    *   [ ] Verify emails are received and render correctly in major email clients (Gmail web, Outlook web, Apple Mail are good starting points).
12. **Error Handling &amp; Logging:**
    *   [ ] Review error handling in `email.service.ts` and all calling locations. Ensure failures are logged appropriately (consider a structured logger) without breaking critical application flows.
13. **Unsubscribe Mechanism (Marketing):**
    *   [ ] Ensure any marketing/newsletter emails include a clear unsubscribe link.
    *   [ ] Implement an endpoint (e.g., `GET /unsubscribe?token=...`) that handles unsubscribe requests, validates the token, and updates the user's subscription status in the database.