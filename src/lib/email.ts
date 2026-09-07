import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || 'Bizzare Fragrances <onboarding@resend.dev>';
const SUPPORT_EMAIL = process.env.SUPPORT_FORWARD_EMAIL || 'concierge@bizzarefragrances.shop';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://bizzarefragrances.shop';

interface SendOtpOptions {
  email: string;
  name?: string;
  otp: string;
  resetUrl?: string;
}

interface SendConciergeInquiryOptions {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

interface OrderItemSummary {
  name: string;
  quantity: number;
  price: number | string;
}

interface SendOrderConfirmationOptions {
  email: string;
  name: string;
  orderId: string;
  totalAmount: number | string;
  items: OrderItemSummary[];
  shippingAddress: string;
}

/**
 * Send 6-digit OTP code & reset link for password reset
 */
export async function sendPasswordResetOtpEmail({
  email,
  name,
  otp,
  resetUrl,
}: SendOtpOptions): Promise<{ success: boolean; error?: string }> {
  const clientName = name ? name.split(' ')[0] : 'Valued Client';
  const directUrl = resetUrl || `${APP_URL}/login?action=reset&email=${encodeURIComponent(email)}&otp=${otp}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your Password - Bizzare Fragrances</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 0; color: #1E1611; }
    .container { max-width: 580px; margin: 40px auto; background-color: #FFFFFF; border: 1px solid #E6DFD5; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(30, 22, 17, 0.05); }
    .header { background-color: #1E1611; color: #FAF8F5; padding: 36px 30px; text-align: center; }
    .logo-subtitle { font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #C5A880; margin-bottom: 8px; font-weight: 600; }
    .logo-title { font-family: Georgia, serif; font-size: 26px; letter-spacing: 1px; margin: 0; font-weight: normal; color: #FAF8F5; }
    .content { padding: 40px 36px; line-height: 1.6; }
    .salutation { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #1E1611; }
    .otp-box { background-color: #F6F3EE; border: 1px dashed #C5A880; border-radius: 12px; padding: 24px; text-align: center; margin: 28px 0; }
    .otp-label { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #7A6658; font-weight: 600; margin-bottom: 8px; }
    .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1E1611; margin: 0; }
    .otp-expiry { font-size: 12px; color: #7A6658; margin-top: 8px; }
    .button-container { text-align: center; margin: 32px 0 16px; }
    .button { background-color: #1E1611; color: #FFFFFF !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; display: inline-block; }
    .footer { background-color: #FAF8F5; border-top: 1px solid #E6DFD5; padding: 24px 36px; font-size: 12px; color: #7A6658; text-align: center; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-subtitle">Maison de Haute Parfumerie</div>
      <h1 class="logo-title">BIZZARE FRAGRANCES</h1>
    </div>
    <div class="content">
      <div class="salutation">Dear ${clientName},</div>
      <p>We received a request to securely reset the password for your Bizzare Fragrances account.</p>
      <p>Please use the 6-digit verification code below to authorize the password update:</p>
      
      <div class="otp-box">
        <div class="otp-label">Your Security OTP</div>
        <div class="otp-code">${otp}</div>
        <div class="otp-expiry">Valid for 15 minutes • Do not share this code</div>
      </div>

      <div class="button-container">
        <a href="${directUrl}" class="button" target="_blank">Reset Password Directly</a>
      </div>

      <p style="font-size: 13px; color: #7A6658; margin-top: 24px;">
        If you did not initiate this request, you can safely disregard this email. Your account remains protected.
      </p>
    </div>
    <div class="footer">
      Bizzare Fragrances (by Bizzare)<br>
      Lagos, Nigeria • <a href="https://bizzarefragrances.shop" style="color: #1E1611; text-decoration: none;">bizzarefragrances.shop</a><br>
      Concierge Desk: <a href="mailto:concierge@bizzarefragrances.shop" style="color: #1E1611;">concierge@bizzarefragrances.shop</a>
    </div>
  </div>
</body>
</html>
`;

  if (!resend) {
    console.warn(`[Resend Not Configured] Password reset OTP for ${email}: ${otp}`);
    return { success: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: email,
      subject: `${otp} is your Bizzare Fragrances verification code`,
      html,
    });

    if (error) {
      console.error(`[Resend Error sending OTP to ${email}]:`, error);
      // In development / testing, log OTP to console so testing is never blocked
      console.warn(`[OTP Code for ${email}]: ${otp} (Direct reset URL: ${directUrl})`);
      return { success: false, error: error.message };
    }

    console.log(`[Resend OTP Sent] Message ID: ${data?.id} to ${email}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown email sending error';
    console.error(`[Resend Exception sending OTP to ${email}]:`, err);
    console.warn(`[OTP Code for ${email}]: ${otp}`);
    return { success: false, error: message };
  }
}

/**
 * Forward inquiry from /customer-service to the official concierge email
 */
export async function sendConciergeInquiryEmail({
  name,
  email,
  phone,
  subject,
  message,
}: SendConciergeInquiryOptions): Promise<{ success: boolean; error?: string }> {
  const inquirySubject = subject || 'Bespoke Concierge & Fragrance Inquiry';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Client Inquiry - Bizzare Fragrances Concierge</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAF8F5; margin: 0; padding: 0; color: #1E1611; }
    .container { max-width: 600px; margin: 30px auto; background-color: #FFFFFF; border: 1px solid #E6DFD5; border-radius: 12px; overflow: hidden; }
    .header { background-color: #1E1611; color: #FAF8F5; padding: 24px; text-align: left; }
    .title { font-family: Georgia, serif; font-size: 20px; margin: 0; color: #FAF8F5; }
    .badge { display: inline-block; background: #C5A880; color: #1E1611; font-size: 10px; font-weight: bold; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; margin-bottom: 8px; }
    .content { padding: 30px; }
    .field { margin-bottom: 16px; }
    .field-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #7A6658; font-weight: bold; }
    .field-value { font-size: 15px; color: #1E1611; margin-top: 4px; }
    .message-box { background-color: #F6F3EE; border-left: 3px solid #1E1611; padding: 16px; border-radius: 4px; margin-top: 12px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; }
    .footer { background-color: #FAF8F5; border-top: 1px solid #E6DFD5; padding: 16px 30px; font-size: 12px; color: #7A6658; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Concierge Desk Inquiry</div>
      <h1 class="title">Bizzare Fragrances Client Message</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="field-label">Client Name</div>
        <div class="field-value"><strong>${name}</strong></div>
      </div>
      <div class="field">
        <div class="field-label">Email Address</div>
        <div class="field-value"><a href="mailto:${email}" style="color: #1E1611;">${email}</a></div>
      </div>
      ${
        phone
          ? `
      <div class="field">
        <div class="field-label">Phone Number</div>
        <div class="field-value">${phone}</div>
      </div>`
          : ''
      }
      <div class="field">
        <div class="field-label">Inquiry Topic</div>
        <div class="field-value">${inquirySubject}</div>
      </div>
      <div class="field">
        <div class="field-label">Client Message</div>
        <div class="message-box">${message}</div>
      </div>
    </div>
    <div class="footer">
      Sent from <a href="https://bizzarefragrances.shop/customer-service" style="color: #1E1611;">bizzarefragrances.shop/customer-service</a>
    </div>
  </div>
</body>
</html>
`;

  if (!resend) {
    console.warn(`[Resend Not Configured] Concierge Inquiry from ${name} (${email}): ${message}`);
    return { success: true };
  }

  try {
    const { error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: SUPPORT_EMAIL,
      replyTo: email,
      subject: `[Concierge Inquiry] ${inquirySubject} - from ${name}`,
      html,
    });

    if (error) {
      console.error('[Resend Error sending Concierge inquiry]:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown email sending error';
    console.error('[Resend Exception sending Concierge inquiry]:', err);
    return { success: false, error: message };
  }
}

/**
 * Send branded luxury receipt and order confirmation
 */
export async function sendOrderConfirmationEmail({
  email,
  name,
  orderId,
  totalAmount,
  items,
  shippingAddress,
}: SendOrderConfirmationOptions): Promise<{ success: boolean; error?: string }> {
  const formattedTotal =
    typeof totalAmount === 'number'
      ? `₦${totalAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
      : `₦${totalAmount}`;

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #E6DFD5; font-size: 14px; color: #1E1611;">
        <strong>${item.name}</strong> × ${item.quantity}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #E6DFD5; text-align: right; font-family: monospace; font-size: 14px; font-weight: 600; color: #1E1611;">
        ₦${typeof item.price === 'number' ? item.price.toLocaleString('en-NG') : item.price}
      </td>
    </tr>
  `
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Confirmation - Bizzare Fragrances</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF8F5; margin: 0; padding: 0; color: #1E1611; }
    .container { max-width: 580px; margin: 40px auto; background-color: #FFFFFF; border: 1px solid #E6DFD5; border-radius: 16px; overflow: hidden; }
    .header { background-color: #1E1611; color: #FAF8F5; padding: 36px 30px; text-align: center; }
    .logo-subtitle { font-size: 11px; text-transform: uppercase; letter-spacing: 3px; color: #C5A880; margin-bottom: 8px; font-weight: 600; }
    .logo-title { font-family: Georgia, serif; font-size: 26px; letter-spacing: 1px; margin: 0; font-weight: normal; color: #FAF8F5; }
    .content { padding: 36px; }
    .badge { display: inline-block; background-color: #EBF7EE; color: #1D6F3B; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 6px; }
    .order-info { margin-top: 16px; font-size: 14px; color: #7A6658; }
    .items-table { width: 100%; border-collapse: collapse; margin: 24px 0; }
    .total-row { padding: 16px 0; font-size: 16px; font-weight: bold; color: #1E1611; border-top: 2px solid #1E1611; }
    .address-box { background-color: #F6F3EE; border-radius: 8px; padding: 16px; font-size: 13px; line-height: 1.5; color: #1E1611; margin-top: 20px; }
    .button-container { text-align: center; margin: 32px 0 16px; }
    .button { background-color: #1E1611; color: #FFFFFF !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; display: inline-block; }
    .footer { background-color: #FAF8F5; border-top: 1px solid #E6DFD5; padding: 24px 36px; font-size: 12px; color: #7A6658; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-subtitle">Maison de Haute Parfumerie</div>
      <h1 class="logo-title">BIZZARE FRAGRANCES</h1>
    </div>
    <div class="content">
      <div class="badge">Payment Confirmed</div>
      <h2 style="font-family: Georgia, serif; font-size: 22px; margin: 12px 0 4px; color: #1E1611;">Thank you for your acquisition, ${name}.</h2>
      <div class="order-info">Order Reference: <strong>#${orderId}</strong></div>

      <table class="items-table">
        ${itemsHtml}
        <tr>
          <td class="total-row">Total Paid</td>
          <td class="total-row" style="text-align: right; font-family: monospace;">${formattedTotal}</td>
        </tr>
      </table>

      <div class="address-box">
        <strong style="text-transform: uppercase; font-size: 11px; letter-spacing: 1px; color: #7A6658; display: block; margin-bottom: 4px;">Delivery Destination</strong>
        ${shippingAddress}
      </div>

      <div class="button-container">
        <a href="${APP_URL}/shop" class="button" target="_blank">View Your Orders</a>
      </div>
    </div>
    <div class="footer">
      Bizzare Fragrances (by Bizzare)<br>
      <a href="https://bizzarefragrances.shop" style="color: #1E1611; text-decoration: none;">bizzarefragrances.shop</a> • Concierge: <a href="mailto:concierge@bizzarefragrances.shop" style="color: #1E1611;">concierge@bizzarefragrances.shop</a>
    </div>
  </div>
</body>
</html>
`;

  if (!resend) {
    console.warn(`[Resend Not Configured] Order Confirmation for Order #${orderId} to ${email}`);
    return { success: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: DEFAULT_FROM,
      to: email,
      subject: `Order #${orderId} Confirmed - Bizzare Fragrances`,
      html,
    });

    if (error) {
      console.error(`[Resend Error sending Order Confirmation #${orderId} to ${email}]:`, error);
      return { success: false, error: error.message };
    }

    console.log(`[Resend Order Confirmation Sent] Message ID: ${data?.id} for Order #${orderId} to ${email}`);
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown email sending error';
    console.error(`[Resend Exception sending Order Confirmation #${orderId} to ${email}]:`, err);
    return { success: false, error: message };
  }
}
