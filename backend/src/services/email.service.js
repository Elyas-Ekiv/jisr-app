const { Resend } = require('resend');
const config = require('../config/env');

const resend = new Resend(config.resendApiKey);

const FROM = `${config.resendFromName} <${config.resendFromEmail}>`;

// ─── Shared layout ────────────────────────────────────────────────────────────

function layout(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Jisr</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f7fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f7fb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">جسر · Jisr</h1>
              <p style="margin:6px 0 0;color:#bfdbfe;font-size:13px;">AAC Communication Platform</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
                You are receiving this email because you have an account with Jisr.<br/>
                &copy; ${new Date().getFullYear()} Jisr. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function infoBox(label, value) {
  return `<tr>
    <td style="padding:8px 0;color:#64748b;font-size:14px;border-bottom:1px solid #f1f5f9;">${label}</td>
    <td style="padding:8px 0;color:#1e293b;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid #f1f5f9;">${value}</td>
  </tr>`;
}

function ctaButton(text, href, color = '#2563eb') {
  return `<table cellpadding="0" cellspacing="0" border="0" style="margin:28px auto 0;">
    <tr>
      <td style="background:${color};border-radius:8px;padding:14px 32px;text-align:center;">
        <a href="${href}" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">${text}</a>
      </td>
    </tr>
  </table>`;
}

// ─── Templates ────────────────────────────────────────────────────────────────

function paymentSuccessHtml({ name, planName, amount, orderReference, date }) {
  const body = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:#dcfce7;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:32px;">✅</div>
    </div>
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;font-weight:700;text-align:center;">Payment Successful!</h2>
    <p style="margin:0 0 28px;color:#64748b;font-size:15px;text-align:center;">
      Thank you, <strong>${name}</strong>. Your subscription is now active.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoBox('Plan', planName)}
          ${infoBox('Amount Paid', `${amount} OMR`)}
          ${infoBox('Order Reference', `<code style="font-family:monospace;font-size:12px;">${orderReference}</code>`)}
          ${infoBox('Date', date)}
        </table>
      </td></tr>
    </table>
    <p style="margin:0;color:#64748b;font-size:14px;text-align:center;">
      Your child can now access all premium features on the Jisr platform.
    </p>
    ${ctaButton('Go to Dashboard', `${config.frontendUrl}/dashboard`)}
  `;
  return layout(body);
}

function refundConfirmationHtml({ name, planName, amount, orderReference, refundId, date }) {
  const body = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:#fef3c7;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:32px;">💰</div>
    </div>
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;font-weight:700;text-align:center;">Refund Processed</h2>
    <p style="margin:0 0 28px;color:#64748b;font-size:15px;text-align:center;">
      Hi <strong>${name}</strong>, your refund has been initiated and will appear in your account within 5–7 business days.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoBox('Plan', planName)}
          ${infoBox('Refund Amount', `${amount} OMR`)}
          ${infoBox('Order Reference', `<code style="font-family:monospace;font-size:12px;">${orderReference}</code>`)}
          ${infoBox('Refund ID', `<code style="font-family:monospace;font-size:12px;">${refundId}</code>`)}
          ${infoBox('Date', date)}
        </table>
      </td></tr>
    </table>
    <p style="margin:0;color:#64748b;font-size:14px;text-align:center;">
      If you have any questions, please contact our support team.
    </p>
    ${ctaButton('Contact Support', `${config.frontendUrl}/support-tickets`, '#64748b')}
  `;
  return layout(body);
}

function reminderTwoDaysHtml({ name, planName, amount, dueDate, paymentUrl }) {
  const body = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:#dbeafe;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:32px;">🔔</div>
    </div>
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;font-weight:700;text-align:center;">Payment Due in 2 Days</h2>
    <p style="margin:0 0 28px;color:#64748b;font-size:15px;text-align:center;">
      Hi <strong>${name}</strong>, this is a friendly reminder that your payment is due soon.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0;border-radius:8px;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoBox('Plan', planName)}
          ${infoBox('Amount Due', `${amount} OMR`)}
          ${infoBox('Due Date', dueDate)}
        </table>
      </td></tr>
    </table>
    <p style="margin:0;color:#64748b;font-size:14px;text-align:center;">
      Complete your payment before the due date to keep your subscription active.
    </p>
    ${ctaButton('Pay Now', paymentUrl)}
  `;
  return layout(body);
}

function reminderOneDayHtml({ name, planName, amount, dueDate, paymentUrl }) {
  const body = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:#fef9c3;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:32px;">⚠️</div>
    </div>
    <h2 style="margin:0 0 8px;color:#1e293b;font-size:22px;font-weight:700;text-align:center;">Payment Due Tomorrow</h2>
    <p style="margin:0 0 28px;color:#64748b;font-size:15px;text-align:center;">
      Hi <strong>${name}</strong>, your payment is due <strong>tomorrow</strong>. Don't let your subscription lapse!
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #fde68a;border-radius:8px;background:#fffbeb;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoBox('Plan', planName)}
          ${infoBox('Amount Due', `${amount} OMR`)}
          ${infoBox('Due Date', dueDate)}
        </table>
      </td></tr>
    </table>
    <p style="margin:0;color:#64748b;font-size:14px;text-align:center;">
      Act now to avoid any disruption to your child's communication experience.
    </p>
    ${ctaButton('Pay Now', paymentUrl, '#d97706')}
  `;
  return layout(body);
}

function reminderOverdueHtml({ name, planName, amount, dueDate, paymentUrl }) {
  const body = `
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:#fee2e2;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:32px;">❌</div>
    </div>
    <h2 style="margin:0 0 8px;color:#991b1b;font-size:22px;font-weight:700;text-align:center;">Payment Overdue</h2>
    <p style="margin:0 0 28px;color:#64748b;font-size:15px;text-align:center;">
      Hi <strong>${name}</strong>, your payment was due on <strong>${dueDate}</strong> and your subscription has now expired.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #fca5a5;border-radius:8px;background:#fff5f5;margin-bottom:24px;">
      <tr><td style="padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoBox('Plan', planName)}
          ${infoBox('Outstanding Amount', `${amount} OMR`)}
          ${infoBox('Was Due', dueDate)}
        </table>
      </td></tr>
    </table>
    <p style="margin:0;color:#64748b;font-size:14px;text-align:center;">
      Please complete your payment to restore access to Jisr's premium features.
    </p>
    ${ctaButton('Reactivate Now', paymentUrl, '#dc2626')}
  `;
  return layout(body);
}

// ─── Send helpers ─────────────────────────────────────────────────────────────

async function sendEmail({ to, subject, html }) {
  if (!config.resendApiKey || config.resendApiKey === 're_your_api_key_here') {
    console.warn(`[Email] RESEND_API_KEY not configured. Skipping email to ${to}: "${subject}"`);
    return { success: false, reason: 'resend_not_configured' };
  }

  try {
    const { data, error } = await resend.emails.send({ from: FROM, to: [to], subject, html });
    if (error) {
      console.error(`[Email] Resend error for ${to}:`, error);
      return { success: false, error };
    }
    console.log(`[Email] Sent "${subject}" to ${to} (id: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error(`[Email] Unexpected error for ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

function fmtDate(date) {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function fmtAmount(amount) {
  return Number(amount).toFixed(3);
}

// ─── Public API ───────────────────────────────────────────────────────────────

async function sendPaymentSuccess({ email, name, planName, amount, orderReference }) {
  return sendEmail({
    to: email,
    subject: '✅ Payment Confirmed – Your Jisr Subscription is Active',
    html: paymentSuccessHtml({
      name,
      planName,
      amount: fmtAmount(amount),
      orderReference,
      date: fmtDate(new Date()),
    }),
  });
}

async function sendRefundConfirmation({ email, name, planName, amount, orderReference, refundId }) {
  return sendEmail({
    to: email,
    subject: '💰 Refund Processed – Jisr',
    html: refundConfirmationHtml({
      name,
      planName,
      amount: fmtAmount(amount),
      orderReference,
      refundId,
      date: fmtDate(new Date()),
    }),
  });
}

async function sendReminderTwoDays({ email, name, planName, amount, dueDate, orderId }) {
  return sendEmail({
    to: email,
    subject: '🔔 Payment Reminder – Due in 2 Days',
    html: reminderTwoDaysHtml({
      name,
      planName,
      amount: fmtAmount(amount),
      dueDate: fmtDate(dueDate),
      paymentUrl: `${config.frontendUrl}/payment?order=${orderId}`,
    }),
  });
}

async function sendReminderOneDay({ email, name, planName, amount, dueDate, orderId }) {
  return sendEmail({
    to: email,
    subject: '⚠️ Payment Reminder – Due Tomorrow',
    html: reminderOneDayHtml({
      name,
      planName,
      amount: fmtAmount(amount),
      dueDate: fmtDate(dueDate),
      paymentUrl: `${config.frontendUrl}/payment?order=${orderId}`,
    }),
  });
}

async function sendReminderOverdue({ email, name, planName, amount, dueDate, orderId }) {
  return sendEmail({
    to: email,
    subject: '❌ Payment Overdue – Action Required',
    html: reminderOverdueHtml({
      name,
      planName,
      amount: fmtAmount(amount),
      dueDate: fmtDate(dueDate),
      paymentUrl: `${config.frontendUrl}/payment?order=${orderId}`,
    }),
  });
}

module.exports = {
  sendPaymentSuccess,
  sendRefundConfirmation,
  sendReminderTwoDays,
  sendReminderOneDay,
  sendReminderOverdue,
};
