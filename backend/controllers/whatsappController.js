const Rental = require('../models/Rental');
const {
  rentalCreatedMessage,
  returnSummaryMessage,
  paymentReminderMessage,
  generateWhatsAppLink,
} = require('../utils/whatsappMessage');

const findOrgRental = (id, organizationId) =>
  Rental.findOne({ _id: id, organizationId }).populate('customerId', 'name phone');

// GET /api/whatsapp/rental/:id — both roles
exports.rentalMessage = async (req, res, next) => {
  try {
    const rental = await findOrgRental(req.params.id, req.user.organizationId);
    if (!rental) return res.status(404).json({ success: false, message: 'Rental not found.' });

    const message = rentalCreatedMessage(rental.customerId.name, rental.items, rental.startDate);
    const link = generateWhatsAppLink(rental.customerId.phone, message);
    res.json({ success: true, data: { message, link } });
  } catch (error) {
    next(error);
  }
};

// GET /api/whatsapp/return/:id — both roles
exports.returnMessage = async (req, res, next) => {
  try {
    const rental = await findOrgRental(req.params.id, req.user.organizationId);
    if (!rental) return res.status(404).json({ success: false, message: 'Rental not found.' });

    const message = returnSummaryMessage(rental.customerId.name, rental.totalAmount, rental.amountPaid);
    const link = generateWhatsAppLink(rental.customerId.phone, message);
    res.json({ success: true, data: { message, link } });
  } catch (error) {
    next(error);
  }
};

// GET /api/whatsapp/reminder/:id — OWNER only
exports.reminderMessage = async (req, res, next) => {
  try {
    const rental = await findOrgRental(req.params.id, req.user.organizationId);
    if (!rental) return res.status(404).json({ success: false, message: 'Rental not found.' });

    const pending = Math.max(0, rental.totalAmount - rental.amountPaid);
    const message = paymentReminderMessage(rental.customerId.name, pending);
    const link = generateWhatsAppLink(rental.customerId.phone, message);
    res.json({ success: true, data: { message, link } });
  } catch (error) {
    next(error);
  }
};
