const express = require('express');
const { readDb } = require('../db');

const router = express.Router();

// GET /api/services
router.get('/services', (req, res) => {
  try {
    const db = readDb();
    return res.json({ services: db.services || [] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// GET /api/stores
router.get('/stores', (req, res) => {
  try {
    const db = readDb();
    return res.json({ stores: db.stores || [] });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch stores' });
  }
});

module.exports = router;
