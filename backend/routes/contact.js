const express = require('express');
const { sendConciergeInquiryEmail } = require('../lib/email');

const router = express.Router();

/**
 * POST /api/contact
 * Handles submissions from the Contact & Concierge Request forms (customer frontend and studio).
 * Dispatches an email notification to developer.sitarahub@gmail.com
 */
router.post('/', async (req, res) => {
  try {
    const {
      name,
      studioName,
      email,
      phone,
      topic,
      category,
      orderNumber,
      orderId,
      message,
      source,
      priority,
    } = req.body;

    const contactName = (name || studioName || '').trim();
    const contactPhone = (phone || '').trim();
    const contactEmail = (email || '').trim();
    const contactMessage = (message || '').trim();

    if (!contactName) {
      return res.status(400).json({ error: 'Please provide your name.' });
    }

    if (!contactPhone && !contactEmail) {
      return res.status(400).json({ error: 'Please provide either a phone number or email address.' });
    }

    if (!contactMessage) {
      return res.status(400).json({ error: 'Please enter a message or garment notes.' });
    }

    const emailResult = await sendConciergeInquiryEmail({
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
      topic: topic || category || 'General Inquiry',
      orderNumber: orderNumber || orderId || '',
      message: contactMessage,
      source: source || 'Raffu Concierge Desk',
      priority: priority || '',
    });

    if (!emailResult.success) {
      console.warn('[CONTACT ROUTE] Email delivery issue:', emailResult.error || emailResult.reason);
    }

    return res.status(200).json({
      success: true,
      message: 'Your inquiry has been successfully transmitted to our master tailor concierge desk.',
      id: emailResult.id || null,
    });
  } catch (err) {
    console.error('[CONTACT ROUTE ERROR]', err);
    return res.status(500).json({ error: 'Failed to process inquiry. Please try again later.' });
  }
});

module.exports = router;
