const Rental = require('../models/Rental');
const Payment = require('../models/Payment');

// GET /api/export/rentals?format=csv
exports.exportRentals = async (req, res, next) => {
  try {
    const rentals = await Rental.find().populate('customerId', 'name phone').sort({ createdAt: -1 });

    const csvHeader = 'Rental ID,Customer,Phone,Start Date,Status,Total Amount,Amount Paid,Balance,Payment Status\n';
    const csvRows = rentals.map((r) => {
      const balance = Math.max(0, r.totalAmount - r.amountPaid);
      return [
        r._id,
        `"${r.customerId?.name || 'N/A'}"`,
        r.customerId?.phone || 'N/A',
        new Date(r.startDate).toLocaleDateString('en-IN'),
        r.status,
        r.totalAmount,
        r.amountPaid,
        balance,
        r.paymentStatus,
      ].join(',');
    });

    const csv = csvHeader + csvRows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=timbertrack_rentals.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

// GET /api/export/payments?format=csv
exports.exportPayments = async (req, res, next) => {
  try {
    const payments = await Payment.find().populate('rentalId').sort({ createdAt: -1 });

    const csvHeader = 'Payment ID,Rental ID,Amount,Payment Date,Payment Method\n';
    const csvRows = payments.map((p) => {
      return [
        p._id,
        p.rentalId?._id || p.rentalId,
        p.amount,
        new Date(p.paymentDate).toLocaleDateString('en-IN'),
        p.paymentMethod,
      ].join(',');
    });

    const csv = csvHeader + csvRows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=timbertrack_payments.csv');
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
