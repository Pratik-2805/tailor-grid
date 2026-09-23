require('dotenv').config();
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { prisma } = require('./prisma');

let snsClient = null;

/**
 * Lazy initialization of AWS SNS Client with environment variables.
 */
function getSnsClient() {
  if (snsClient) return snsClient;

  const region = process.env.AWS_REGION || 'us-east-1';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (accessKeyId && secretAccessKey) {
    try {
      snsClient = new SNSClient({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      console.log(`[AWS SNS] SNS client initialized successfully (Region: ${region})`);
      return snsClient;
    } catch (err) {
      console.error('[AWS SNS] Failed to initialize SNS client:', err.message);
    }
  } else {
    console.warn('[AWS SNS] AWS credentials missing in environment variables.');
  }

  return null;
}

// Initialize on module load
getSnsClient();

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

  // Normalize phone variants (+91..., without +, raw digits) so formatting discrepancies never cause verification to fail
  const validation = validateAndFormatPhone(phone);
  const formattedPhone = validation.isValid ? validation.formatted : phone.trim();
  const rawDigits = phone.replace(/\D/g, '');
  const candidatePhones = Array.from(new Set([formattedPhone, phone.trim(), rawDigits, `+${rawDigits}`])).filter(Boolean);

  // 1. Check PostgreSQL Database first
  try {
    const dbRecord = await prisma.otpVerification.findFirst({
      where: {
        phone: { in: candidatePhones },
        code: cleanCode,
        verified: false,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (dbRecord) {
      await prisma.otpVerification.deleteMany({
        where: { phone: { in: candidatePhones } },
      }).catch(() => {});
      for (const p of candidatePhones) {
        memoryOtpStore.delete(p);
      }
      return true;
    }
  } catch (err) {
    console.warn('[SMS-DB] Database OTP verify error:', err.message);
  }

  // 2. Check in-memory store fallback
  for (const p of candidatePhones) {
    const mem = memoryOtpStore.get(p);
    if (mem && mem.code === cleanCode && Date.now() <= mem.expiresAt) {
      for (const cand of candidatePhones) {
        memoryOtpStore.delete(cand);
      }
      await prisma.otpVerification.deleteMany({
        where: { phone: { in: candidatePhones } },
      }).catch(() => {});
      return true;
    }
  }

  return false;
}

/**
 * Generic helper to send an SMS using AWS SNS.
 */
async function sendSms(toPhone, message) {
  const validation = validateAndFormatPhone(toPhone);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const formattedTo = validation.formatted;
  const client = getSnsClient();

  if (!client) {
    throw new Error('AWS SNS client is not configured. Please check AWS_REGION, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY in .env.');
  }

  const command = new PublishCommand({
    PhoneNumber: formattedTo,
    Message: message,
    MessageAttributes: {
      'AWS.SNS.SMS.SMSType': {
        DataType: 'String',
        StringValue: 'Transactional',
      },
    },
  });

  const response = await client.send(command);
  console.log(`[AWS SNS] SMS dispatched to ${formattedTo}. MessageId: ${response.MessageId}`);
  return {
    success: true,
    messageId: response.MessageId,
    to: formattedTo,
  };
}

/**
 * Sends a real 4-digit verification code SMS using AWS SNS.
 */
async function sendVerificationSms(toPhone, otpCode) {
  const validation = validateAndFormatPhone(toPhone);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const formattedTo = validation.formatted;
  const messageBody = `Your Darzi verification code is: ${otpCode}. Valid for 10 minutes. Do not share this code with anyone.`;

  const client = getSnsClient();

  if (!client) {
    console.warn(`[AWS SNS] Client not configured. Development simulated OTP for ${formattedTo}: ${otpCode}`);
    return {
      success: true,
      messageId: 'simulated-' + Date.now(),
      status: 'simulated',
      to: formattedTo,
      message: `Verification code ${otpCode} generated for ${formattedTo} (AWS SNS not configured)`,
      otp: otpCode,
    };
  }

  try {
    const publishPromise = client.send(
      new PublishCommand({
        PhoneNumber: formattedTo,
        Message: messageBody,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional',
          },
        },
      })
    );

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AWS SNS request timed out after 5 seconds')), 5000)
    );

    const result = await Promise.race([publishPromise, timeoutPromise]);

    console.log(`[AWS SNS] Verification SMS dispatched to ${formattedTo}. MessageId: ${result.MessageId}`);
    return {
      success: true,
      messageId: result.MessageId,
      to: formattedTo,
      message: `Verification code sent via SMS to ${formattedTo}`,
    };
  } catch (err) {
    console.error(`[AWS SNS ERROR] Failed to send SMS to ${formattedTo}:`, err.message || err);
    throw new Error(err.message || 'Failed to send SMS via AWS SNS.');
  }
}

/**
 * Sends order status update SMS via AWS SNS.
 */
async function sendOrderUpdateSms(toPhone, orderId, statusText) {
  const validation = validateAndFormatPhone(toPhone);
  if (!validation.isValid) return null;

  try {
    const body = `Darzi Update: Your order ${orderId} is now ${statusText}. Track your bespoke alterations in your Darzi portal.`;
    const result = await sendSms(validation.formatted, body);
    return result.messageId;
  } catch (err) {
    console.warn(`[AWS SNS] Order update SMS failed for ${toPhone}:`, err.message);
    return null;
  }
}

module.exports = {
  getSnsClient,
  sendSms,
  validateAndFormatPhone,
  saveOtp,
  verifyOtp,
  sendVerificationSms,
  sendOrderUpdateSms,
};
