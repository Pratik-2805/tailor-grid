require('dotenv').config();
let twilio = null;
try {
  twilio = require('twilio');
} catch (e) {
  console.warn('[SMS] Twilio module not installed, fallback OTP mode active.');
}
const { prisma } = require('./prisma');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

let twilioClient = null;
if (twilio && accountSid && authToken && accountSid.startsWith('AC')) {
  try {
    twilioClient = twilio(accountSid, authToken);
    console.log('[SMS] Twilio client initialized with SID:', accountSid.substring(0, 6) + '...');
  } catch (err) {
    console.error('[SMS] Failed to initialize Twilio client:', err.message);
  }
} else {
  console.warn('[SMS] Twilio client not configured or missing credentials, fallback demo codes active.');
}

// In-memory cache as secondary fallback
const memoryOtpStore = new Map();

/**
 * Validates and formats a phone number into strict international E.164 format (+[country][digits]).
 */
function validateAndFormatPhone(rawPhone, defaultCountryCode = '+91') {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return {
      isValid: false,
      formatted: null,
      error: 'Please enter a mobile phone number.',
    };
  }

  let cleaned = rawPhone.trim().replace(/[\s\-\(\)\.,]/g, '');

  if (!cleaned) {
    return {
      isValid: false,
      formatted: null,
      error: 'Please enter a mobile phone number.',
    };
  }

  if (cleaned.startsWith('00')) {
    cleaned = '+' + cleaned.slice(2);
  }

  if (cleaned.startsWith('+')) {
    const digitsOnly = cleaned.slice(1);
    if (!/^\d+$/.test(digitsOnly)) {
      return {
        isValid: false,
        formatted: null,
        error: 'Phone number can only contain numeric digits after "+".',
      };
    }
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      return {
        isValid: false,
        formatted: null,
        error: `Invalid phone number length (${digitsOnly.length} digits). International format requires 8 to 15 digits.`,
      };
    }
    return {
      isValid: true,
      formatted: `+${digitsOnly}`,
    };
  }

  if (cleaned.startsWith('0') && cleaned.length > 10) {
    cleaned = cleaned.replace(/^0+/, '');
  } else if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }

  if (!/^\d+$/.test(cleaned)) {
    return {
      isValid: false,
      formatted: null,
      error: 'Phone number must contain only numeric digits.',
    };
  }

  if (cleaned.length === 10) {
    if (/^[6-9]/.test(cleaned)) {
      return {
        isValid: true,
        formatted: `+91${cleaned}`,
      };
    }
    if (defaultCountryCode === '+1' || /^[2-5]/.test(cleaned)) {
      return {
        isValid: true,
        formatted: `+1${cleaned}`,
      };
    }
    const prefix = defaultCountryCode.startsWith('+') ? defaultCountryCode : `+${defaultCountryCode}`;
    return {
      isValid: true,
      formatted: `${prefix}${cleaned}`,
    };
  }

  if (cleaned.length >= 11 && cleaned.length <= 15) {
    return {
      isValid: true,
      formatted: `+${cleaned}`,
    };
  }

  return {
    isValid: false,
    formatted: null,
    error: 'Invalid phone number format. Please provide a 10-digit number or international number (e.g. +91 9876543210 or +1 5189812361).',
  };
}

/**
 * Persists an OTP code into PostgreSQL and memory cache.
 */
async function saveOtp(phone, code, ttlMinutes = 10) {
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  // 1. In-memory cache
  memoryOtpStore.set(phone, {
    code,
    expiresAt: expiresAt.getTime(),
  });

  // 2. PostgreSQL persistence (survives restarts)
  try {
    await prisma.otpVerification.deleteMany({
      where: { phone },
    });

    await prisma.otpVerification.create({
      data: {
        phone,
        code,
        expiresAt,
        verified: false,
      },
    });
  } catch (err) {
    console.warn('[SMS-DB] Database OTP save fallback warning:', err.message);
  }
}

/**
 * Verifies and clears an OTP code against PostgreSQL and memory cache.
 */
async function verifyOtp(phone, inputCode) {
  if (!phone || !inputCode) return false;
  const cleanCode = String(inputCode).trim();
  const now = new Date();

  // 1. Check PostgreSQL Database first
  try {
    const dbRecord = await prisma.otpVerification.findFirst({
      where: {
        phone,
        code: cleanCode,
        verified: false,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (dbRecord) {
      await prisma.otpVerification.deleteMany({ where: { phone } }).catch(() => {});
      memoryOtpStore.delete(phone);
      return true;
    }
  } catch (err) {
    console.warn('[SMS-DB] Database OTP verify error:', err.message);
  }

  // 2. Check in-memory store fallback
  const mem = memoryOtpStore.get(phone);
  if (mem && mem.code === cleanCode && Date.now() <= mem.expiresAt) {
    memoryOtpStore.delete(phone);
    await prisma.otpVerification.deleteMany({ where: { phone } }).catch(() => {});
    return true;
  }

  return false;
}

/**
 * Sends a real 4-digit verification code SMS using Twilio.
 */
async function sendVerificationSms(toPhone, otpCode) {
  const validation = validateAndFormatPhone(toPhone);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const formattedTo = validation.formatted;
  const messageBody = `Your Darzi verification code is: ${otpCode}. Valid for 10 minutes. Do not share this code with anyone.`;

  if (!twilioClient || !fromPhone) {
    throw new Error('Twilio SMS is not configured in backend .env.');
  }

  try {
    const result = await twilioClient.messages.create({
      body: messageBody,
      from: fromPhone,
      to: formattedTo,
    });

    console.log(`[SMS] Twilio message dispatched to ${formattedTo}. SID: ${result.sid}, Status: ${result.status}`);
    return {
      success: true,
      sid: result.sid,
      status: result.status,
      to: formattedTo,
      message: `Verification code sent via SMS to ${formattedTo}`,
    };
  } catch (err) {
    console.error(`[SMS-ERROR] Twilio error sending to ${formattedTo}:`, err.message, 'Code:', err.code);

    let userFriendlyError = err.message;
    if (err.code === 21608) {
      userFriendlyError = `Twilio Trial: ${formattedTo} is not verified in your Twilio Console.`;
    } else if (err.code === 21211) {
      userFriendlyError = `Invalid phone number format for destination: ${formattedTo}.`;
    } else if (err.code === 21408) {
      userFriendlyError = `Twilio Geo-permissions: SMS to region for ${formattedTo} is disabled in your Twilio console.`;
    } else if (err.code === 20003) {
      userFriendlyError = 'Twilio authentication failed. Check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in backend .env.';
    }

    throw new Error(`Failed to send SMS to ${formattedTo}: ${userFriendlyError}`);
  }
}

/**
 * Sends order status update SMS.
 */
async function sendOrderUpdateSms(toPhone, orderId, statusText) {
  const validation = validateAndFormatPhone(toPhone);
  if (!validation.isValid || !twilioClient || !fromPhone) return null;

  try {
    const body = `Darzi Update: Your order ${orderId} is now ${statusText}. Track your bespoke alterations in your Darzi portal.`;
    const result = await twilioClient.messages.create({
      body,
      from: fromPhone,
      to: validation.formatted,
    });
    return result.sid;
  } catch (err) {
    console.warn(`[SMS] Order update SMS failed for ${toPhone}:`, err.message);
    return null;
  }
}

module.exports = {
  validateAndFormatPhone,
  saveOtp,
  verifyOtp,
  sendVerificationSms,
  sendOrderUpdateSms,
};
