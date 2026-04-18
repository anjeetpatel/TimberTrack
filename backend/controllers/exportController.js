const Rental = require('../models/Rental');
const Payment = require('../models/Payment');

const MAX_RANGE_MONTHS = 6;

const parseDateFilter = (startDate, endDate) => {
  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
    // Enforce max 6-month range
    if (startDate && endDate) {
      const diffMs = filter.createdAt.$lte - filter.createdAt.$gte;
      const diffMonths = diffMs / (1000 * 60 * 60 * 24 * 30.44);
      if (diffMonths > MAX_RANGE_MONTHS) {
        throw Object.assign(new Error(`Date range cannot exceed ${MAX_RANGE_MONTHS} months.`), { statusCode: 400 });
      }
    }
  }
  return filter;
};

// GET /api/export/rentals — OWNER only
exports.exportRentals = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter;
    try {
      dateFilter = parseDateFilter(startDate, endDate);
    } catch (e) {
      return res.status(e.statusCode || 400).json({ success: false, message: e.message });
    }

    const rentals = await Rental.find({
      organizationId: req.user.organizationId,
      ...dateFilter,
    })
      .populate('customerId', 'name phone')
      .sort({ createdAt: -1 });

    const csvHeader = 'Rental ID,Customer,Phone,Start Date,Status,Total Amount,Amount Paid,Balance,Payment Status,Created At\n';
    const csvRows = rentals.map((r) => [
      r._id,
      `"${r.customerId?.name || 'N/A'}"`,
      r.customerId?.phone || 'N/A',
      new Date(r.startDate).toLocaleDateString('en-IN'),
      r.status,
      r.totalAmount,
      r.amountPaid,
      Math.max(0, r.totalAmount - r.amountPaid),
      r.paymentStatus,
      new Date(r.createdAt).toLocaleDateString('en-IN'),
    ].join(','));

    const csv = csvHeader + csvRows.join('\n');
    const filename = `timbertrack_rentals${startDate ? `_${startDate}` : ''}${endDate ? `_to_${endDate}` : ''}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

// GET /api/export/payments — OWNER only
exports.exportPayments = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    let dateFilter;
    try {
      dateFilter = parseDateFilter(startDate, endDate);
    } catch (e) {
      return res.status(e.statusCode || 400).json({ success: false, message: e.message });
    }

    const payments = await Payment.find({
      organizationId: req.user.organizationId,
      ...dateFilter,
    })
      .populate({ path: 'rentalId', populate: { path: 'customerId', select: 'name' } })
      .sort({ createdAt: -1 });

    const csvHeader = 'Payment ID,Customer,Rental ID,Amount,Payment Date,Payment Method\n';
    const csvRows = payments.map((p) => [
      p._id,
      `"${p.rentalId?.customerId?.name || 'N/A'}"`,
      p.rentalId?._id || p.rentalId,
      p.amount,
      new Date(p.paymentDate).toLocaleDateString('en-IN'),
      p.paymentMethod,
    ].join(','));

    const csv = csvHeader + csvRows.join('\n');
    const filename = `timbertrack_payments${startDate ? `_${startDate}` : ''}${endDate ? `_to_${endDate}` : ''}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
