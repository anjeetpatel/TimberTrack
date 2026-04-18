const Rental = require('../models/Rental');
const ReturnTransaction = require('../models/ReturnTransaction');
const aiService = require('../services/aiService');
const { daysBetween } = require('../utils/dateUtils');

exports.generateBillingSummary = async (req, res, next) => {
  try {
    const { rentalId, tone = 'FRIENDLY', language = 'ENGLISH' } = req.body;

    if (!rentalId) {
      return res.status(400).json({ success: false, message: 'Rental ID is required' });
    }

    const rental = await Rental.findOne({
      _id: rentalId,
      organizationId: req.user.organizationId
    }).populate('customerId');

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found' });
    }

    // 1. Gather all returns to calculate damage/lost explicitly
    const returns = await ReturnTransaction.find({ rentalId: rental._id });
    const damageAndLostCharges = returns.reduce((sum, rx) => sum + (rx.damageCharges || 0) + (rx.lostCharges || 0), 0);
    
    // 2. Pre-calculate running costs of currently unreturned items (for ACTIVE rentals)
    const today = new Date();
    let currentUnreturnedRunningCost = 0;

    if (rental.status === 'ACTIVE') {
      rental.items.forEach(item => {
        const remainingQty = item.issuedQty - (item.returnedQty || 0);
        if (remainingQty > 0) {
          const daysCharged = Math.max(1, daysBetween(item.lastCalculatedDate, today));
          currentUnreturnedRunningCost += remainingQty * item.pricePerDay * daysCharged;
        }
      });
    }

    // 3. Compile the structured context data object that the AI will format
    const aggregatedGrossAmount = rental.totalAmount + currentUnreturnedRunningCost;
    
    // We already add damage and lost charges to rental.totalAmount upon return,
    // so totalDebt is just aggregatedGrossAmount. We just break out damage charges specifically for the invoice clarity.
    
    const summaryData = {
      customerName: rental.customerId.name,
      rentalId: rental._id,
      startDate: new Date(rental.startDate).toLocaleDateString('en-IN'),
      items: rental.items.map(i => ({
        name: i.itemName,
        totalQty: i.issuedQty,
        pricePerDay: i.pricePerDay
      })),
      grossAmount: aggregatedGrossAmount, 
      damageAndLostCharges: damageAndLostCharges,
      totalDebt: aggregatedGrossAmount, // Already includes damage/lost
      amountPaid: rental.amountPaid,
      remainingBalance: Math.max(0, aggregatedGrossAmount - rental.amountPaid),
      paymentStatus: aggregatedGrossAmount <= rental.amountPaid ? 'PAID' : (rental.amountPaid > 0 ? 'PARTIAL' : 'UNPAID')
    };

    // 4. Generate the AI Bill Summary
    const generatedText = await aiService.generateBillingSummary(summaryData, tone, language);

    res.status(200).json({
      success: true,
      data: generatedText
    });
  } catch (err) {
    next(err);
  }
};
