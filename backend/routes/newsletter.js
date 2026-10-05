const express = require('express');
const { prisma } = require('../lib/prisma');

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/newsletter/subscribe
 * Public endpoint to subscribe an email to offers & updates
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { email, source } = req.body;

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanSource = typeof source === 'string' && source.trim() ? source.trim() : 'footer';

    // Upsert subscription: reactivate if previously unsubscribed, or create new
    const subscription = await prisma.newsletterSubscription.upsert({
      where: { email: cleanEmail },
      update: {
        status: 'ACTIVE',
        source: cleanSource,
      },
      create: {
        email: cleanEmail,
        source: cleanSource,
        status: 'ACTIVE',
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Thank you for subscribing to Darzi offers and updates!',
      subscription: {
        id: subscription.id,
        email: subscription.email,
        status: subscription.status,
        createdAt: subscription.createdAt,
      },
    });
  } catch (err) {
    console.error('Newsletter subscribe error:', err);
    return res.status(500).json({ error: 'Failed to process subscription. Please try again later.' });
  }
});

/**
 * POST /api/newsletter/unsubscribe
 * Unsubscribe an email from newsletter
 */
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email: cleanEmail },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    await prisma.newsletterSubscription.update({
      where: { email: cleanEmail },
      data: { status: 'UNSUBSCRIBED' },
    });

    return res.json({ success: true, message: 'Unsubscribed successfully.' });
  } catch (err) {
    console.error('Newsletter unsubscribe error:', err);
    return res.status(500).json({ error: 'Failed to process unsubscribe request.' });
  }
});

/**
 * GET /api/newsletter/subscribers
 * List all newsletter subscribers (can be viewed in admin or backend)
 */
router.get('/subscribers', async (req, res) => {
  try {
    const { status, limit = 100 } = req.query;

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [subscribers, totalCount, activeCount] = await Promise.all([
      prisma.newsletterSubscription.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit, 10) || 100,
      }),
      prisma.newsletterSubscription.count(),
      prisma.newsletterSubscription.count({ where: { status: 'ACTIVE' } }),
    ]);

    return res.json({
      success: true,
      total: totalCount,
      active: activeCount,
      subscribers,
    });
  } catch (err) {
    console.error('Newsletter fetch error:', err);
    return res.status(500).json({ error: 'Failed to fetch subscribers.' });
  }
});

module.exports = router;
