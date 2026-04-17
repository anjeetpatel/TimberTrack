const mongoose = require('mongoose');
const Rental = require('../models/Rental');
const Inventory = require('../models/Inventory');
const ReturnTransaction = require('../models/ReturnTransaction');
const { calculateReturnCost } = require('../utils/costCalculator');
const { daysBetween } = require('../utils/dateUtils');

// POST /api/returns — ATOMIC with MongoDB transaction
exports.processReturn = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { rentalId, returnedItems, damageCharges = 0, lostItems = [] } = req.body;

    if (!rentalId || !returnedItems || returnedItems.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Rental ID and at least one return item are required.' });
    }

    const rental = await Rental.findById(rentalId).session(session);
    if (!rental) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Rental not found.' });
    }

    if (rental.status === 'COMPLETED') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'This rental is already completed. All items have been returned.' });
    }

    const returnDate = new Date();

    // Calculate costs using the billing engine
    const { lineItems, totalCost } = calculateReturnCost(rental.items, returnedItems, returnDate);

    // Calculate lost charges
    let totalLostCharges = 0;
    for (const lost of lostItems) {
      const invItem = await Inventory.findById(lost.itemId).session(session);
      if (invItem) {
        totalLostCharges += (lost.qty || 0) * (invItem.itemValue || 0);
      }
    }

    const finalAmount = totalCost + damageCharges + totalLostCharges;

    // Update rental items: returnedQty and lastCalculatedDate
    for (const li of lineItems) {
      const rentalItem = rental.items.find(
        (item) => item.itemId.toString() === li.itemId.toString()
      );
      rentalItem.returnedQty += li.quantityReturned;
      rentalItem.lastCalculatedDate = returnDate;
    }

    // Update rental total amount
    rental.totalAmount += finalAmount;

    // Check if all items fully returned
    const allReturned = rental.items.every((item) => item.returnedQty >= item.issuedQty);
    if (allReturned) {
      rental.status = 'COMPLETED';
    }

    // Update payment status
    if (rental.amountPaid <= 0) {
      rental.paymentStatus = 'UNPAID';
    } else if (rental.amountPaid >= rental.totalAmount) {
      rental.paymentStatus = 'PAID';
    } else {
      rental.paymentStatus = 'PARTIAL';
    }

    await rental.save({ session });

    // Update inventory: increase available quantity for returned items
    for (const li of lineItems) {
      await Inventory.findByIdAndUpdate(
        li.itemId,
        { $inc: { availableQuantity: li.quantityReturned } },
        { session }
      );
    }

    // Create return transaction record
    const returnTx = new ReturnTransaction({
      rentalId,
      returnedItems: lineItems,
      returnDate,
      totalCost,
      damageCharges,
      lostCharges: totalLostCharges,
      finalAmount,
      createdBy: req.user?.id,
    });
    await returnTx.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Return processed successfully!',
      data: {
        returnTransaction: returnTx,
        rentalStatus: rental.status,
        rentalTotalAmount: rental.totalAmount,
        remainingBalance: Math.max(0, rental.totalAmount - rental.amountPaid),
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    // Pass validation errors from costCalculator as 400
    if (error.message.includes('Cannot return') || error.message.includes('not found in this rental')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// GET /api/returns?rentalId=X
exports.getByRental = async (req, res, next) => {
  try {
    const { rentalId } = req.query;
    if (!rentalId) {
      return res.status(400).json({ success: false, message: 'Rental ID is required.' });
    }
    const returns = await ReturnTransaction.find({ rentalId }).sort({ createdAt: -1 });
    res.json({ success: true, data: returns });
  } catch (error) {
    next(error);
  }
};
