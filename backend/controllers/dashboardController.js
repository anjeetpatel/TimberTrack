const Rental = require('../models/Rental');
const Payment = require('../models/Payment');
const Inventory = require('../models/Inventory');
const { daysBetween } = require('../utils/dateUtils');

const OVERDUE_THRESHOLD = parseInt(process.env.OVERDUE_THRESHOLD_DAYS) || 30;

// GET /api/dashboard/stats — OWNER only
exports.getStats = async (req, res, next) => {
  try {
    const { organizationId } = req.user;
    const now = new Date();

    // Active rentals for this org
    const activeRentals = await Rental.find({ organizationId, status: 'ACTIVE' })
      .populate('customerId', 'name phone');

    let overdueCount = 0;
    let totalItemsOut = 0;
    for (const rental of activeRentals) {
      const currentDays = daysBetween(rental.startDate, now);
      if (currentDays > OVERDUE_THRESHOLD) overdueCount++;
      for (const item of rental.items) {
        totalItemsOut += item.issuedQty - item.returnedQty;
      }
    }

    // Revenue: sum of all payments for this org
    const revenueAgg = await Payment.aggregate([
      { $match: { organizationId: require('mongoose').Types.ObjectId.createFromHexString(organizationId) } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Pending balance: total owed across unpaid/partial rentals for this org
    const pendingAgg = await Rental.aggregate([
      { $match: { organizationId: require('mongoose').Types.ObjectId.createFromHexString(organizationId), paymentStatus: { $in: ['UNPAID', 'PARTIAL'] } } },
      { $group: { _id: null, total: { $sum: { $subtract: ['$totalAmount', '$amountPaid'] } } } },
    ]);
    const pendingPayments = pendingAgg[0]?.total || 0;

    // Inventory summary for this org
    const [totalInventory, lowStock] = await Promise.all([
      Inventory.countDocuments({ organizationId, isDeleted: { $ne: true } }),
      Inventory.countDocuments({
        organizationId,
        isDeleted: { $ne: true },
        $expr: { $lt: ['$availableQuantity', { $multiply: ['$totalQuantity', 0.2] }] },
      }),
    ]);

    // Recent rentals (latest 10, enriched)
    const recentRentals = activeRentals.slice(0, 10).map((r) => {
      const obj = r.toJSON();
      obj.currentDays = daysBetween(r.startDate, now);
      obj.isOverdue = obj.currentDays > OVERDUE_THRESHOLD;
      obj.totalItems = r.items.reduce((sum, item) => sum + item.issuedQty, 0);
      obj.itemsOut = r.items.reduce((sum, item) => sum + (item.issuedQty - item.returnedQty), 0);
      return obj;
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
