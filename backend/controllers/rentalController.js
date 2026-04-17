const mongoose = require('mongoose');
const Rental = require('../models/Rental');
const Inventory = require('../models/Inventory');
const Customer = require('../models/Customer');
const { daysBetween } = require('../utils/dateUtils');

const OVERDUE_THRESHOLD = parseInt(process.env.OVERDUE_THRESHOLD_DAYS) || 30;

// Helper: enrich rental with computed fields
const enrichRental = (rental) => {
  const obj = rental.toJSON ? rental.toJSON() : { ...rental };
  const now = new Date();
  const startDate = new Date(obj.startDate);
  obj.currentDays = daysBetween(startDate, now);
  obj.isOverdue = obj.status === 'ACTIVE' && obj.currentDays > OVERDUE_THRESHOLD;
  obj.remainingBalance = Math.max(0, obj.totalAmount - obj.amountPaid);

  // Compute running cost for items still out
  let runningCost = 0;
  if (obj.status === 'ACTIVE') {
    for (const item of obj.items) {
      const remainingQty = item.issuedQty - item.returnedQty;
      if (remainingQty > 0) {
        const days = daysBetween(item.lastCalculatedDate, now);
        runningCost += remainingQty * item.pricePerDay * days;
      }
    }
  }
  obj.runningCost = runningCost;
  obj.estimatedTotal = obj.totalAmount + runningCost;

  return obj;
};

// GET /api/rentals
exports.getAll = async (req, res, next) => {
  try {
    const { status, search, filter: filterType, page = 1, limit = 20 } = req.query;
    let query = {};

    if (status) query.status = status;
    if (filterType === 'overdue') query.status = 'ACTIVE';
    if (filterType === 'pending') query.paymentStatus = { $in: ['UNPAID', 'PARTIAL'] };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let rentals = await Rental.find(query)
      .populate('customerId', 'name phone email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Rental.countDocuments(query);

    let enriched = rentals.map(enrichRental);

    // Post-filter for overdue (computed field)
    if (filterType === 'overdue') {
      enriched = enriched.filter((r) => r.isOverdue);
    }

    // Search by customer name or rental ID
    if (search) {
      const searchLower = search.toLowerCase();
      enriched = enriched.filter(
        (r) =>
          (r.customerId?.name || '').toLowerCase().includes(searchLower) ||
          r._id.toString().includes(searchLower)
      );
    }

    res.json({
      success: true,
      data: enriched,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/rentals/:id
exports.getById = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id).populate('customerId', 'name phone email');
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found.' });
    }
    res.json({ success: true, data: enrichRental(rental) });
  } catch (error) {
    next(error);
  }
};

// POST /api/rentals — ATOMIC with MongoDB transaction
exports.create = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { customerId, items, startDate } = req.body;

    if (!customerId || !items || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Customer and at least one item are required.' });
    }

    // Verify customer exists
    const customer = await Customer.findById(customerId).session(session);
    if (!customer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const rentalStartDate = startDate ? new Date(startDate) : new Date();
    const rentalItems = [];

    // Validate and reserve stock
    for (const item of items) {
      if (!item.itemId || !item.qty || item.qty <= 0) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: 'Each item must have a valid ID and quantity.' });
      }

      const invItem = await Inventory.findById(item.itemId).session(session);
      if (!invItem) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({ success: false, message: `Inventory item not found: ${item.itemId}` });
      }

      if (item.qty > invItem.availableQuantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Not enough stock for "${invItem.name}". Available: ${invItem.availableQuantity}, Requested: ${item.qty}`,
        });
      }

      // Decrease available quantity
      invItem.availableQuantity -= item.qty;
      await invItem.save({ session });

      rentalItems.push({
        itemId: invItem._id,
        itemName: invItem.name,
        issuedQty: item.qty,
        returnedQty: 0,
        pricePerDay: invItem.pricePerDay,
        lastCalculatedDate: rentalStartDate,
      });
    }

    const rental = new Rental({
      customerId,
      createdBy: req.user?.id,
      items: rentalItems,
      startDate: rentalStartDate,
      status: 'ACTIVE',
      totalAmount: 0,
      amountPaid: 0,
      paymentStatus: 'UNPAID',
    });

    await rental.save({ session });
    await session.commitTransaction();
    session.endSession();

    // Populate and return
    const populated = await Rental.findById(rental._id).populate('customerId', 'name phone email');
    res.status(201).json({
      success: true,
      message: 'Rental created successfully!',
      data: enrichRental(populated),
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};
