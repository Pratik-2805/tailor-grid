const express = require('express');
const jwt = require('jsonwebtoken');
const { prisma } = require('../lib/prisma');
const { verifyPassword, hashPassword } = require('../lib/password');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'Darzi_jwt_secret_key_2026';

/**
 * Format helper for order outputs
 */
function formatAdminOrder(order) {
  let measurementsObj = null;
  if (order.fitNotes) {
    try {
      measurementsObj = JSON.parse(order.fitNotes);
    } catch {
      // plain text fit notes
    }
  }

  return {
    id: order.id,
    userId: order.userId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    postcode: order.postcode,
    garmentId: order.garmentId,
    garmentName: order.garmentName,
    serviceId: order.serviceId,
    serviceName: order.serviceName,
    storeId: order.storeId,
    storeName: order.store?.name || order.storeName || 'Unassigned',
    storePhone: order.store?.phone || order.storePhone || '',
    storeArea: order.store?.area || '',
    date: order.date,
    timeSlot: order.timeSlot,
    garmentBrand: order.garmentBrand,
    fitNotes: order.fitNotes,
    pinnedAdjustment: order.pinnedAdjustment,
    sewingNotes: order.sewingNotes,
    slaHours: order.slaHours,
    partnerPayout: order.partnerPayout ?? order.price,
    retailSold: Boolean(order.retailSold),
    retailValue: order.retailValue || 0,
    retailCategory: order.retailCategory || null,
    assignedWorker: order.assignedWorker,
    machineNo: order.machineNo,
    hangTagNo: order.hangTagNo,
    intakePhotoUrl: order.intakePhotoUrl,
    fabricConditionNotes: order.fabricConditionNotes,
    priceAdjustment: order.priceAdjustment,
    priceAdjustmentReason: order.priceAdjustmentReason,
    priceAdjustmentStatus: order.priceAdjustmentStatus,
    status: order.status,
    price: order.price,
    otp: order.otp,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    user: order.user ? {
      id: order.user.id,
      name: order.user.name,
      email: order.user.email,
      phone: order.user.phone,
      status: order.user.status,
      role: order.user.role,
    } : null,
    store: order.store,
    measurements: measurementsObj,
  };
}

// -------------------------------------------------------------
// 0. AUTHENTICATION: SUPER ADMIN ID & PASSWORD
// -------------------------------------------------------------

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { id, email, password } = req.body;
    const identifier = (id || email || '').trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Admin ID / Email and password are required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: identifier, mode: 'insensitive' } },
          { id: identifier },
          { contact: { equals: identifier, mode: 'insensitive' } },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid Super Admin credentials' });
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied: Account does not have Super Admin privileges' });
    }

    if (!user.password) {
      return res.status(401).json({ error: 'Password not set. Please run scripts/create-super-admin.js' });
    }

    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid Super Admin password' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: 'ADMIN',
        isAdmin: true,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      message: 'Super Admin authenticated successfully',
    });
  } catch (err) {
    console.error('Super Admin login error:', err);
    return res.status(500).json({ error: 'Failed to process Super Admin login' });
  }
});

// GET /api/admin/me
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing admin token' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin account not found or deactivated' });
    }

    return res.json({ success: true, user });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired Super Admin token' });
  }
});

// -------------------------------------------------------------
// 1. GET /api/admin/overview - Real-time Platform KPIs & Metrics
// -------------------------------------------------------------
router.get('/overview', async (req, res) => {
  try {
    const [
      totalCustomers,
      totalStudios,
      totalOrders,
      orders,
      stores,
      activeUsers,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.partnerStore.count(),
      prisma.order.count(),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: { store: true, user: true },
      }),
      prisma.partnerStore.findMany({
        include: {
          orders: {
            where: {
              status: { notIn: ['Collected', 'Closed', 'Cancelled'] },
            },
            select: { id: true, price: true, partnerPayout: true },
          },
        },
      }),
      prisma.user.count({ where: { role: 'CUSTOMER', status: 'ACTIVE' } }),
    ]);

    // Financial GMV & Studio Earnings calculation
    // Orders qualify for Studio Earnings only from 'Work in Progress' onwards (cancellation locked)
    const EARNINGS_ELIGIBLE_STATUSES = ['Work in Progress', 'Ready', 'Collected', 'Closed'];

    const [earnedOrdersAggregate, pendingIntakeAggregate] = await Promise.all([
      prisma.order.aggregate({
        where: {
          status: { in: EARNINGS_ELIGIBLE_STATUSES },
        },
        _sum: {
          price: true,
          partnerPayout: true,
        },
      }),
      prisma.order.aggregate({
        where: {
          status: { in: ['Allocated', 'Accepted', 'Customer Arrived', 'Fitting Completed'] },
        },
        _sum: {
          price: true,
        },
      }),
    ]);

    const totalPayouts = earnedOrdersAggregate._sum.price || 0;
    const totalGMV = totalPayouts;
    const pendingIntakeAmount = pendingIntakeAggregate._sum.price || 0;
    const platformMargin = 0;

    // Status breakdown
    const statusCounts = {
      'Allocated': 0,
      'Accepted': 0,
      'Customer Arrived': 0,
      'Fitting Completed': 0,
      'Work in Progress': 0,
      'Ready': 0,
      'Collected': 0,
      'Closed': 0,
      'Cancelled': 0,
    };

    const statusAgg = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    statusAgg.forEach((item) => {
      if (item.status && statusCounts[item.status] !== undefined) {
        statusCounts[item.status] = item._count.id;
      } else if (item.status) {
        statusCounts[item.status] = item._count.id;
      }
    });

    const activeOrdersCount = Object.entries(statusCounts).reduce((acc, [st, count]) => {
      if (!['Collected', 'Closed', 'Cancelled'].includes(st)) {
        return acc + count;
      }
      return acc;
    }, 0);

    // Fleet capacity calculations
    let totalCapacity = 0;
    let totalActiveLoad = 0;
    stores.forEach((s) => {
      totalCapacity += s.dailyCapacity || 25;
      totalActiveLoad += s.orders.length;
    });

    const fleetUtilization = totalCapacity > 0
      ? Math.min(100, Math.round((totalActiveLoad / totalCapacity) * 100))
      : 0;

    return res.json({
      success: true,
      kpis: {
        totalCustomers,
        activeCustomers: activeUsers,
        totalStudios,
        totalOrders,
        activeOrders: activeOrdersCount,
        totalGMV: Math.round(totalGMV * 100) / 100,
        totalEarnings: Math.round(totalPayouts * 100) / 100,
        totalPayouts: Math.round(totalPayouts * 100) / 100,
        pendingIntakeAmount: Math.round(pendingIntakeAmount * 100) / 100,
        platformMargin: 0,
        totalCapacity,
        totalActiveLoad,
        fleetUtilization,
      },
      statusCounts,
      recentOrders: orders.slice(0, 10).map(formatAdminOrder),
    });
  } catch (err) {
    console.error('Admin overview error:', err);
    return res.status(500).json({ error: 'Failed to retrieve admin overview metrics' });
  }
});

// -------------------------------------------------------------
// 2. CUSTOMERS MANAGEMENT
// -------------------------------------------------------------

// GET /api/admin/customers - List customers with search & order counts
router.get('/customers', async (req, res) => {
  try {
    const { search, status } = req.query;

    // In Customer Master, strictly show ONLY actual CUSTOMERS (never Admin or Studio accounts)
    const where = {
      role: 'CUSTOMER',
    };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { contact: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { postcode: { contains: q, mode: 'insensitive' } },
      ];
    }

    const customers = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        orders: {
          select: {
            id: true,
            price: true,
            status: true,
            serviceName: true,
            garmentName: true,
            retailSold: true,
            retailValue: true,
            retailCategory: true,
            storeName: true,
            customerPhone: true,
            customerEmail: true,
            postcode: true,
            date: true,
            createdAt: true,
          },
        },
      },
    });

    const formatted = customers.map((c) => {
      const totalSpend = c.orders
        .filter((o) => o.status !== 'Cancelled')
        .reduce((sum, o) => sum + (o.price || 0), 0);
      const activeOrders = c.orders.filter(
        (o) => !['Collected', 'Closed', 'Cancelled'].includes(o.status)
      ).length;

      let measurements = null;
      if (c.measurements) {
        try {
          measurements = JSON.parse(c.measurements);
        } catch {
          measurements = c.measurements;
        }
      }

      const resolvedPhone = c.phone || (c.contact && !c.contact.includes('@') ? c.contact : null) || c.orders.find((o) => o.customerPhone)?.customerPhone || null;
      const resolvedEmail = c.email || (c.contact && c.contact.includes('@') ? c.contact : null) || c.orders.find((o) => o.customerEmail)?.customerEmail || null;
      const resolvedPostcode = c.postcode || c.orders.find((o) => o.postcode)?.postcode || null;

      return {
        id: c.id,
        name: c.name,
        email: resolvedEmail,
        phone: resolvedPhone,
        contact: c.contact,
        avatar: c.avatar,
        address: c.address,
        postcode: resolvedPostcode,
        method: c.method,
        role: c.role,
        status: c.status,
        studioName: c.studioName,
        measurements,
        orders: c.orders,
        ordersCount: c.orders.length,
        activeOrdersCount: activeOrders,
        totalSpend: Math.round(totalSpend * 100) / 100,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
    });

    return res.json({
      success: true,
      count: formatted.length,
      customers: formatted,
    });
  } catch (err) {
    console.error('Admin fetch customers error:', err);
    return res.status(500).json({ error: 'Failed to fetch customer list' });
  }
});

// GET /api/admin/customers/:id - Single customer with full order history
router.get('/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: { store: true },
        },
      },
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    return res.json({
      success: true,
      customer: {
        ...customer,
        orders: customer.orders.map(formatAdminOrder),
      },
    });
  } catch (err) {
    console.error('Admin get customer error:', err);
    return res.status(500).json({ error: 'Failed to retrieve customer' });
  }
});

// POST /api/admin/customers - Create customer manually
router.post('/customers', async (req, res) => {
  try {
    const { name, email, phone, address, postcode, role, status, measurements } = req.body;
    if (!name || (!email && !phone)) {
      return res.status(400).json({ error: 'Name and at least one contact (email or phone) are required.' });
    }

    const uniqueId = `usr_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

    const newUser = await prisma.user.create({
      data: {
        id: uniqueId,
        name: name.trim(),
        email: email ? email.trim().toLowerCase() : null,
        phone: phone ? phone.trim() : null,
        contact: email ? email.trim().toLowerCase() : phone ? phone.trim() : '',
        address: address ? address.trim() : null,
        postcode: postcode ? postcode.trim().toUpperCase() : null,
        role: role || 'CUSTOMER',
        status: status || 'ACTIVE',
        measurements: measurements ? (typeof measurements === 'string' ? measurements : JSON.stringify(measurements)) : null,
      },
    });

    return res.status(201).json({ success: true, customer: newUser });
  } catch (err) {
    console.error('Admin create customer error:', err);
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'A user with this email or phone number already exists.' });
    }
    return res.status(500).json({ error: 'Failed to create customer' });
  }
});

// PUT /api/admin/customers/:id - Update customer profile / status / measurements
router.put('/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, status, role, address, postcode, measurements } = req.body;

    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (email !== undefined) data.email = email ? email.trim().toLowerCase() : null;
    if (phone !== undefined) data.phone = phone ? phone.trim() : null;
    if (status !== undefined) data.status = status;
    if (role !== undefined) data.role = role;
    if (address !== undefined) data.address = address;
    if (postcode !== undefined) data.postcode = postcode ? postcode.trim().toUpperCase() : null;
    if (measurements !== undefined) {
      data.measurements = typeof measurements === 'string' ? measurements : JSON.stringify(measurements);
    }

    // Sync contact field
    if (data.email) data.contact = data.email;
    else if (data.phone) data.contact = data.phone;

    const updated = await prisma.user.update({
      where: { id },
      data,
    });

    return res.json({ success: true, customer: updated });
  } catch (err) {
    console.error('Admin update customer error:', err);
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Email or phone already taken by another account.' });
    }
    return res.status(500).json({ error: 'Failed to update customer' });
  }
});

// DELETE /api/admin/customers/:id - Delete or archive customer
router.delete('/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Set orders to null userId first or let cascade handle
    await prisma.user.delete({
      where: { id },
    });
    return res.json({ success: true, message: 'Customer record deleted successfully.' });
  } catch (err) {
    console.error('Admin delete customer error:', err);
    return res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// -------------------------------------------------------------
// 3. STUDIOS / PARTNER STORES MANAGEMENT
// -------------------------------------------------------------

// GET /api/admin/studios - List studios with live load & capacity metrics
router.get('/studios', async (req, res) => {
  try {
    const { search, area } = req.query;

    const where = {};
    if (area && area !== 'ALL') {
      where.area = area;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { area: { contains: q, mode: 'insensitive' } },
        { postcode: { contains: q, mode: 'insensitive' } },
        { leadTailor: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [stores, studioUsers] = await Promise.all([
      prisma.partnerStore.findMany({
        where,
        orderBy: { name: 'asc' },
        include: {
          orders: {
            select: {
              id: true,
              status: true,
              price: true,
              partnerPayout: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.user.findMany({
        where: { role: 'STUDIO' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          contact: true,
          studioId: true,
          studioName: true,
        },
      }),
    ]);

    const formatted = stores.map((s) => {
      // Find matching user for studio to resolve actual phone and email if missing or defaulted
      const matchedUser = studioUsers.find(
        (u) => (u.studioId && u.studioId === s.id) ||
               (u.studioName && u.studioName.toLowerCase() === s.name.toLowerCase()) ||
               (u.name && s.leadTailor && u.name.toLowerCase() === s.leadTailor.toLowerCase())
      );

      let actualPhone = s.phone;
      if (!actualPhone || actualPhone.includes('7946 0912')) {
        actualPhone = matchedUser?.phone || matchedUser?.contact || (s.phone && !s.phone.includes('7946 0912') ? s.phone : null);
      }
      const actualEmail = s.email || matchedUser?.email || (matchedUser?.contact && matchedUser.contact.includes('@') ? matchedUser.contact : null) || null;

      // If store in DB has the dummy number or missing email, heal it in the background
      if ((s.phone && s.phone.includes('7946 0912') && actualPhone && !actualPhone.includes('7946 0912')) || (!s.email && actualEmail)) {
        prisma.partnerStore.update({
          where: { id: s.id },
          data: {
            phone: actualPhone,
            email: actualEmail,
          },
        }).catch(() => {});
      }

      const activeOrders = s.orders.filter(
        (o) => !['Collected', 'Closed', 'Cancelled'].includes(o.status)
      );
      const completedOrders = s.orders.filter((o) =>
        ['Collected', 'Closed'].includes(o.status)
      );
      const totalPayoutEarned = s.orders
        .filter((o) => ['Work in Progress', 'Ready', 'Collected', 'Closed'].includes(o.status))
        .reduce((sum, o) => sum + (o.partnerPayout || o.price || 0), 0);
      const capacity = s.dailyCapacity || 25;
      const utilization = Math.min(100, Math.round((activeOrders.length / capacity) * 100));

      return {
        id: s.id,
        name: s.name,
        area: s.area,
        address: s.address,
        postcode: s.postcode,
        phone: actualPhone,
        email: actualEmail,
        leadTailor: s.leadTailor,
        dailyCapacity: capacity,
        machines: s.machines,
        workers: s.workers,
        rating: s.rating,
        reviewCount: s.reviewCount,
        openingHours: s.openingHours,
        specialties: s.specialties,
        retailSold: s.retailSold,
        lat: s.lat,
        lng: s.lng,
        activeOrdersCount: activeOrders.length,
        completedOrdersCount: completedOrders.length,
        totalOrdersCount: s.orders.length,
        totalPayoutEarned: Math.round(totalPayoutEarned * 100) / 100,
        utilization,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      };
    });

    return res.json({
      success: true,
      count: formatted.length,
      studios: formatted,
    });
  } catch (err) {
    console.error('Admin fetch studios error:', err);
    return res.status(500).json({ error: 'Failed to fetch partner studios' });
  }
});

// POST /api/admin/studios - Onboard / create new studio
router.post('/studios', async (req, res) => {
  try {
    const {
      name,
      area,
      address,
      postcode,
      phone,
      email,
      leadTailor,
      dailyCapacity,
      machines,
      workers,
      specialties,
      openingHours,
      lat,
      lng,
      rating,
    } = req.body;

    if (!name || !address || !postcode) {
      return res.status(400).json({ error: 'Studio Name, Address, and Postcode are required.' });
    }

    const uniqueId = `store_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;

    const newStore = await prisma.partnerStore.create({
      data: {
        id: uniqueId,
        name: name.trim(),
        area: area ? area.trim() : (postcode.split(' ')[0] || 'Central'),
        address: address.trim(),
        postcode: postcode.trim().toUpperCase(),
        phone: phone ? phone.trim() : null,
        email: email ? email.trim().toLowerCase() : null,
        leadTailor: leadTailor ? leadTailor.trim() : 'Master Tailor',
        dailyCapacity: dailyCapacity ? parseInt(dailyCapacity, 10) : 25,
        machines: machines ? parseInt(machines, 10) : 6,
        workers: workers ? parseInt(workers, 10) : 4,
        specialties: Array.isArray(specialties)
          ? specialties
          : specialties ? specialties.split(',').map((s) => s.trim()) : ['Suits', 'Dresses', 'Trousers'],
        openingHours: openingHours || '09:00 - 19:00',
        rating: rating ? parseFloat(rating) : 4.9,
        lat: lat ? parseFloat(lat) : 51.5074,
        lng: lng ? parseFloat(lng) : -0.1278,
      },
    });

    return res.status(201).json({ success: true, studio: newStore });
  } catch (err) {
    console.error('Admin create studio error:', err);
    return res.status(500).json({ error: 'Failed to create studio partner' });
  }
});

// PUT /api/admin/studios/:id - Update studio details & capacity
router.put('/studios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      area,
      address,
      postcode,
      phone,
      email,
      leadTailor,
      dailyCapacity,
      machines,
      workers,
      specialties,
      openingHours,
      rating,
      lat,
      lng,
    } = req.body;

    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (area !== undefined) data.area = area.trim();
    if (address !== undefined) data.address = address.trim();
    if (postcode !== undefined) data.postcode = postcode.trim().toUpperCase();
    if (phone !== undefined) data.phone = phone ? phone.trim() : null;
    if (email !== undefined) data.email = email ? email.trim().toLowerCase() : null;
    if (leadTailor !== undefined) data.leadTailor = leadTailor.trim();
    if (dailyCapacity !== undefined) data.dailyCapacity = parseInt(dailyCapacity, 10);
    if (machines !== undefined) data.machines = parseInt(machines, 10);
    if (workers !== undefined) data.workers = parseInt(workers, 10);
    if (openingHours !== undefined) data.openingHours = openingHours.trim();
    if (rating !== undefined) data.rating = parseFloat(rating);
    if (lat !== undefined) data.lat = parseFloat(lat);
    if (lng !== undefined) data.lng = parseFloat(lng);
    if (specialties !== undefined) {
      data.specialties = Array.isArray(specialties)
        ? specialties
        : specialties.split(',').map((s) => s.trim());
    }

    const updated = await prisma.partnerStore.update({
      where: { id },
      data,
    });

    // Also sync updated phone / email to linked studio user
    try {
      const studioUser = await prisma.user.findFirst({
        where: {
          role: 'STUDIO',
          OR: [{ studioId: id }, { studioName: updated.name }],
        },
      });
      if (studioUser) {
        const userUpdate = {};
        if (data.phone) userUpdate.phone = data.phone;
        if (data.email) userUpdate.email = data.email;
        if (data.leadTailor) userUpdate.name = data.leadTailor;
        if (data.name) userUpdate.studioName = data.name;
        if (Object.keys(userUpdate).length > 0) {
          await prisma.user.update({ where: { id: studioUser.id }, data: userUpdate });
        }
      }
    } catch (e) {
      console.warn('Sync studio user error on store update:', e.message);
    }

    return res.json({ success: true, studio: updated });
  } catch (err) {
    console.error('Admin update studio error:', err);
    return res.status(500).json({ error: 'Failed to update studio partner' });
  }
});

// DELETE /api/admin/studios/:id - Delete partner store
router.delete('/studios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.partnerStore.delete({
      where: { id },
    });
    return res.json({ success: true, message: 'Studio partner removed successfully.' });
  } catch (err) {
    console.error('Admin delete studio error:', err);
    return res.status(500).json({ error: 'Failed to delete studio partner' });
  }
});

// -------------------------------------------------------------
// 4. ORDERS & DISPATCH MANAGEMENT
// -------------------------------------------------------------

// GET /api/admin/orders - Full orders list with cross filters
router.get('/orders', async (req, res) => {
  try {
    const { search, status, storeId, limit = 100 } = req.query;

    const where = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (storeId && storeId !== 'ALL') {
      where.storeId = storeId;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { id: { contains: q, mode: 'insensitive' } },
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerEmail: { contains: q, mode: 'insensitive' } },
        { customerPhone: { contains: q, mode: 'insensitive' } },
        { hangTagNo: { contains: q, mode: 'insensitive' } },
        { serviceName: { contains: q, mode: 'insensitive' } },
        { garmentName: { contains: q, mode: 'insensitive' } },
        { storeName: { contains: q, mode: 'insensitive' } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit, 10),
      include: {
        store: true,
        user: true,
      },
    });

    return res.json({
      success: true,
      count: orders.length,
      orders: orders.map(formatAdminOrder),
    });
  } catch (err) {
    console.error('Admin fetch orders error:', err);
    return res.status(500).json({ error: 'Failed to fetch admin orders' });
  }
});

// PUT /api/admin/orders/:id - Master admin modification & studio reassignment
router.put('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      storeId,
      hangTagNo,
      price,
      partnerPayout,
      fitNotes,
      sewingNotes,
      assignedWorker,
      machineNo,
    } = req.body;

    const data = {};
    if (status !== undefined) data.status = status;
    if (hangTagNo !== undefined) data.hangTagNo = hangTagNo;
    if (price !== undefined) data.price = parseFloat(price);
    if (partnerPayout !== undefined) data.partnerPayout = parseFloat(partnerPayout);
    if (fitNotes !== undefined) data.fitNotes = fitNotes;
    if (sewingNotes !== undefined) data.sewingNotes = sewingNotes;
    if (assignedWorker !== undefined) data.assignedWorker = assignedWorker;
    if (machineNo !== undefined) data.machineNo = machineNo;
    if (req.body.retailSold !== undefined) data.retailSold = Boolean(req.body.retailSold);
    if (req.body.retailValue !== undefined) data.retailValue = req.body.retailValue ? parseFloat(req.body.retailValue) : null;
    if (req.body.retailCategory !== undefined) data.retailCategory = req.body.retailCategory;

    // Handle Studio Reassignment
    if (storeId !== undefined) {
      data.storeId = storeId;
      if (storeId) {
        const targetStore = await prisma.partnerStore.findUnique({
          where: { id: storeId },
        });
        if (targetStore) {
          data.storeName = targetStore.name;
          data.storePhone = targetStore.phone;
        }
      } else {
        data.storeName = null;
        data.storePhone = null;
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data,
      include: {
        store: true,
        user: true,
      },
    });

    return res.json({
      success: true,
      order: formatAdminOrder(updated),
      message: 'Order updated successfully by Master Admin.',
    });
  } catch (err) {
    console.error('Admin update order error:', err);
    return res.status(500).json({ error: 'Failed to update order' });
  }
});

// -------------------------------------------------------------
// 5. GLOBAL OMNICHANNEL SEARCH
// -------------------------------------------------------------
// GET /api/admin/search?q=
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json({
        success: true,
        customers: [],
        studios: [],
        orders: [],
      });
    }

    const query = q.trim();

    const [customers, studios, orders] = await Promise.all([
      // Customers search
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
            { postcode: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          postcode: true,
        },
      }),

      // Studios search
      prisma.partnerStore.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { area: { contains: query, mode: 'insensitive' } },
            { postcode: { contains: query, mode: 'insensitive' } },
            { leadTailor: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 10,
      }),

      // Orders search
      prisma.order.findMany({
        where: {
          OR: [
            { id: { contains: query, mode: 'insensitive' } },
            { customerName: { contains: query, mode: 'insensitive' } },
            { customerPhone: { contains: query, mode: 'insensitive' } },
            { customerEmail: { contains: query, mode: 'insensitive' } },
            { hangTagNo: { contains: query, mode: 'insensitive' } },
            { storeName: { contains: query, mode: 'insensitive' } },
            { serviceName: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 15,
        include: {
          store: true,
          user: true,
        },
      }),
    ]);

    return res.json({
      success: true,
      query,
      results: {
        customers,
        studios,
        orders: orders.map(formatAdminOrder),
      },
    });
  } catch (err) {
    console.error('Admin search error:', err);
    return res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
