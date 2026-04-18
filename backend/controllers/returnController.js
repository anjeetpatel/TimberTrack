const Rental = require('../models/Rental');
const Inventory = require('../models/Inventory');
const ReturnTransaction = require('../models/ReturnTransaction');
const { calculateReturnCost } = require('../utils/costCalculator');
const { withTransaction } = require('../utils/transactionHelper');
const { logActivity } = require('../utils/activityLogger');

// POST /api/returns
exports.processReturn = async (req, res, next) => {
  try {
    const { rentalId, returnedItems, damageCharges = 0, lostItems = [] } = req.body;

    if (!rentalId) return res.status(400).json({ success: false, message: 'Rental ID is required.' });
    if (!returnedItems?.length) return res.status(400).json({ success: false, message: 'At least one return item is required.' });

    const rentalCheck = await Rental.findOne({ _id: rentalId, organizationId: req.user.organizationId });
    if (!rentalCheck) return res.status(404).json({ success: false, message: 'Rental not found.' });
    if (rentalCheck.status === 'COMPLETED') return res.status(400).json({ success: false, message: 'This rental is already completed.' });

    const returnDate = new Date();
    let lineItems, totalCost;
    try {
      ({ lineItems, totalCost } = calculateReturnCost(rentalCheck.items, returnedItems, returnDate));
    } catch (e) {
      return res.status(400).json({ success: false, message: e.message });
    }

    let totalLostCharges = 0;
    for (const lost of lostItems) {
      const invItem = await Inventory.findOne({ _id: lost.itemId, organizationId: req.user.organizationId });
      if (invItem) totalLostCharges += (lost.qty || 0) * (invItem.itemValue || 0);
    }

    const finalAmount = totalCost + Number(damageCharges) + totalLostCharges;

    await withTransaction(async (session) => {
      const saveOpts = session ? { session } : {};
      const rental = session ? await Rental.findById(rentalId).session(session) : await Rental.findById(rentalId);

      for (const li of lineItems) {
        const rentalItem = rental.items.find((item) => item.itemId.toString() === li.itemId.toString());
        rentalItem.returnedQty += li.quantityReturned;
        rentalItem.lastCalculatedDate = returnDate;
      }

      rental.totalAmount += finalAmount;
      const allReturned = rental.items.every((item) => item.returnedQty >= item.issuedQty);
      if (allReturned) rental.status = 'COMPLETED';

      if (rental.amountPaid <= 0) rental.paymentStatus = 'UNPAID';
      else if (rental.amountPaid >= rental.totalAmount) rental.paymentStatus = 'PAID';
      else rental.paymentStatus = 'PARTIAL';

      await rental.save(saveOpts);

      for (const li of lineItems) {
        if (session) {
          await Inventory.findByIdAndUpdate(li.itemId, { $inc: { availableQuantity: li.quantityReturned } }, { session });
        } else {
          await Inventory.findByIdAndUpdate(li.itemId, { $inc: { availableQuantity: li.quantityReturned } });
        }
      }

      const returnTx = new ReturnTransaction({
        organizationId: req.user.organizationId,
        rentalId,
        returnedItems: lineItems,
        returnDate,
        totalCost,
        damageCharges: Number(damageCharges),
        lostCharges: totalLostCharges,
        finalAmount,
        createdBy: req.user.id,
      });
      await returnTx.save(saveOpts);

      req._returnResult = {
        returnTransaction: returnTx,
        rentalStatus: rental.status,
        rentalTotalAmount: rental.totalAmount,
        remainingBalance: Math.max(0, rental.totalAmount - rental.amountPaid),
      };
    });

    logActivity({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userName: req.user.name,
      action: 'RETURN_PROCESSED',
      resourceType: 'Return',
      resourceId: rentalId,
      meta: { amount: finalAmount, itemCount: lineItems.length },
    });

    res.status(201).json({ success: true, message: 'Return processed!', data: req._returnResult });
  } catch (error) {
    next(error);
  }
};

// GET /api/returns?rentalId=X
exports.getByRental = async (req, res, next) => {
  try {
    const { rentalId } = req.query;
    if (!rentalId) return res.status(400).json({ success: false, message: 'Rental ID is required.' });

    // Verify rental belongs to org
    const rental = await Rental.findOne({ _id: rentalId, organizationId: req.user.organizationId });
    if (!rental) return res.status(404).json({ success: false, message: 'Rental not found.' });

    const returns = await ReturnTransaction.find({ rentalId, organizationId: req.user.organizationId }).sort({ createdAt: -1 });
    res.json({ success: true, data: returns });
  } catch (error) {
    next(error);
  }
};
