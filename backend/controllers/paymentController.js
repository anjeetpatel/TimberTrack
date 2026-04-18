const Payment = require('../models/Payment');
const Rental = require('../models/Rental');
const { logActivity } = require('../utils/activityLogger');

// POST /api/payments — OWNER only
exports.recordPayment = async (req, res, next) => {
  try {
    const { rentalId, paymentMethod } = req.body;
    const amount = Number(req.body.amount);

    if (!rentalId) return res.status(400).json({ success: false, message: 'Rental ID is required.' });
    if (!paymentMethod) return res.status(400).json({ success: false, message: 'Payment method is required.' });
    if (isNaN(amount) || amount <= 0) return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero.' });

    const rental = await Rental.findOne({ _id: rentalId, organizationId: req.user.organizationId });
    if (!rental) return res.status(404).json({ success: false, message: 'Rental not found.' });

    const dueAmount = Math.max(0, rental.totalAmount - rental.amountPaid);
    if (dueAmount <= 0) return res.status(400).json({ success: false, message: 'No outstanding balance for this rental.' });
    if (amount > dueAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment amount (₹${amount}) exceeds the due balance (₹${dueAmount.toFixed(2)}).`,
      });
    }

    const payment = await Payment.create({
      organizationId: req.user.organizationId,
      rentalId,
      amount,
      paymentDate: new Date(),
      paymentMethod,
      createdBy: req.user.id,
    });

    rental.amountPaid = parseFloat((rental.amountPaid + amount).toFixed(2));
    const remaining = parseFloat((rental.totalAmount - rental.amountPaid).toFixed(2));
    rental.paymentStatus = remaining <= 0 ? 'PAID' : rental.amountPaid > 0 ? 'PARTIAL' : 'UNPAID';
    await rental.save();

    logActivity({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userName: req.user.name,
      action: 'PAYMENT_RECORDED',
      resourceType: 'Payment',
      resourceId: payment._id,
      meta: { amount, customerName: rental.customerId?.toString() },
    });

    res.status(201).json({
      success: true,
      message: 'Payment recorded!',
      data: {
        payment,
        rentalAmountPaid: rental.amountPaid,
        rentalTotalAmount: rental.totalAmount,
        remainingBalance: Math.max(0, remaining),
        paymentStatus: rental.paymentStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/payments?rentalId=X
exports.getByRental = async (req, res, next) => {
  try {
    const { rentalId } = req.query;
    if (!rentalId) return res.status(400).json({ success: false, message: 'Rental ID is required.' });

    const rental = await Rental.findOne({ _id: rentalId, organizationId: req.user.organizationId });
    if (!rental) return res.status(404).json({ success: false, message: 'Rental not found.' });

    const payments = await Payment.find({ rentalId, organizationId: req.user.organizationId }).sort({ createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};
