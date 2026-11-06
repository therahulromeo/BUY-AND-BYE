import nodemailer from 'nodemailer';

let transporter = null;

export function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
  const rawPass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || '').trim();
  const pass = rawPass.replace(/\s+/g, '');

  if (user && pass) {
    if (host.includes('gmail') || user.endsWith('@gmail.com')) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
    } else {
      transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }
  }

  return transporter;
}

/**
 * Send Customer OTP Verification Email
 * @param {string} toEmail 
 * @param {string} otp 
 */
export async function sendOtpEmail(toEmail, otp) {
  const mailer = getTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || '"BUY & BYE" <noreply@buyandbye.com>',
    to: toEmail,
    subject: `${otp} is your BUY & BYE Verification Code`,
    text: `Your BUY & BYE verification code is: ${otp}. It will expire in 10 minutes. Do not share this code with anyone.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #0056D2; font-size: 24px; font-weight: 900; margin: 0; letter-spacing: 1px;">
            BUY <span style="color: #FFC800;">&</span> BYE
          </h1>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px;">Premium Men's Clothing</p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0 0 12px 0; font-size: 14px; color: #334155; font-weight: 600;">Your One-Time Password (OTP)</p>
          <div style="font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #0056D2; font-family: monospace; padding: 10px 0;">
            ${otp}
          </div>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">Valid for the next 10 minutes</p>
        </div>

        <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0 0 16px 0;">
          Use this code to verify your email address and securely log in to your <strong>BUY &amp; BYE</strong> account.
        </p>

        <p style="color: #94a3b8; font-size: 12px; line-height: 1.4; margin: 0; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          If you didn't request this verification code, please ignore this email. Never share your OTP with anyone.
        </p>
      </div>
    `,
  };

  if (mailer) {
    try {
      const info = await mailer.sendMail(mailOptions);
      console.log(`[EmailService] Customer OTP email sent to ${toEmail}: ${info.messageId}`);
      return { sent: true, provider: 'smtp', messageId: info.messageId };
    } catch (err) {
      console.warn(`[EmailService] Failed sending customer OTP email to ${toEmail}:`, err.message);
    }
  }

  // Fallback: log to console
  console.log(`=======================================================`);
  console.log(`[EmailService / DEV MODE] 📧 Customer OTP for ${toEmail}: ${otp}`);
  console.log(`=======================================================`);
  return { sent: true, provider: 'dev-console', otp };
}

/**
 * Send Administrator Portal Access OTP Email
 * @param {string} toEmail 
 * @param {string} otp 
 * @param {string} adminName
 */
export async function sendAdminOtpEmail(toEmail, otp, adminName = 'Administrator') {
  const mailer = getTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || '"BuyAndBye Security" <security@buyandbye.com>',
    to: toEmail,
    subject: `[BuyAndBye Admin] Security Verification Code: ${otp}`,
    text: `Hello ${adminName},\n\nYour BuyAndBye Admin Portal login verification code is: ${otp}.\n\nThis security code expires in 10 minutes.\nIf you did not request this code, contact your system supervisor immediately.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 28px; border: 1.5px solid #0f172a; border-radius: 14px; background-color: #ffffff;">
        <div style="background-color: #0f172a; padding: 18px 24px; border-radius: 10px; text-align: center; margin-bottom: 24px;">
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; margin: 0; letter-spacing: 0.5px;">
            Buy<span style="color: #3b82f6;">And</span>Bye Admin Portal
          </h2>
          <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Security &amp; 2-Factor Authentication</p>
        </div>

        <p style="color: #1e293b; font-size: 15px; margin: 0 0 16px 0; font-weight: 600;">
          Hello ${adminName},
        </p>

        <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">
          A login attempt to the BuyAndBye Administrator Control Center was initiated for your administrator account (<code>${toEmail}</code>). Please use the security verification code below to authenticate:
        </p>

        <div style="background-color: #f1f5f9; border: 2px dashed #3b82f6; border-radius: 10px; padding: 22px; text-align: center; margin-bottom: 24px;">
          <div style="font-size: 12px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 8px;">
            Administrator One-Time Code
          </div>
          <div style="font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #1e3a8a; font-family: monospace;">
            ${otp}
          </div>
          <p style="margin: 8px 0 0 0; font-size: 12px; color: #ef4444; font-weight: 600;">
            ⏱ Valid for 10 minutes only
          </p>
        </div>

        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 12.5px; color: #991b1b; line-height: 1.45;">
            <strong>Important Security Notice:</strong> Never share this verification code with anyone. BuyAndBye staff will never ask for your code. If you did not initiate this login, change your credentials immediately.
          </p>
        </div>

        <p style="color: #94a3b8; font-size: 12px; margin: 0; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          BuyAndBye E-Commerce Operations &bull; Automated Security Alert
        </p>
      </div>
    `,
  };

  if (mailer) {
    try {
      const info = await mailer.sendMail(mailOptions);
      console.log(`[EmailService] Admin OTP email sent to ${toEmail}: ${info.messageId}`);
      return { sent: true, provider: 'smtp', messageId: info.messageId };
    } catch (err) {
      console.warn(`[EmailService] Failed sending Admin OTP to ${toEmail}:`, err.message);
    }
  }

  // Fallback: log to console
  console.log(`=======================================================`);
  console.log(`[EmailService / ADMIN DEV MODE] 🛡️ Admin OTP for ${toEmail}: ${otp}`);
  console.log(`=======================================================`);
  return { sent: true, provider: 'dev-console', otp };
}

/**
 * Send Customer Order Status Update Email (Triggered from buyandbye-admin)
 * @param {string} toEmail 
 * @param {object} order 
 * @param {string} newStatus 
 */
export async function sendOrderStatusEmail(toEmail, order, newStatus) {
  const mailer = getTransporter();

  const statusColorMap = {
    Processing: '#2563EB',
    Shipped: '#D97706',
    Delivered: '#059669',
    Cancelled: '#DC2626',
    Pending: '#64748B',
  };

  const statusBadgeColor = statusColorMap[newStatus] || '#2563EB';
  const customerName = order.customer?.name || 'Customer';
  const orderId = order.order_id || `#${order._id || 'N/A'}`;
  const totalFormatted = `₹${Math.round(order.total_amount || 0).toLocaleString('en-IN')}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"BUY & BYE Orders" <orders@buyandbye.com>',
    to: toEmail,
    subject: `Order Update: ${orderId} is now ${newStatus.toUpperCase()}`,
    text: `Hello ${customerName},\n\nYour BUY & BYE order ${orderId} has been updated to: ${newStatus}.\n\nTotal: ${totalFormatted}\nTracking: ${order.tracking_number || 'Available soon'}\n\nThank you for shopping with BUY & BYE!`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1.5px solid #f1f5f9;">
          <h1 style="color: #0056D2; font-size: 26px; font-weight: 900; margin: 0; letter-spacing: 1px;">
            BUY <span style="color: #FFC800;">&</span> BYE
          </h1>
          <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 0.5px;">Order Fulfillment Notification</p>
        </div>

        <p style="color: #1e293b; font-size: 16px; margin: 0 0 8px 0; font-weight: 700;">
          Hello ${customerName},
        </p>

        <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">
          Great news! The administrator team at <strong>BUY &amp; BYE</strong> has updated the fulfillment status of your order:
        </p>

        <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap;">
            <span style="font-size: 13px; color: #64748b; font-weight: 600;">Order ID:</span>
            <span style="font-size: 15px; font-weight: 800; color: #0f172a; font-family: monospace;">${orderId}</span>
          </div>

          <div style="margin-bottom: 16px; text-align: center; padding: 14px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
            <span style="font-size: 12px; color: #64748b; display: block; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Current Status</span>
            <span style="display: inline-block; background-color: ${statusBadgeColor}; color: #ffffff; font-weight: 800; font-size: 16px; padding: 6px 18px; border-radius: 20px; letter-spacing: 0.5px;">
              ${newStatus.toUpperCase()}
            </span>
          </div>

          ${
            order.tracking_number
              ? `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px;">
              <span style="color: #64748b; font-weight: 600;">Airway Bill / Tracking:</span>
              <span style="font-weight: 800; color: #2563eb; font-family: monospace;">${order.tracking_number}</span>
            </div>
            `
              : ''
          }

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; padding-top: 8px; border-top: 1px dashed #cbd5e1;">
            <span style="color: #64748b; font-weight: 600;">Order Total:</span>
            <span style="font-weight: 800; color: #059669; font-size: 15px;">${totalFormatted}</span>
          </div>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0 0 20px 0;">
          You can track this package anytime by entering the <strong>BUY &amp; BYE</strong> customer storefront and clicking <strong>Order History</strong> in the navigation bar.
        </p>

        <div style="text-align: center; border-top: 1.5px solid #f1f5f9; padding-top: 16px;">
          <p style="margin: 0; color: #94a3b8; font-size: 12px;">
            Thank you for shopping with BUY &amp; BYE Mens Clothing &bull; Support: support@buyandbye.com
          </p>
        </div>
      </div>
    `,
  };

  if (mailer) {
    try {
      const info = await mailer.sendMail(mailOptions);
      console.log(`[EmailService] Order status email (${newStatus}) sent to ${toEmail}: ${info.messageId}`);
      return { sent: true, provider: 'smtp', messageId: info.messageId };
    } catch (err) {
      console.warn(`[EmailService] Failed sending order status email to ${toEmail}:`, err.message);
    }
  }

  // Fallback: log to console
  console.log(`=======================================================`);
  console.log(`[EmailService / DEV MODE] 📦 Order Update Email for ${toEmail}`);
  console.log(`Order: ${orderId} | Status: ${newStatus} | Total: ${totalFormatted}`);
  console.log(`=======================================================`);
  return { sent: true, provider: 'dev-console', orderId, status: newStatus };
}

/**
 * Send Direct Custom Email from Admin Portal
 * @param {string} toEmail 
 * @param {string} subject 
 * @param {string} message 
 */
export async function sendAdminCustomEmail(toEmail, subject, message) {
  const mailer = getTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || '"BuyAndBye Administrator" <admin@buyandbye.com>',
    to: toEmail,
    subject: subject || 'Notice from BuyAndBye Administrator',
    text: message,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #0056D2; margin: 0 0 16px 0;">BUY &amp; BYE</h2>
        <div style="font-size: 14px; color: #334155; line-height: 1.6; white-space: pre-line;">
          ${message}
        </div>
      </div>
    `,
  };

  if (mailer) {
    try {
      const info = await mailer.sendMail(mailOptions);
      return { sent: true, provider: 'smtp', messageId: info.messageId };
    } catch (err) {
      console.warn(`[EmailService] Failed sending custom admin email to ${toEmail}:`, err.message);
    }
  }

  console.log(`=======================================================`);
  console.log(`[EmailService / DEV MODE] ✉️ Custom Admin Email for ${toEmail}: ${subject}`);
  console.log(`Message: ${message}`);
  console.log(`=======================================================`);
  return { sent: true, provider: 'dev-console', toEmail, subject };
}
