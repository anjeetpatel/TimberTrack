const Rental = require('../models/Rental');
const Inventory = require('../models/Inventory');
const Customer = require('../models/Customer');
const Organization = require('../models/Organization');
const { daysBetween } = require('../utils/dateUtils');
const { withTransaction } = require('../utils/transactionHelper');
const { logActivity } = require('../utils/activityLogger');

const OVERDUE_THRESHOLD = parseInt(process.env.OVERDUE_THRESHOLD_DAYS) || 30;

const enrichRental = (rental) => {
  const obj = rental.toJSON ? rental.toJSON() : { ...rental };
  const now = new Date();
  obj.currentDays = daysBetween(new Date(obj.startDate), now);
  obj.isOverdue = obj.status === 'ACTIVE' && obj.currentDays > OVERDUE_THRESHOLD;
  obj.remainingBalance = Math.max(0, obj.totalAmount - obj.amountPaid);

  let runningCost = 0;
  if (obj.status === 'ACTIVE') {
    for (const item of obj.items) {
      const remainingQty = item.issuedQty - item.returnedQty;
      if (remainingQty > 0) {
        runningCost += remainingQty * item.pricePerDay * daysBetween(item.lastCalculatedDate, now);
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
    const { status, filter: filterType, search, page = 1, limit = 20 } = req.query;
    const query = { organizationId: req.user.organizationId };

    if (status) query.status = status;
    if (filterType === 'pending') query.paymentStatus = { $in: ['UNPAID', 'PARTIAL'] };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    let rentals = await Rental.find(query)
      .populate('customerId', 'name phone email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Rental.countDocuments(query);
    let enriched = rentals.map(enrichRental);

    if (filterType === 'overdue') enriched = enriched.filter((r) => r.isOverdue);
    if (search) {
      const s = search.toLowerCase();
      enriched = enriched.filter(
        (r) => (r.customerId?.name || '').toLowerCase().includes(s) || r._id.toString().includes(s)
      );
    }

    res.json({
      success: true,
      data: enriched,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/rentals/:id
exports.getById = async (req, res, next) => {
  try {
    const rental = await Rental.findOne({ _id: req.params.id, organizationId: req.user.organizationId })
      .populate('customerId', 'name phone email');
    if (!rental) return res.status(404).json({ success: false, message: 'Rental not found.' });
    res.json({ success: true, data: enrichRental(rental) });
  } catch (error) {
    next(error);
  }
};

// POST /api/rentals — req.org attached by checkSubscription
exports.create = async (req, res, next) => {
  try {
    const { customerId, items, startDate } = req.body;

    if (!customerId || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Customer and at least one item are required.' });
    }
    for (const item of items) {
      const qty = parseInt(item.qty);
      if (!item.itemId) return res.status(400).json({ success: false, message: 'Each item must have a valid item ID.' });
      if (!qty || qty <= 0) return res.status(400).json({ success: false, message: 'Each item must have a quantity greater than zero.' });
      item.qty = qty;
    }

    const rentalId = await withTransaction(async (session) => {
      const findOpts = session ? { session } : {};

      const customer = await Customer.findOne(
        { _id: customerId, organizationId: req.user.organizationId, isDeleted: { $ne: true } },
        null, findOpts
      );
      if (!customer) { const e = new Error('Customer not found.'); e.statusCode = 404; throw e; }

      const rentalStartDate = startDate ? new Date(startDate) : new Date();
      const rentalItems = [];

      for (const item of items) {
        const invItem = await Inventory.findOne(
          { _id: item.itemId, organizationId: req.user.organizationId, isDeleted: { $ne: true } },
          null, findOpts
        );
        if (!invItem) { const e = new Error(`Item not found: ${item.itemId}`); e.statusCode = 404; throw e; }
        if (item.qty > invItem.availableQuantity) {
          const e = new Error(`Insufficient stock for "${invItem.name}". Available: ${invItem.availableQuantity}, Requested: ${item.qty}`);
          e.statusCode = 400; throw e;
        }
        invItem.availableQuantity -= item.qty;
        session ? await invItem.save({ session }) : await invItem.save();

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
        organizationId: req.user.organizationId,
        customerId,
        createdBy: req.user.id,
        items: rentalItems,
        startDate: rentalStartDate,
        status: 'ACTIVE',
        totalAmount: 0,
        amountPaid: 0,
        paymentStatus: 'UNPAID',
      });
      session ? await rental.save({ session }) : await rental.save();
      return rental._id;
    });

    // Update usage counter (req.org set by checkSubscription middleware)
    if (req.org) {
      req.org.usageStats.rentalsThisMonth += 1;
      await req.org.save();
    } else {
      await Organization.findByIdAndUpdate(req.user.organizationId, {
        $inc: { 'usageStats.rentalsThisMonth': 1 },
      });
    }

    const populated = await Rental.findById(rentalId).populate('customerId', 'name phone email');

    logActivity({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userName: req.user.name,
      action: 'RENTAL_CREATED',
      resourceType: 'Rental',
      resourceId: rentalId,
      meta: { customerName: populated.customerId?.name, itemCount: populated.items.length },
    });

    res.status(201).json({ success: true, message: 'Rental created!', data: enrichRental(populated) });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ success: false, message: error.message });
    next(error);
  }
};
