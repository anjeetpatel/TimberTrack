const Customer = require('../models/Customer');
const Rental = require('../models/Rental');
const Organization = require('../models/Organization');
const { logActivity } = require('../utils/activityLogger');

const ORG_FILTER = (req) => ({
  organizationId: req.user.organizationId,
  isDeleted: { $ne: true },
});

// GET /api/customers
exports.getAll = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const filter = ORG_FILTER(req);

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [customers, total] = await Promise.all([
      Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Customer.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: customers,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/customers — req.org attached by checkSubscription middleware
exports.create = async (req, res, next) => {
  try {
    const { name, phone, email, address } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, message: 'Name and phone number are required.' });
    }

    const customer = await Customer.create({
      organizationId: req.user.organizationId,
      name: name.trim(),
      phone: phone.trim(),
      email: email?.trim().toLowerCase() || '',
      address: address?.trim() || '',
    });

    // Increment org usage counter (req.org set by checkSubscription)
    if (req.org) {
      req.org.usageStats.totalCustomers += 1;
      await req.org.save();
    } else {
      await Organization.findByIdAndUpdate(req.user.organizationId, {
        $inc: { 'usageStats.totalCustomers': 1 },
      });
    }

    logActivity({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userName: req.user.name,
      action: 'CUSTOMER_ADDED',
      resourceType: 'Customer',
      resourceId: customer._id,
      meta: { customerName: customer.name },
    });

    res.status(201).json({ success: true, message: 'Customer added!', data: customer });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/customers/:id — OWNER only, soft delete with active-rental guard
exports.delete = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, ...ORG_FILTER(req) });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });

    // Block deletion if customer has active rentals
    const hasActiveRentals = await Rental.exists({
      customerId: customer._id,
      organizationId: req.user.organizationId,
      status: 'ACTIVE',
    });
    if (hasActiveRentals) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete "${customer.name}" — they have active rentals. Complete all rentals first.`,
      });
    }

    customer.isDeleted = true;
    customer.deletedAt = new Date();
    await customer.save();

    // Decrement org customer count
    await Organization.findByIdAndUpdate(req.user.organizationId, {
      $inc: { 'usageStats.totalCustomers': -1 },
    });

    logActivity({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userName: req.user.name,
      action: 'CUSTOMER_DELETED',
      resourceType: 'Customer',
      resourceId: customer._id,
      meta: { customerName: customer.name },
    });

    res.json({ success: true, message: `Customer "${customer.name}" removed.` });
  } catch (error) {
    next(error);
  }
};
