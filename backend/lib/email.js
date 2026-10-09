require("dotenv").config();
const { Resend } = require("resend");

let resendClient = null;

/**
 * Returns a singleton instance of Resend client.
 */
function getResendClient() {
  if (resendClient) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      "[EMAIL] RESEND_API_KEY is not defined in environment variables.",
    );
    return null;
  }
  resendClient = new Resend(apiKey);
  return resendClient;
}

/**
 * Normalizes sender address from environment or fallback.
 */
function getFromEmail() {
  return (
    process.env.DEFAULT_FROM_EMAIL || "IGTF <no-reply@indoglobaltradefair.com>"
  );
}

/**
 * Renders individual digit boxes:
 * [ 6 ] [ 1 ] [ 6 ] [ 3 ]
 * All boxes share identical clean styling.
 */
function renderDigitBoxes(otpCode) {
  const cleanCode = String(otpCode || "1234")
    .trim()
    .slice(0, 6);
  const digits = cleanCode.split("");

  return digits
    .map((digit) => {
      return `
        <td style="padding: 0 5px;" align="center" valign="middle">
          <div style="width: 54px; height: 60px; line-height: 60px; background-color: #F3F4F6; border: 1.5px solid #E5E7EB; border-radius: 12px; font-size: 26px; font-weight: 800; color: #1E2024; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; display: inline-block;">
            ${digit}
          </div>
        </td>
      `;
    })
    .join("");
}

/**
 * Builds the HTML email matching user specifications:
 * - NO cross sign (✕)
 * - NO image field or broken image placeholders
 * - NO verify or resend code buttons
 * - All digit boxes uniform in color
 * - Short, clean order details summary
 * - Important notice strip
 */
function buildOtpEmailHtml({
  greeting = "",
  title = "Here is your Order Confirmation PIN",
  subtitle = "Your garment alteration request has been scheduled. Please share the PIN below with your tailor to authenticate and confirm your order drop-off.",
  otp = "1234",
  details = [],
  importantNote = "Give this PIN to the tailor for confirming the order upon drop-off, or when collecting your finished bespoke alteration.",
}) {
  const digitBoxes = renderDigitBoxes(otp);

  const detailsRows = details
    .filter((d) => d && d.label && d.value)
    .map((d) => {
      return `
        <tr>
          <td style="padding: 5px 0; font-size: 12.5px; color: #6B7280; font-weight: 600;">${d.label}:</td>
          <td align="right" style="padding: 5px 0; font-size: 12.5px; color: #111827; font-weight: 700;">${d.value}</td>
        </tr>
      `;
    })
    .join("");

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5EFE6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E2024; -webkit-font-smoothing: antialiased;">
  <!-- Canvas Backdrop -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F5EFE6; padding: 40px 16px;">
    <tr>
      <td align="center" valign="middle">
        
        <!-- White Rounded Card -->
        <table role="presentation" width="100%" style="max-width: 480px; background-color: #FFFFFF; border-radius: 24px; box-shadow: 0 12px 36px rgba(0, 0, 0, 0.07); border: 1px solid #ECE5D8; padding: 32px 28px;">
          
          <!-- Greeting Header -->
          ${
            greeting
              ? `
          <tr>
            <td style="padding-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 800; color: #8C9099; text-transform: uppercase; letter-spacing: 1px; display: block;">
                ${greeting}
              </span>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Title -->
          <tr>
            <td style="padding-bottom: 10px;">
              <h1 style="margin: 0; font-size: 21px; font-weight: 800; color: #1E2024; letter-spacing: -0.3px; line-height: 1.3;">
                ${title}
              </h1>
            </td>
          </tr>

          <!-- Subtitle / Explanation -->
          <tr>
            <td style="padding-bottom: 22px;">
              <p style="margin: 0; font-size: 13px; line-height: 1.55; color: #6B7280;">
                ${subtitle}
              </p>
            </td>
          </tr>

          <!-- Uniform Digit Boxes -->
          <tr>
            <td align="center" style="padding-bottom: 22px;">
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  ${digitBoxes}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Short Details Card -->
          ${
            detailsRows
              ? `
          <tr>
            <td style="padding-bottom: 18px;">
              <table role="presentation" width="100%" style="background-color: #F9FAFB; border-radius: 14px; border: 1px solid #E5E7EB; padding: 12px 16px;">
                ${detailsRows}
              </table>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Important Note Strip -->
          ${
            importantNote
              ? `
          <tr>
            <td style="padding-bottom: 14px;">
              <table role="presentation" width="100%" style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; border-radius: 6px; padding: 10px 14px;">
                <tr>
                  <td style="font-size: 11.5px; color: #92400E; line-height: 1.5;">
                    <strong style="color: #78350F;">Important:</strong> ${importantNote}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Discreet Footer -->
          <tr>
            <td align="center" style="padding-top: 4px;">
              <p style="margin: 0; font-size: 11px; color: #9CA3AF;">
                Darzi &bull; On-Demand Bespoke Alterations
              </p>
            </td>
          </tr>

        </table>
        <!-- End White Rounded Card -->

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Deduplication registry: tracks which stage emails have already been dispatched for each order
// Guarantees only 1 drop-off email and 1 pickup email per order in total.
const sentOrderEmailTracker = new Set();

/**
 * Sends an Order Confirmation PIN / OTP email to the customer with short order details.
 * Deduplicates automatically to ensure maximum 1 drop-off email and 1 pickup email per order.
 */
async function sendOrderOtpEmail({
  toEmail,
  otp,
  orderId,
  customerName = "Valued Customer",
  garmentName = "Garment Alteration",
  serviceName = "Standard Hemming",
  storeName = "Partner Atelier",
  storeAddress = "",
  storePhone = "",
  isPickup = false,
  force = false,
}) {
  if (!orderId) {
    return { success: false, reason: "Missing orderId" };
  }

  const emailStage = isPickup ? "pickup" : "dropoff";
  const dedupKey = `${orderId}:${emailStage}`;

  // Strict deduplication: Each order receives at most 1 drop-off email and 1 pickup email
  if (!force && sentOrderEmailTracker.has(dedupKey)) {
    console.log(
      `[EMAIL DEDUPLICATION] Skipped redundant ${emailStage} email for order #${orderId} (already delivered).`,
    );
    return {
      success: true,
      deduplicated: true,
      message: `Already delivered ${emailStage} email`,
    };
  }

  if (!toEmail || !toEmail.includes("@")) {
    console.warn(
      `[EMAIL] Skipped sending Order OTP: Invalid or missing email address (${toEmail})`,
    );
    return { success: false, reason: "Invalid email address" };
  }

  const client = getResendClient();
  if (!client) {
    console.warn(
      `[EMAIL] Resend client not configured. Order PIN for ${orderId}: ${otp}`,
    );
    return { success: false, reason: "RESEND_API_KEY missing" };
  }

  const subject = isPickup
    ? `Your Darzi Order #${orderId} is Ready for Pickup! PIN: ${otp}`
    : `Your Darzi Order #${orderId} Drop-Off PIN: ${otp}`;

  const title = isPickup
    ? "Your Garment is Ready for Pickup!"
    : "Here is your Order Drop-Off PIN";

  const subtitle = isPickup
    ? `Your bespoke alteration is complete and ready on the rack at ${storeName}. Please share the PIN below with your tailor to collect your garment.`
    : `Your garment alteration request has been scheduled with ${storeName}. Please share the PIN below with your tailor to authenticate and confirm your order drop-off.`;

  const importantNote = isPickup
    ? "Give this PIN to the tailor for collecting your completed garment."
    : "Give this PIN to the tailor for confirming your garment drop-off.";

  const details = [
    { label: "Order ID", value: `#${orderId}` },
    { label: "Garment Type", value: garmentName },
    { label: "Alteration Service", value: serviceName },
    { label: "Partner Studio", value: storeName },
    storeAddress ? { label: "Studio Address", value: storeAddress } : null,
    storePhone ? { label: "Studio Phone", value: storePhone } : null,
  ].filter(Boolean);

  const html = buildOtpEmailHtml({
    greeting:
      customerName && customerName !== "Valued Customer"
        ? `HELLO ${customerName.toUpperCase()},`
        : "HELLO,",
    title,
    subtitle,
    otp,
    details,
    importantNote,
  });

  const text = `
Darzi - On-Demand Alterations
${isPickup ? "YOUR ORDER IS READY FOR PICKUP!" : `ORDER #${orderId} CONFIRMATION PIN`}

Hello ${customerName},

${subtitle}

PIN: ${otp}

Order Details:
- Order ID: #${orderId}
- Garment Type: ${garmentName}
- Alteration Service: ${serviceName}
- Partner Studio: ${storeName}
${storeAddress ? `- Address: ${storeAddress}\n` : ""}${storePhone ? `- Phone: ${storePhone}\n` : ""}

${importantNote}
  `.trim();

  try {
    const fromAddress = getFromEmail();
    const result = await client.emails.send({
      from: fromAddress,
      to: toEmail,
      subject,
      html,
      text,
    });

    if (result.error) {
      console.error(
        `[EMAIL ERROR] Resend rejected order OTP email to ${toEmail}:`,
        result.error,
      );
      return { success: false, error: result.error };
    }

    sentOrderEmailTracker.add(dedupKey);
    console.log(
      `[EMAIL] Order OTP email sent successfully to ${toEmail} for #${orderId} (Resend ID: ${result.data?.id})`,
    );
    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error(
      `[EMAIL ERROR] Failed to send order OTP email to ${toEmail}:`,
      err.message || err,
    );
    return { success: false, error: err.message };
  }
}

/**
 * Sends an Authentication Verification Code OTP email.
 */
async function sendAuthOtpEmail({ toEmail, otp, customerName = "Darzi User" }) {
  if (!toEmail || !toEmail.includes("@")) {
    return { success: false, reason: "Invalid email address" };
  }

  const client = getResendClient();
  if (!client) {
    return { success: false, reason: "RESEND_API_KEY missing" };
  }

  const subject = `Your Darzi Verification Code: ${otp}`;

  const details = [
    { label: "Purpose", value: "Account Sign-In Verification" },
    { label: "Valid For", value: "10 Minutes" },
  ];

  const html = buildOtpEmailHtml({
    greeting: customerName ? `HELLO ${customerName.toUpperCase()},` : "HELLO,",
    title: "Verify Your Email Address",
    subtitle:
      "Please use the 4-digit verification code below to complete your sign-in to Darzi.",
    otp,
    details,
    importantNote:
      "This code is valid for 10 minutes. Do not share this code with anyone.",
  });

  const text = `Your Darzi verification code is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;

  try {
    const fromAddress = getFromEmail();
    const result = await client.emails.send({
      from: fromAddress,
      to: toEmail,
      subject,
      html,
      text,
    });

    if (result.error) {
      console.error(
        `[EMAIL ERROR] Resend rejected auth OTP email to ${toEmail}:`,
        result.error,
      );
      return { success: false, error: result.error };
    }

    console.log(
      `[EMAIL] Auth OTP email dispatched to ${toEmail} (Resend ID: ${result.data?.id})`,
    );
    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error(
      `[EMAIL ERROR] Failed to send auth OTP email to ${toEmail}:`,
      err.message || err,
    );
    return { success: false, error: err.message };
  }
}

/**
 * Builds the Welcome HTML email matching user specifications exactly:
 * - Outer neutral backdrop (#EFEFEF / #F0F0F0)
 * - Two-tone card:
 *   - Dark navy / slate top header (#373C52)
 *   - Coral / orange-red circular badge (#F05B48) with white handshake icon
 *   - Elegant cursive "Welcome!" script heading in white
 *   - Crisp white body with exact paragraph layout and line spacing
 *   - "By the way," note
 *   - Vibrant grass-green button (#76BC43) "Head to your Darzi" / "Head to your Darzi Studio"
 *   - "Team Darzi" sign-off
 * - Centered muted grey logo and copyright footer below card
 */
function buildWelcomeEmailHtml({
  name = "Valued Member",
  email = "member@darzi.com",
  role = "CUSTOMER", // 'CUSTOMER' | 'STUDIO'
  studioName = "",
  phone = "",
  portalUrl = "",
  loginUrl = "",
  handshakeImgSrc = process.env.WELCOME_GIF_URL ||
    "https://files.catbox.moe/soev3d.gif",
}) {
  const isStudio = role === "STUDIO" || role === "TEMP_STUDIO";
  const defaultCustomerUrl =
    process.env.CUSTOMER_SITE_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:3000";
  const defaultStudioUrl =
    process.env.STUDIO_SITE_URL ||
    process.env.STUDIO_URL ||
    "http://localhost:3001";

  const effectivePortalUrl =
    portalUrl || (isStudio ? defaultStudioUrl : defaultCustomerUrl);
  const effectiveLoginUrl = loginUrl || effectivePortalUrl;

  const contactUrl = `${effectivePortalUrl.replace(/\/$/, "")}/contact`;
  const buttonText = isStudio
    ? "Head to your Darzi Studio"
    : "Head to your Darzi";
  const teamText = isStudio ? "Team Darzi Studio" : "Team Darzi";

  const paragraph1 = isStudio
    ? "Woo! Your studio is active - your atelier is now onboarded with us and, we will be sending you bite-sized tips in your email over the coming weeks to help you grow your bespoke alteration business too."
    : "Woo! Your account is active - you have full access with us and, we will be sending you bite-sized tips in your email over the coming weeks to help you get the most out of your bespoke garment alterations too.";

  const paragraph2 = isStudio
    ? "Reach out at any time with questions! Right now, head into the workbench, set up your tailor machines and view your incoming orders. We will be happy to help with the rest."
    : "Reach out at any time with questions! Right now, head into the app, explore nearby partner studios and place your first alteration order. We will be happy to help with the rest.";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Darzi</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Dancing+Script:wght@700&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #EFEFEF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333333; -webkit-font-smoothing: antialiased;">
  <!-- Outer Canvas Table -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #EFEFEF; padding: 40px 16px;">
    <tr>
      <td align="center" valign="middle">

        <!-- Main Card Wrapper (max-width: 480px) -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; margin: 0 auto; background-color: #FFFFFF; border-radius: 4px; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);">
          
          <!-- Top Dark Navy/Slate Header Section (#373C52) -->
          <tr>
            <td align="center" style="background-color: #373C52; padding: 22px 20px; text-align: center;">
              
              <!-- "Welcome to Darzi" Title -->
              <h1 style="margin: 0; padding: 0; font-family: 'Dancing Script', 'Caveat', 'Brush Script MT', 'Snell Roundhand', 'Segoe Script', cursive; font-size: 34px; font-weight: 600; font-style: italic; color: #FFFFFF; letter-spacing: 0.5px; line-height: 1.2;">
                Welcome to Darzi
              </h1>

            </td>
          </tr>

          <!-- Lower White Card Body Section -->
          <tr>
            <td style="padding: 38px 40px 38px 40px; background-color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13.5px; line-height: 1.62; color: #333333;">
              
              <!-- Paragraph 1 -->
              <p style="margin: 0 0 20px 0; font-size: 13.5px; line-height: 1.62; color: #333333;">
                ${paragraph1}
              </p>

              <!-- Paragraph 2 -->
              <p style="margin: 0 0 20px 0; font-size: 13.5px; line-height: 1.62; color: #333333;">
                ${paragraph2}
              </p>

              <!-- Paragraph 3 -->
              <p style="margin: 0 0 18px 0; font-size: 13.5px; line-height: 1.62; color: #333333;">
                By the way,
              </p>

              <!-- Green Action Button (#76BC43) -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td>
                    <a href="${effectiveLoginUrl}" target="_blank" style="display: inline-block; background-color: #76BC43; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13.5px; font-weight: 700; text-decoration: none; padding: 11px 22px; border-radius: 3px; line-height: 1.2;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Team Sign-off -->
              <p style="margin: 0; font-size: 13.5px; font-weight: 700; color: #333333;">
                ${teamText}
              </p>

              <!-- Contact Page Link at the end of the card -->
              <div style="border-top: 1px solid #EBEBEB; padding-top: 18px; margin-top: 24px;">
                <p style="margin: 0; font-size: 12.5px; color: #555555; line-height: 1.55;">
                  Have questions or need assistance? Visit our <a href="${contactUrl}" target="_blank" style="color: #2563EB; font-weight: 600; text-decoration: underline;">Contact Page</a>.
                </p>
              </div>

            </td>
          </tr>

        </table>

        <!-- Outer Footer Section Below Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; margin: 24px auto 0 auto; text-align: center;">
          <tr>
            <td align="center">
              
              <!-- Contact Page Link in Footer -->
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #888888; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                Questions? Reach out via our <a href="${contactUrl}" target="_blank" style="color: #2563EB; text-decoration: underline; font-weight: 600;">Contact Page</a>
              </p>

              <!-- Muted Brand Logo -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto 6px auto;">
                <tr>
                  <td align="center" valign="middle">
                    <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 26px; font-weight: 800; color: #9E9E9E; letter-spacing: -0.5px; text-decoration: none;">
                      darzi
                    </span>
                    <span style="display: inline-block; margin-left: 4px; vertical-align: middle; background-color: #BDBDBD; color: #FFFFFF; font-size: 9px; font-weight: 800; padding: 2px 5px; border-radius: 3px; letter-spacing: 0.5px;">
                      APP
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Copyright -->
              <p style="margin: 0; font-size: 11px; color: #B0B0B0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                &copy; Copyright Darzi Technologies Ltd, 2026
              </p>

            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// In-memory cooldown store to prevent rapid duplicate sends during a single signup flow
// Cooldown duration: 2 minutes (120,000ms)
const WELCOME_EMAIL_COOLDOWN_MS = 2 * 60 * 1000;
const welcomeEmailCooldownMap = new Map();

/**
 * Sends a Welcome email to a newly onboarded user or partner studio.
 * Matches the reference card layout with brand-themed terracotta top strip.
 */
async function sendWelcomeEmail({
  toEmail,
  name,
  role = "CUSTOMER",
  studioName = "",
  phone = "",
  portalUrl = "",
  loginUrl = "",
  force = false,
}) {
  if (!toEmail || !toEmail.includes("@") || toEmail.includes("example.com")) {
    console.warn(
      `[WELCOME EMAIL] Skipped: Invalid or missing email address (${toEmail})`,
    );
    return { success: false, reason: "Invalid or missing email address" };
  }

  const cleanEmail = toEmail.trim().toLowerCase();
  const isStudio = role === "STUDIO" || role === "TEMP_STUDIO";
  const dedupKey = `welcome:${cleanEmail}:${isStudio ? "studio" : "customer"}`;

  const now = Date.now();
  const lastSentTime = welcomeEmailCooldownMap.get(dedupKey);

  // Debounce check: prevent duplicate dispatches within 2 minutes (e.g., rapid auth steps)
  if (
    !force &&
    lastSentTime &&
    now - lastSentTime < WELCOME_EMAIL_COOLDOWN_MS
  ) {
    const remainingSec = Math.ceil(
      (WELCOME_EMAIL_COOLDOWN_MS - (now - lastSentTime)) / 1000,
    );
    console.log(
      `[WELCOME EMAIL COOLDOWN] Welcome email recently dispatched to ${cleanEmail} as ${role} (${remainingSec}s cooldown remaining). Skipping duplicate.`,
    );
    return {
      success: true,
      deduplicated: true,
      message: `Welcome email recently delivered. Cooldown active for ${remainingSec}s.`,
    };
  }

  const client = getResendClient();
  if (!client) {
    console.warn(
      `[WELCOME EMAIL] Resend client not configured. Welcome email simulated for ${cleanEmail}.`,
    );
    return { success: false, reason: "RESEND_API_KEY missing" };
  }

  const subject = "Welcome!";

  const defaultCustomerUrl =
    process.env.CUSTOMER_SITE_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:3000";
  const defaultStudioUrl =
    process.env.STUDIO_SITE_URL ||
    process.env.STUDIO_URL ||
    "http://localhost:3001";
  const effectivePortalUrl =
    portalUrl || (isStudio ? defaultStudioUrl : defaultCustomerUrl);
  const contactUrl = `${effectivePortalUrl.replace(/\/$/, "")}/contact`;

  const html = buildWelcomeEmailHtml({
    name,
    email: cleanEmail,
    role,
    studioName,
    phone,
    portalUrl,
    loginUrl,
  });

  const plainText = `
Welcome!

${
  isStudio
    ? "Woo! Your studio is active - your atelier is now onboarded with us and, we will be sending you bite-sized tips in your email over the coming weeks to help you grow your bespoke alteration business too."
    : "Woo! Your account is active - you have full access with us and, we will be sending you bite-sized tips in your email over the coming weeks to help you get the most out of your bespoke garment alterations too."
}

${
  isStudio
    ? "Reach out at any time with questions! Right now, head into the workbench, set up your tailor machines and view your incoming orders. We will be happy to help with the rest."
    : "Reach out at any time with questions! Right now, head into the app, explore nearby partner studios and place your first alteration order. We will be happy to help with the rest."
}

By the way,

${isStudio ? "Head to your Darzi Studio" : "Head to your Darzi"}: ${loginUrl || portalUrl || "https://darzi.com"}

${isStudio ? "Team Darzi Studio" : "Team Darzi"}

Have questions or need assistance? Visit our Contact Page: ${contactUrl}

© Copyright Darzi Technologies Ltd, 2026
  `.trim();

  // Prepare CID attachment for welcome handshake image
  try {
    const fromAddress = getFromEmail();
    const result = await client.emails.send({
      from: fromAddress,
      to: cleanEmail,
      subject,
      html,
      text: plainText,
    });

    if (result.error) {
      console.error(
        `[WELCOME EMAIL ERROR] Resend rejected welcome email to ${cleanEmail}:`,
        result.error,
      );
      return { success: false, error: result.error };
    }

    welcomeEmailCooldownMap.set(dedupKey, Date.now());
    console.log(
      `[WELCOME EMAIL] Successfully delivered welcome email to ${cleanEmail} (${role}) via Resend (ID: ${result.data?.id})`,
    );
    return { success: true, id: result.data?.id };
  } catch (err) {
    console.error(
      `[WELCOME EMAIL ERROR] Failed to send welcome email to ${cleanEmail}:`,
      err.message || err,
    );
    return { success: false, error: err.message };
  }
}

module.exports = {
  getResendClient,
  sendOrderOtpEmail,
  sendAuthOtpEmail,
  sendWelcomeEmail,
  buildWelcomeEmailHtml,
  buildOtpEmailHtml,
};
