const Payment = require('../models/Payment');
const Rental = require('../models/Rental');

// POST /api/payments — with overflow protection
exports.recordPayment = async (req, res, next) => {
  try {
    const { rentalId, amount, paymentMethod } = req.body;

    if (!rentalId || !amount || !paymentMethod) {
      return res.status(400).json({ success: false, message: 'Rental ID, amount, and payment method are required.' });
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero.' });
    }

    const rental = await Rental.findById(rentalId);
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found.' });
    }

    const dueAmount = rental.totalAmount - rental.amountPaid;

    if (dueAmount <= 0) {
      return res.status(400).json({ success: false, message: 'No outstanding balance for this rental.' });
    }

    if (amount > dueAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment amount (₹${amount}) exceeds the due balance (₹${dueAmount}). Please enter ₹${dueAmount} or less.`,
      });
    }

    // Create payment
    const payment = await Payment.create({
      rentalId,
      amount,
      paymentDate: new Date(),
      paymentMethod,
      createdBy: req.user?.id,
    });

    // Update rental
    rental.amountPaid += amount;
    if (rental.amountPaid >= rental.totalAmount) {
      rental.paymentStatus = 'PAID';
    } else if (rental.amountPaid > 0) {
      rental.paymentStatus = 'PARTIAL';
    }
    await rental.save();

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully!',
      data: {
        payment,
        rentalAmountPaid: rental.amountPaid,
        rentalTotalAmount: rental.totalAmount,
        remainingBalance: Math.max(0, rental.totalAmount - rental.amountPaid),
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
    if (!rentalId) {
      return res.status(400).json({ success: false, message: 'Rental ID is required.' });
    }
    const payments = await Payment.find({ rentalId }).sort({ createdAt: -1 });
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};
