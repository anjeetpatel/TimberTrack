const Rental = require('../models/Rental');
const Payment = require('../models/Payment');
const Inventory = require('../models/Inventory');
const { daysBetween } = require('../utils/dateUtils');

const OVERDUE_THRESHOLD = parseInt(process.env.OVERDUE_THRESHOLD_DAYS) || 30;

// GET /api/dashboard/stats
exports.getStats = async (req, res, next) => {
  try {
    const now = new Date();

    // Active rentals
    const activeRentals = await Rental.find({ status: 'ACTIVE' }).populate('customerId', 'name phone');

    // Count overdue
    let overdueCount = 0;
    let totalItemsOut = 0;
    for (const rental of activeRentals) {
      const currentDays = daysBetween(rental.startDate, now);
      if (currentDays > OVERDUE_THRESHOLD) overdueCount++;
      for (const item of rental.items) {
        totalItemsOut += item.issuedQty - item.returnedQty;
      }
    }

    // Total revenue (all payments)
    const revenueAgg = await Payment.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    // Pending payments
    const pendingAgg = await Rental.aggregate([
      { $match: { paymentStatus: { $in: ['UNPAID', 'PARTIAL'] } } },
      { $group: { _id: null, total: { $sum: { $subtract: ['$totalAmount', '$amountPaid'] } } } },
    ]);
    const pendingPayments = pendingAgg.length > 0 ? pendingAgg[0].total : 0;

    // Recent rentals (for dashboard table)
    const recentRentals = activeRentals.slice(0, 10).map((r) => {
      const obj = r.toJSON();
      obj.currentDays = daysBetween(r.startDate, now);
      obj.isOverdue = obj.currentDays > OVERDUE_THRESHOLD;
      obj.totalItems = r.items.reduce((sum, item) => sum + item.issuedQty, 0);
      obj.itemsOut = r.items.reduce((sum, item) => sum + (item.issuedQty - item.returnedQty), 0);
      return obj;
    });

    // Inventory summary
    const totalInventory = await Inventory.countDocuments();
    const lowStock = await Inventory.countDocuments({
      $expr: { $lt: ['$availableQuantity', { $multiply: ['$totalQuantity', 0.2] }] },
    });

    res.json({
      success: true,
      data: {
        activeRentals: activeRentals.length,
        overdueRentals: overdueCount,
        totalRevenue,
        pendingPayments,
        totalItemsOut,
        totalInventory,
        lowStock,
        recentRentals,
      },
    });
  } catch (error) {
    next(error);
  }
};
