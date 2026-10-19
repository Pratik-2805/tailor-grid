const express = require('express');
const { prisma } = require('../lib/prisma');

const router = express.Router();

/**
 * POST /api/contact
 * Handles submissions from the Contact & Concierge Request forms (customer frontend and studio).
 * Exclusively saves the inquiry to the database for Super Admin dashboard display without email dispatch.
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
    const resolvedOrder = (orderNumber || orderId || '').trim();
    const resolvedTopic = topic || category || 'General Inquiry';
    const resolvedPriority = (priority || 'NORMAL').toUpperCase();
    const resolvedSource = source || 'Client Concierge Desk';

    if (!contactName) {
      return res.status(400).json({ error: 'Please provide your name.' });
    }

    if (!contactPhone && !contactEmail) {
      return res.status(400).json({ error: 'Please provide either a phone number or email address.' });
    }

    if (!contactMessage) {
      return res.status(400).json({ error: 'Please enter a message or garment notes.' });
    }

    // Persist inquiry directly into PostgreSQL database for Super Admin dashboard
    const createdInquiry = await prisma.contactInquiry.create({
      data: {
        name: contactName,
        email: contactEmail || null,
        phone: contactPhone || null,
        topic: resolvedTopic,
        category: category || topic || null,
        orderNumber: resolvedOrder || null,
        message: contactMessage,
        source: resolvedSource,
        priority: resolvedPriority,
        status: 'NEW',
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Your inquiry has been successfully transmitted to our master tailor concierge desk.',
      id: createdInquiry?.id || null,
      inquiry: createdInquiry,
    });
  } catch (err) {
    console.error('[CONTACT ROUTE ERROR]', err);
    return res.status(500).json({ error: 'Failed to process inquiry. Please try again later.' });
  }
});

module.exports = router;
